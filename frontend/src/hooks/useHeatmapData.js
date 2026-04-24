import { useMemo } from 'react';

/**
 * Transforms correlation matrix JSON into an efficient ECharts heatmap format.
 * Executes purely O(n^2) scaling directly bounding raw metrics.
 * 
 * @param {Object} matrix Expects { columns: string[], values: number[][] }
 * @param {Object} options Configuration flags like { strongOnly: boolean }
 * @returns {Object} { chartData, columns }
 */
export function useHeatmapData(matrix, options = { strongOnly: false }) {
  return useMemo(() => {
    // Graceful exception bounds
    if (!matrix || !matrix.columns || !matrix.values) {
      return { chartData: [], columns: [] };
    }

    const { columns, values } = matrix;
    const chartData = [];
    const numRows = values.length;
    // Since correlation is symmetric, columns.length matches dimension breadth
    const numCols = columns.length;

    // O(n^2) Transformation block bounds directly against numeric matrices
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            let val = values[i][j];
            
            // Filter configuration. ECharts natively isolates '-' into invisible blocks ensuring we don't skew visual scaling maps.
            if (options.strongOnly && Math.abs(val) < 0.7) {
                val = '-';
            }
            
            // Format constraint required by ECharts Heatmap topology: [xIndex, yIndex, value]
            // We map indices correctly so Y axis reads sequentially from top origin downwards when paired with Y-axis inverse scaling
            chartData.push([j, i, val]); 
        }
    }

    return { chartData, columns };
  }, [matrix, options.strongOnly]); // Optimization: Re-rerun solely on deep structural edits or filter trigger.
}
