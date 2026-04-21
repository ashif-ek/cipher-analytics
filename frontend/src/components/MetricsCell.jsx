import React from 'react';

const METRIC_LABELS = {
  sum: 'SUM',
  mean: 'MEAN',
  variance: 'VAR',
  std_deviation: 'STD',
  correlation: 'CORR',
  anomaly_detection: 'ANML'
};

const METRIC_TOOLTIPS = {
  sum: 'Total of selected column',
  mean: 'Average value',
  variance: 'Variance',
  std_deviation: 'Standard deviation',
  correlation: 'Strongest feature correlation',
  anomaly_detection: 'Detected anomalies'
};

const MetricsCell = ({ results = {}, loadingOperation }) => {
  const operations = ['sum', 'mean', 'variance', 'std_deviation', 'correlation', 'anomaly_detection'];
  
  const hasAnyData = operations.some(op => results[op] || loadingOperation === op);

  if (!hasAnyData) {
    return <span className="text-slate-400 font-medium">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {operations.map(op => {
        const isComputing = loadingOperation === op;
        const opResult = results[op];

        if (!isComputing && !opResult) return null;

        return (
          <div 
            key={op} 
            className="group relative inline-flex items-center px-2 py-0.5 rounded-[4px] border border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-600 transition-all hover:border-slate-300 shadow-sm animate-fade-in"
            title={METRIC_TOOLTIPS[op]}
          >
            <span className="text-slate-400 mr-1.5">{METRIC_LABELS[op]}</span>
            {isComputing ? (
              <span className="flex items-center text-blue-600">
                <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            ) : (
              <>
                {opResult?.json?.version === 'v2' && opResult.json.status === 'success' && opResult.json.result.type === 'correlation' && (
                  <span className="text-slate-900 font-mono" title={`Strong pairs: ${opResult.json.result.summary.strong_pairs.length}`}>
                    {opResult.json.result.summary.strong_pairs.length} Strong
                  </span>
                )}
                {opResult?.json?.version === 'v2' && opResult.json.status === 'success' && opResult.json.result.type === 'anomaly' && (
                  <span className="text-red-600 font-mono font-bold" title={`Detected ${opResult.json.result.count} anomalies`}>
                    {opResult.json.result.percentage}%
                  </span>
                )}
                {opResult?.json?.version === 'v2' && opResult.json.status === 'failed' && (
                   <span className="text-red-500 font-mono font-bold" title={`${opResult.json.error_code}: ${opResult.json.message}`}>ERR</span>
                )}
                {/* Legacy V1 Support */}
                {opResult?.json?.type === 'correlation' && opResult?.json?.version !== 'v2' && (
                  <span className="text-slate-900 font-mono" title={opResult.json.message}>
                    {opResult.json.correlation?.toFixed(4)}
                  </span>
                )}
                {opResult?.json?.type === 'anomaly_detection' && opResult?.json?.version !== 'v2' && (
                  <span className="text-red-600 font-mono font-bold" title={opResult.json.message}>
                    {opResult.json.anomalies}/{opResult.json.total_rows}
                  </span>
                )}
                {opResult?.json?.type === 'error' && opResult?.json?.version !== 'v2' && (
                   <span className="text-red-500 font-mono font-bold" title={opResult.json.message}>ERR</span>
                )}
                {!opResult?.json && (
                  <span className="text-slate-900 font-mono">
                    {typeof opResult?.value === 'number' ? opResult.value.toFixed(4) : opResult?.value}
                  </span>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MetricsCell;
