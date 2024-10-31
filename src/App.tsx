import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
import { ObjectiveFunction } from './components/ObjectiveFunction';
import { ConstraintList } from './components/ConstraintList';
import { SolutionDisplay } from './components/SolutionDisplay';
import { solveLPP } from './utils/lpSolver';
import { Constraint, Solution, Variable } from './types';

function App() {
  const [objective, setObjective] = useState('');
  const [objectiveType, setObjectiveType] = useState('max');
  const [variables, setVariables] = useState<Variable[]>([]);
  const [constraints, setConstraints] = useState<Constraint[]>([
    { id: '1', lhs: '', operator: '<=', rhs: '' }
  ]);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [error, setError] = useState('');

  const addConstraint = () => {
    setConstraints([
      ...constraints,
      { id: Date.now().toString(), lhs: '', operator: '<=', rhs: '' }
    ]);
  };

  const removeConstraint = (id: string) => {
    if (constraints.length > 1) {
      setConstraints(constraints.filter(c => c.id !== id));
    }
  };

  const updateConstraint = (id: string, field: keyof Constraint, value: string) => {
    setConstraints(
      constraints.map(c => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleSolve = () => {
    try {
      const result = solveLPP(objective, objectiveType, constraints, variables);
      setSolution(result);
      setError(result.error || '');
    } catch (e) {
      setError('Error solving the problem. Please check your inputs.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-8">
          <Calculator className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-800">Linear & Integer Programming Solver</h1>
        </div>

        <ObjectiveFunction
          objective={objective}
          objectiveType={objectiveType}
          variables={variables}
          setObjective={setObjective}
          setObjectiveType={setObjectiveType}
          setVariables={setVariables}
        />

        <ConstraintList
          constraints={constraints}
          addConstraint={addConstraint}
          removeConstraint={removeConstraint}
          updateConstraint={updateConstraint}
        />

        <button
          onClick={handleSolve}
          className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700 transition-colors duration-200 mb-6"
        >
          Solve Problem
        </button>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
            {error}
          </div>
        )}

        {solution && solution.feasible && <SolutionDisplay solution={solution} />}
      </div>
    </div>
  );
}

export default App;