import React from 'react';
import ReactECharts from 'echarts-for-react';

/**
 * Renders Top-10 SHAP impact factors for a single row.
 * Includes loading states and tooltips.
 */
const ShapBarChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-8 flex flex-col items-center justify-center h-full animate-pulse">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-4"></div>
        <p className="text-sm font-bold text-slate-500">Extracting SLAP Explanations...</p>
        <p className="text-[10px] text-slate-400 mt-1">Analyzing feature contributions via TreeExplainer</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-8 flex flex-col items-center justify-center h-full text-center">
        <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <p className="text-sm font-bold text-slate-500">Investigation Panel</p>
        <p className="text-[10px] text-slate-400 mt-1">Select an anomaly from the heatmap to view causal factors.</p>
      </div>
    );
  }

  const { features, shap_values, feature_values, feature_baseline } = data;

  // Features are already sorted by absolute SHAP in backend
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const item = params[0];
        const idx = item.dataIndex;
        const impact = shap_values[idx];
        return `
          <div class="p-2 min-w-[180px]">
             <div class="text-[10px] font-bold text-slate-400 uppercase mb-2">${features[idx]}</div>
             <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-slate-500">Impact Score:</span>
                <span class="text-sm font-black ${impact > 0 ? 'text-rose-600' : 'text-emerald-600'}">
                  ${impact > 0 ? '+' : ''}${impact.toFixed(3)}
                </span>
             </div>
             <div class="space-y-1.5 border-t border-slate-100 pt-2">
                <div class="flex justify-between text-xs">
                  <span class="text-slate-400">Observed:</span>
                  <span class="font-mono font-bold text-slate-800">${feature_values[idx].toFixed(2)}</span>
                </div>
                <div class="flex justify-between text-xs">
                  <span class="text-slate-400">Baseline (Avg):</span>
                  <span class="font-mono text-slate-500">${feature_baseline[idx].toFixed(2)}</span>
                </div>
             </div>
             <div class="mt-3 text-[10px] italic text-slate-400 leading-tight">
               Higher values ${impact > 0 ? 'drove this case towards anomaly' : 'pushed this case towards normal'}
             </div>
          </div>
        `;
      }
    },
    grid: {
      left: 10,
      right: 40,
      top: 10,
      bottom: 20,
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { type: 'dashed', color: '#e2e8f0' } }
    },
    yAxis: {
      type: 'category',
      data: features,
      inverse: true, // Show largest impact at top
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { 
        fontSize: 10, 
        fontWeight: 600, 
        color: '#475569',
        width: 100,
        overflow: 'truncate'
      }
    },
    series: [
      {
        name: 'Impact',
        type: 'bar',
        data: shap_values,
        itemStyle: {
          color: (params) => params.data > 0 ? '#ef4444' : '#10b981',
          borderRadius: [0, 4, 4, 0]
        },
        label: {
          show: true,
          position: 'right',
          formatter: (p) => p.data > 0 ? `+${p.data.toFixed(2)}` : p.data.toFixed(2),
          fontSize: 9,
          fontWeight: 700
        }
      }
    ]
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm h-full flex flex-col">
       <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-2">
          <h4 className="text-sm font-bold text-slate-800 tracking-tight">Feature-Level Contributions (SHAP)</h4>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
            Row ${data.row_id} Explainer
          </span>
       </div>
       <div className="flex-1">
          <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
       </div>
    </div>
  );
};

export default ShapBarChart;
