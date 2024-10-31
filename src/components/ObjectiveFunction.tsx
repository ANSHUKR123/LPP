import React from 'react';
import { Variable } from '../types';

interface ObjectiveFunctionProps {
  objective: string;
  objectiveType: string;
  variables: Variable[];
  setObjective: (value: string) => void;
  setObjectiveType: (value: string) => void;
  setVariables: (vars: Variable[]) => void;
}

export function ObjectiveFunction({ 
  objective, 
  objectiveType, 
  variables,
  setObjective, 
  setObjectiveType,
  setVariables
}: ObjectiveFunctionProps) {
  const handleObjectiveChange = (value: string) => {
    setObjective(value);
    // Extract variables from the objective function
    const vars = value.match(/[a-zA-Z]\d*/g) || [];
    const uniqueVars = [...new Set(vars)];
    setVariables(
      uniqueVars.map(name => ({
        name,
        isInteger: variables.find(v => v.name === name)?.isInteger || false
      }))
    );
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Objective Function
        </label>
        <div className="flex gap-4">
          <select
            value={objectiveType}
            onChange={(e) => setObjectiveType(e.target.value)}
            className="w-24 rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="max">Max</option>
            <option value="min">Min</option>
          </select>
          <input
            type="text"
            value={objective}
            onChange={(e) => handleObjectiveChange(e.target.value)}
            placeholder="e.g., 3x1 + 4x2"
            className="flex-1 rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {variables.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Variable Types</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {variables.map((variable) => (
              <div key={variable.name} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`integer-${variable.name}`}
                  checked={variable.isInteger}
                  onChange={(e) => {
                    setVariables(
                      variables.map(v =>
                        v.name === variable.name
                          ? { ...v, isInteger: e.target.checked }
                          : v
                      )
                    );
                  }}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor={`integer-${variable.name}`}
                  className="text-sm text-gray-600"
                >
                  {variable.name} is Integer
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}