import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './ui/StatusBadge';
import MetricsCell from './MetricsCell';
import ComputeDropdown from './ComputeDropdown';
import client from '../api/client';

const DatasetRow = ({ dataset, isResearcher, onDeleteClick, setToastMessage }) => {
  const getInitialResults = () => {
    let localResults = {};
    try {
      const stored = localStorage.getItem(`cipher_ds_metrics_${dataset.id}`);
      if (stored) {
        localResults = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse local compute results', e);
    }
    
    // Always merge the backend's last known result as ground truth if it exists
    if (dataset.last_operation) {
      const op = dataset.last_operation.toLowerCase();
      // Only set if we have a real value or it's an ML operation that we might not have a float for locally
      if (dataset.last_result !== null) {
        if (!localResults[op]) localResults[op] = {};
        localResults[op] = { ...localResults[op], value: dataset.last_result, timestamp: new Date().toISOString() };
      }
    }
    return localResults;
  };

  const [rowState, setRowState] = useState({
    loading: null,
    results: getInitialResults(),
    error: null
  });

  useEffect(() => {
    if (Object.keys(rowState.results).length > 0) {
      localStorage.setItem(`cipher_ds_metrics_${dataset.id}`, JSON.stringify(rowState.results));
    } else {
      localStorage.removeItem(`cipher_ds_metrics_${dataset.id}`);
    }
  }, [rowState.results, dataset.id]);
  
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleCompute = async (operation) => {
    try {
      setRowState(prev => ({ ...prev, loading: operation, error: null }));
      
      const response = await client.post(`datasets/${dataset.id}/compute/`, { operation });
      const jobId = response.data.job_id;
      setToastMessage(`Job #${jobId} queued. Processing FHE ${operation}...`);

      // Polling for completion
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds max
      const pollInterval = setInterval(async () => {
        try {
          attempts++;
          const jobRes = await client.get(`datasets/jobs/${jobId}/`);
          
          if (jobRes.data.status === 'COMPLETED') {
            clearInterval(pollInterval);
            setRowState(prev => ({
              ...prev,
              loading: null,
              results: {
                ...prev.results,
                [operation]: {
                  value: jobRes.data.result_value,
                  json: jobRes.data.result_json,
                  timestamp: new Date().toISOString()
                }
              }
            }));
            setToastMessage(`Computation successful for ${dataset.name}.`);
          } else if (jobRes.data.status === 'FAILED') {
            clearInterval(pollInterval);
            setRowState(prev => ({ ...prev, loading: null, error: 'Computation failed' }));
          } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setRowState(prev => ({ ...prev, loading: null, error: 'Timeout' }));
          }
        } catch (err) {
          console.error(`Polling error for dataset ${dataset.id}:`, err);
        }
      }, 2000);

    } catch (error) {
       setRowState(prev => ({ ...prev, loading: null, error: 'Failed to start' }));
       setToastMessage(`Computation failed: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleClear = () => {
    setRowState(prev => ({ ...prev, results: {}, error: null }));
  };

  return (
    <tr className="hover:bg-slate-50/80 transition-all group relative">
      <td className="px-5 py-3 whitespace-nowrap border-r border-slate-50 group-hover:border-slate-100">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 bg-slate-50 rounded-[4px] flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200 transition-all">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          </div>
          <div className="ml-3 min-w-0">
            <Link to={`/datasets/${dataset.id}`} className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline block truncate">{dataset.name}</Link>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono text-slate-400">res-{dataset.id.toString().padStart(5, '0')}</span>
            </div>
            {rowState.error && (
               <span className="text-[9px] font-bold text-red-500 mt-0.5 block">⚠ {rowState.error}</span>
            )}
          </div>
        </div>
      </td>
      <td className="px-5 py-3 whitespace-nowrap border-r border-slate-50">
        <StatusBadge status={dataset.status} />
      </td>
      <td className="px-5 py-3 whitespace-nowrap border-r border-slate-50">
        <div className="flex items-center font-mono text-[11px] text-slate-600">
          <span className="font-bold text-slate-900">{(dataset.rows_count || 0).toLocaleString()}</span> 
          <span className="mx-1 text-slate-300">×</span> 
          <span>{dataset.columns_count || 0}</span>
        </div>
      </td>
      <td className="px-5 py-3 whitespace-nowrap border-r border-slate-50">
        <StatusBadge status={dataset.visibility} />
      </td>
      <td className="px-5 py-3 whitespace-nowrap border-r border-slate-50 text-[11px] font-bold text-slate-600">
        {dataset.access_policy === 'STRICT' ? (
           <div className="flex items-center text-red-600">
             <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
             GATED
           </div>
        ) : (
           <div className="flex items-center text-emerald-600">
             <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
             OPEN
           </div>
        )}
      </td>
      <td className="px-5 py-3 whitespace-nowrap border-r border-slate-50">
        <span className="text-[10px] font-mono text-slate-500">
          {new Date(dataset.created_at).toISOString().split('T')[0]}
        </span>
      </td>
      <td className="px-5 py-3 whitespace-nowrap border-r border-slate-50 min-w-[200px]">
         <MetricsCell results={rowState.results} loadingOperation={rowState.loading} />
      </td>
      <td className="px-5 py-3 whitespace-nowrap text-right">
        <div className="flex items-center justify-end space-x-3">
          {dataset.status === 'READY' && (
             <ComputeDropdown 
               disabled={dataset.access_policy === 'STRICT' && isResearcher}
               isComputing={rowState.loading !== null}
               isOpen={dropdownOpen}
               onToggle={setDropdownOpen}
               onCompute={handleCompute}
               onClear={handleClear}
             />
          )}

          <div className="w-[1px] h-4 bg-slate-200"></div>

          <button
            onClick={() => onDeleteClick(dataset)}
            className="p-1.5 text-slate-300 hover:text-red-600 rounded-[2px] transition-colors"
            title="TERMINATE RESOURCE"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default DatasetRow;
