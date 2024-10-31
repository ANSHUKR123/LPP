import React from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Constraint } from '../types';

interface ConstraintListProps {
  constraints: Constraint[];
  addConstraint: () => void;
  removeConstraint: (id: string) => void;
  updateConstraint: (id: string, field: keyof Constraint, value: string) => void;
}

export function ConstraintList({
  constraints,
  addConstraint,
  removeConstraint,
  updateConstraint
}: ConstraintListProps) {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Constraints
        </label>
        <button
          onClick={addConstraint}
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
        >
          <PlusCircle className="w-5 h-5" />
          Add Constraint
        </button>
      </div>
      
      {constraints.map((constraint) => (
        <div key={constraint.id} className="flex gap-2 mb-3">
          <input
            type="text"
            value={constraint.lhs}
            onChange={(e) => updateConstraint(constraint.id, 'lhs', e.target.value)}
            placeholder="e.g., 2x1 + 3x2"
            className="flex-1 rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <select
            value={constraint.operator}
            onChange={(e) => updateConstraint(constraint.id, 'operator', e.target.value)}
            className="w-20 rounded-md border border-gray-300 shadow-sm px-2 py-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="<=">&le;</option>
            <option value=">=">&ge;</option>
            <option value="=">=</option>
          </select>
          <input
            type="text"
            value={constraint.rhs}
            onChange={(e) => updateConstraint(constraint.id, 'rhs', e.target.value)}
            placeholder="RHS"
            className="w-32 rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {constraints.length > 1 && (
            <button
              onClick={() => removeConstraint(constraint.id)}
              className="text-red-500 hover:text-red-700 p-2"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}