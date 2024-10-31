import React from 'react';
import { Solution } from '../types';
import Plot from 'react-plotly.js';

interface SolutionDisplayProps {
  solution: Solution;
}

export function SolutionDisplay({ solution }: SolutionDisplayProps) {
  if (!solution || !solution.feasible) return null;

  const variables = Object.entries(solution)
    .filter(([key]) => key.startsWith('x'))
    .sort((a, b) => a[0].localeCompare(b[0]));

  const is2D = variables.length === 2;
  const is3D = variables.length === 3;

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Optimal Solution</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="col-span-full">
            <p className="text-gray-600">Objective Value:</p>
            <p className="font-semibold text-xl">{solution.result.toFixed(4)}</p>
          </div>
          {variables.map(([key, value]) => (
            <div key={key}>
              <p className="text-gray-600">{key}:</p>
              <p className="font-semibold">
                {typeof value === 'number' ? value.toFixed(4) : value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Solution Details</h2>
        <div className="space-y-2">
          <p className="text-gray-600">
            <span className="font-medium">Type:</span>{' '}
            {Object.values(solution).some((v) => typeof v === 'number' && !Number.isInteger(v))
              ? 'Continuous'
              : 'Integer'}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Status:</span>{' '}
            {solution.bounded === false ? 'Unbounded' : 'Optimal'}
          </p>
          {solution.iterations && (
            <p className="text-gray-600">
              <span className="font-medium">Iterations:</span> {solution.iterations}
            </p>
          )}
          <p className="text-gray-600">
            <span className="font-medium">Variables:</span> {variables.length}
          </p>
        </div>
      </div>

      {(is2D || is3D) && (
        <div className="bg-white border border-gray-200 rounded-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Solution Visualization</h2>
          <Plot
            data={[
              {
                x: is3D ? [solution[variables[0][0]]] : [solution[variables[0][0]]],
                y: is3D ? [solution[variables[1][0]]] : [solution[variables[1][0]]],
                z: is3D ? [solution[variables[2][0]]] : undefined,
                type: 'scatter3d',
                mode: 'markers',
                marker: { size: 10, color: 'red' },
                name: 'Optimal Point'
              }
            ]}
            layout={{
              width: 600,
              height: 400,
              title: `${is3D ? '3D' : '2D'} Solution Visualization`,
              scene: is3D ? {
                xaxis: { title: variables[0][0] },
                yaxis: { title: variables[1][0] },
                zaxis: { title: variables[2][0] }
              } : undefined,
              xaxis: !is3D ? { title: variables[0][0] } : undefined,
              yaxis: !is3D ? { title: variables[1][0] } : undefined
            }}
          />
        </div>
      )}
    </div>
  );
}