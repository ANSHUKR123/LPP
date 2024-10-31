import { evaluate } from 'mathjs';
import { solve } from 'javascript-lp-solver';
import { Constraint, Solution, Variable } from '../types';

function parseExpression(expr: string): Record<string, number> {
  try {
    const terms = expr.replace(/\s+/g, '').match(/[+-]?\d*\.?\d*[a-zA-Z]\d*/g) || [];
    return terms.reduce((acc: Record<string, number>, term) => {
      const coeff = term.match(/^[+-]?\d*\.?\d*/) || ['1'];
      const variable = term.match(/[a-zA-Z]\d*$/)?.[0] || '';
      const value = coeff[0] === '' || coeff[0] === '+' ? 1 :
                    coeff[0] === '-' ? -1 :
                    parseFloat(coeff[0]);
      acc[variable] = value;
      return acc;
    }, {});
  } catch (e) {
    throw new Error('Invalid expression format');
  }
}

function roundToTolerance(value: number, tolerance: number = 1e-10): number {
  return Math.round(value / tolerance) * tolerance;
}

function createModel(
  objective: string,
  objectiveType: string,
  constraints: Constraint[],
  variables: Variable[],
  additionalConstraints: Record<string, any> = {}
) {
  return {
    optimize: parseExpression(objective),
    opType: objectiveType,
    constraints: {
      ...constraints.reduce((acc: Record<string, any>, c) => {
        acc[`c${c.id}`] = {
          ...parseExpression(c.lhs),
          [c.operator]: parseFloat(c.rhs)
        };
        return acc;
      }, {}),
      ...additionalConstraints
    },
    variables: variables.reduce((acc: Record<string, any>, v) => {
      acc[v.name] = { isInteger: v.isInteger };
      return acc;
    }, {}),
    options: {
      tolerance: 1e-10
    }
  };
}

function branchAndBound(
  objective: string,
  objectiveType: string,
  constraints: Constraint[],
  variables: Variable[],
  bestSolution: Solution | null = null,
  depth: number = 0
): Solution | null {
  // Solve relaxed LP
  const model = createModel(objective, objectiveType, constraints, variables);
  const relaxedSolution = solve(model) as Solution;

  // Check if solution exists and is better than current best
  if (!relaxedSolution.feasible || 
      (bestSolution && 
       ((objectiveType === 'max' && relaxedSolution.result <= bestSolution.result) ||
        (objectiveType === 'min' && relaxedSolution.result >= bestSolution.result)))) {
    return bestSolution;
  }

  // Check if all integer variables are actually integers
  const integerVars = variables.filter(v => v.isInteger);
  const nonIntegerVar = integerVars.find(v => {
    const value = relaxedSolution[v.name];
    return value && Math.abs(Math.round(value) - value) > 1e-10;
  });

  // If all integer variables are integers, we found a better solution
  if (!nonIntegerVar) {
    return relaxedSolution;
  }

  // Branch on first non-integer variable
  const value = relaxedSolution[nonIntegerVar.name];
  const floor = Math.floor(value);
  const ceil = Math.ceil(value);

  // Create new constraints for both branches
  const lowerBranch = [...constraints];
  const upperBranch = [...constraints];

  lowerBranch.push({
    id: `b${depth}l`,
    lhs: `${nonIntegerVar.name}`,
    operator: '<=',
    rhs: floor.toString()
  });

  upperBranch.push({
    id: `b${depth}u`,
    lhs: `${nonIntegerVar.name}`,
    operator: '>=',
    rhs: ceil.toString()
  });

  // Recursively solve both branches
  const lowerSolution = branchAndBound(
    objective,
    objectiveType,
    lowerBranch,
    variables,
    bestSolution,
    depth + 1
  );

  const upperSolution = branchAndBound(
    objective,
    objectiveType,
    upperBranch,
    variables,
    lowerSolution || bestSolution,
    depth + 1
  );

  // Return the best solution found
  if (!lowerSolution && !upperSolution) return bestSolution;
  if (!lowerSolution) return upperSolution;
  if (!upperSolution) return lowerSolution;

  return objectiveType === 'max'
    ? (lowerSolution.result > upperSolution.result ? lowerSolution : upperSolution)
    : (lowerSolution.result < upperSolution.result ? lowerSolution : upperSolution);
}

export function solveLPP(
  objective: string,
  objectiveType: string,
  constraints: Constraint[],
  variables: Variable[]
): Solution {
  try {
    // Check if we have any integer variables
    const hasIntegerVars = variables.some(v => v.isInteger);

    if (!hasIntegerVars) {
      // Solve as regular LP
      const model = createModel(objective, objectiveType, constraints, variables);
      const result = solve(model);
      return result as Solution;
    } else {
      // Solve using Branch and Bound
      const result = branchAndBound(objective, objectiveType, constraints, variables);
      
      if (!result) {
        return {
          feasible: false,
          result: 0,
          error: 'No feasible integer solution found'
        };
      }

      // Round integer variables to exact integers
      variables.forEach(v => {
        if (v.isInteger && result[v.name]) {
          result[v.name] = Math.round(result[v.name]);
        }
      });

      return result;
    }
  } catch (error) {
    return {
      feasible: false,
      result: 0,
      error: 'Error solving the problem: ' + (error as Error).message
    };
  }
}