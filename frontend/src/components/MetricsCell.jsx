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
  sum: 'Total of selected column (FHE)',
  mean: 'Arithmetic Mean (FHE)',
  variance: 'Variance (FHE)',
  std_deviation: 'Standard deviation (FHE)',
  correlation: 'Feature correlation matrix (ML)',
  anomaly_detection: 'Isolation Forest anomaly detection (ML)'
};

const MetricsCell = ({ results = {}, loadingOperation }) => {
  const operations = ['sum', 'mean', 'variance', 'std_deviation', 'correlation', 'anomaly_detection'];
  
  const hasAnyData = operations.some(op => results[op] || loadingOperation === op);

  if (!hasAnyData) {
    return <span className="text-slate-300 font-mono text-xs select-none">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {operations.map(op => {
        const isComputing = loadingOperation === op;
        const opResult = results[op];

        if (!isComputing && !opResult) return null;

        return (
          <div 
            key={op} 
            className="group relative inline-flex items-center px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50/80 text-[10px] font-mono font-medium text-slate-700 transition-colors hover:border-slate-300"
            title={METRIC_TOOLTIPS[op]}
          >
            <span className="text-slate-400 mr-1">{METRIC_LABELS[op]}:</span>
            {isComputing ? (
              <span className="flex items-center text-sky-600">
                <svg className="animate-spin h-2.5 w-2.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            ) : (
              <>
                {opResult?.json?.version === 'v2' && opResult.json.status === 'success' && opResult.json.result.type === 'correlation' && (
                  <span className="text-slate-900 font-semibold" title={`Strong pairs: ${opResult.json.result.summary.strong_pairs.length}`}>
                    {opResult.json.result.summary.strong_pairs.length} pairs
                  </span>
                )}
                {opResult?.json?.version === 'v2' && opResult.json.status === 'success' && opResult.json.result.type === 'anomaly' && (
                  <span className="text-rose-600 font-semibold" title={`Detected ${opResult.json.result.count} anomalies`}>
                    {opResult.json.result.percentage}%
                  </span>
                )}
                {opResult?.json?.version === 'v2' && opResult.json.status === 'failed' && (
                  <span className="text-rose-500 font-bold" title={`${opResult.json.error_code}: ${opResult.json.message}`}>ERR</span>
                )}
                {/* Legacy V1 Support */}
                {opResult?.json?.type === 'correlation' && opResult?.json?.version !== 'v2' && (
                  <span className="text-slate-900 font-semibold" title={opResult.json.message}>
                    {opResult.json.correlation?.toFixed(3)}
                  </span>
                )}
                {opResult?.json?.type === 'anomaly_detection' && opResult?.json?.version !== 'v2' && (
                  <span className="text-rose-600 font-semibold" title={opResult.json.message}>
                    {opResult.json.anomalies}/{opResult.json.total_rows}
                  </span>
                )}
                {opResult?.json?.type === 'error' && opResult?.json?.version !== 'v2' && (
                  <span className="text-rose-500 font-bold" title={opResult.json.message}>ERR</span>
                )}
                {/* Fallback to simple float result if present */}
                {opResult?.value !== undefined && opResult?.value !== null && !opResult?.json && (
                  <span className="text-slate-900 font-semibold">
                    {typeof opResult.value === 'number' ? opResult.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : opResult.value}
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
