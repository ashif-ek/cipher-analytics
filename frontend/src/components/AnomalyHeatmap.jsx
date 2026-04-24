import React from 'react';
import ReactECharts from 'echarts-for-react';

/**
 * Renders Top-15 anomalies vs Features.
 * Uses Z-score intensity (Blue-White-Red palette).
 */
const AnomalyHeatmap = ({ data, onRowClick, activeRowId }) => {
  const { top_anomalies, features, deviation_matrix } = data;

  if (!top_anomalies || !features || !deviation_matrix) {
    return <div className="p-10 text-center text-slate-400">Invalid anomaly data structure.</div>;
  }

  // Transform data for ECharts: [featureIndex, anomalyIndex, zScore]
  const chartData = [];
  deviation_matrix.forEach((row, rowIdx) => {
    row.forEach((val, colIdx) => {
      chartData.push([colIdx, rowIdx, val]);
    });
  });

  const option = {
    tooltip: {
      position: 'top',
      formatter: (params) => {
        const val = params.data[2];
        return `
          <div class="p-2">
            <div class="text-xs font-bold text-slate-400 uppercase mb-1">Anomaly Instance</div>
            <div class="text-sm font-bold text-slate-800 mb-2">Row Index: ${top_anomalies[params.data[1]]}</div>
            <div class="flex items-center justify-between border-t border-slate-100 pt-1">
              <span class="text-xs text-slate-500 mr-4">${features[params.data[0]]}</span>
              <span class="text-sm font-mono font-bold ${val > 0 ? 'text-rose-600' : 'text-blue-600'}">${val > 0 ? '+' : ''}${val.toFixed(2)}σ</span>
            </div>
          </div>
        `;
      }
    },
    grid: {
      top: 40,
      bottom: 60,
      left: 80,
      right: 20,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: features,
      axisLabel: { rotate: 45, fontSize: 10, interval: 0 },
      splitArea: { show: true }
    },
    yAxis: {
      type: 'category',
      data: top_anomalies.map(id => `Row ${id}`),
      inverse: true,
      splitArea: { show: true }
    },
    visualMap: {
      min: -4,
      max: 4,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      inRange: {
        // High-contrast Blue -> Slate (Neutral) -> Deep Red (Anomaly)
        color: ['#1e40af', '#f1f5f9', '#b91c1c']
      }
    },
    series: [{
      name: 'Deviation',
      type: 'heatmap',
      data: chartData,
      label: {
        show: false // Removed to reduce clutter. Data is accessible via tooltip.
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
          borderRadius: 2
      }
    }]
  };

  const onChartClick = (params) => {
     if (params.componentType === 'series') {
        const rowId = top_anomalies[params.data[1]];
        onRowClick(rowId);
     }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm h-full flex flex-col">
      <div className="mb-4">
        <h4 className="text-sm font-bold text-slate-800 tracking-tight">Anomaly Intensity Heatmap (Z-Scores)</h4>
        <p className="text-[10px] text-slate-500 font-medium">Click an anomaly row to investigate feature-level contributions.</p>
      </div>
      <div className="flex-1">
        <ReactECharts 
          option={option} 
          style={{ height: '100%', width: '100%' }}
          onEvents={{ 'click': onChartClick }}
        />
      </div>
    </div>
  );
};

export default AnomalyHeatmap;
