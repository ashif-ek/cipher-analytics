import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useHeatmapData } from '../hooks/useHeatmapData';

/**
 * Production-ready Correlation Heatmap visual renderer.
 * Operates gracefully across thousands of bounds preventing main-thread UI stalling.
 */
const CorrelationHeatmap = ({ data }) => {
  // Production toggle handling
  const [strongOnly, setStrongOnly] = useState(false);
  
  // Safely extract v2 schemas or fallback cleanly
  const matrix = data?.result?.matrix || data?.matrix; 

  // Transform safely
  const { chartData, columns } = useHeatmapData(matrix, { strongOnly });

  // 1. Guard against empty data
  if (!chartData.length || !columns.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50 text-sm font-medium text-slate-500 shadow-sm">
        Processing valid correlation matrix parameters...
      </div>
    );
  }

  // 2. Performance boundary constraints (Max ~10,000 plot units)
  const isTooLarge = columns.length > 100;
  if (isTooLarge) {
    return (
      <div className="flex h-64 items-center justify-center rounded border border-red-200 bg-red-50 text-red-600 font-bold px-4 text-center shadow-sm">
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        Dimensionality Error: Feature matrix exceeds rendering bounds ({columns.length} &gt; 100 features). Utilize dimension reduction strategies.
      </div>
    );
  }

  // 3. Build dynamic configuration structures based on scale complexity
  const option = {
    tooltip: {
      position: 'top',
      borderWidth: 0,
      backgroundColor: 'rgba(255,255,255,0.95)',
      textStyle: { color: '#1e293b' },
      extraCssText: 'box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); border-radius: 8px;',
      formatter: function (params) {
        // [xIndex, yIndex, rawValue]
        const val = params.data[2];
        if (val === '-') return `<span class="italic text-slate-400">Relationship mathematically dropped by filter threshold.</span>`;
        
        return `
          <div class="font-sans font-medium text-sm text-slate-800 p-1">
            <span class="text-xs tracking-wider uppercase text-slate-400 font-bold mb-1 block">Feature Variance Pair</span>
            <div class="flex items-center justify-between space-x-6 border-b border-slate-100 pb-2 mb-2">
               <strong>${columns[params.data[0]]}</strong> 
               <svg class="w-3 h-3 text-slate-400 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
               <strong>${columns[params.data[1]]}</strong>
            </div>
            Correlation Value: <span class="${val < 0 ? 'text-red-500' : val > 0.5 ? 'text-emerald-600' : 'text-slate-900'} font-black text-base ml-1 block mt-0.5">${Number(val).toFixed(3)}</span>
          </div>
        `;
      }
    },
    grid: {
      top: 70,
      bottom: 100, 
      left: 10, 
      right: 10,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: columns,
      splitArea: { show: true },
      axisLabel: {
        interval: 0,
        rotate: 45, 
        align: 'right',
        padding: [0, 8, 0, 0],
        width: 80, 
        overflow: 'truncate',
        fontSize: Math.max(9, 13 - (columns.length * 0.08)), // Fluid type scale reduction under geometric density
        color: '#64748b',
        fontWeight: 600
      },
      axisLine: { lineStyle: { color: '#e2e8f0' } }
    },
    yAxis: {
      type: 'category',
      data: columns,
      splitArea: { show: true },
      inverse: true, // Forces matrix origin to classic top-left configuration internally
      axisLabel: {
        width: 120, // Force truncation natively
        overflow: 'truncate',
        fontSize: Math.max(9, 13 - (columns.length * 0.08)), 
        color: '#64748b',
        fontWeight: 600
      },
      axisLine: { lineStyle: { color: '#e2e8f0' } }
    },
    visualMap: {
      min: -1,
      max: 1,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      top: 0,
      textStyle: { fontWeight: 600, color: '#475569' },
      itemWidth: 15,
      itemHeight: 180,
      inRange: {
        // Red (-1) -> Light Gray (0) -> Green (1)
        color: ['#dc2626', '#f3f4f6', '#16a34a']
      }
    },
    series: [
      {
        name: 'Pearson Matrix',
        type: 'heatmap',
        data: chartData,
        label: {
          show: columns.length <= 15, // Hide aggressive inline labels directly if board is too geometrically complex. rely purely on visualMap.
          formatter: function(p) {
             if (p.data[2] === '-') return '';
             if (p.data[2] === 1) return '1.0';
             return Number(p.data[2]).toFixed(2);
          },
          fontSize: Math.max(8, 12 - (columns.length * 0.2)),
          color: function(params) {
              const val = Math.abs(params.data[2]);
              return val > 0.6 ? '#ffffff' : '#334155'; // Ensure contrast visibility against deep hue bases
          },
          fontWeight: 700
        },
        itemStyle: {
            borderColor: 'white',
            borderWidth: 2, // Hard contrasting splits natively 
            borderRadius: 2
        },
        emphasis: {
          itemStyle: {
            borderWidth: 0,
            shadowBlur: 15,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          }
        }
      }
    ]
  };

  // Determine an adaptive minimum safe height to avoid vertical axis crushing. Base block is 450.
  const dynamicHeight = Math.max(500, columns.length * 35 + 150);

  return (
    <div className="flex flex-col space-y-4 w-full bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
           <h3 className="text-lg font-black text-slate-800 tracking-tight">Feature Correlation Heatmap</h3>
           <p className="text-xs text-slate-500 font-medium mt-0.5">Geometric pairwise mapping matrix over Pearson boundaries</p>
        </div>
        <label className="flex items-center space-x-2.5 text-sm font-bold text-slate-600 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors px-3 py-1.5 rounded-md border border-slate-200">
          <input 
            type="checkbox" 
            checked={strongOnly} 
            onChange={(e) => setStrongOnly(e.target.checked)} 
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition shadow-sm"
          />
          <span>Isolate Strong Signatures &ge; |0.7|</span>
        </label>
      </div>
      
      {/* Container mounts perfectly enforcing bounded constraints preventing clipping anomalies. */}
      <div style={{ height: dynamicHeight }} className="w-full relative mt-2">
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          notMerge={true}
          lazyUpdate={true}
        />
      </div>
    </div>
  );
};

export default CorrelationHeatmap;
