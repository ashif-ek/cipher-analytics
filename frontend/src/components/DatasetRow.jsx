import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './ui/StatusBadge';
import MetricsCell from './MetricsCell';
import ComputeDropdown from './ComputeDropdown';
import client from '../api/client';

const DatasetRow = ({ dataset, isResearcher, onDeleteClick, onRequestAccess, setToastMessage }) => {
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
    
    // Merge the backend's last known result as ground truth if it exists
    if (dataset.last_operation) {
      const op = dataset.last_operation.toLowerCase();
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
            setRowState(prev => ({
              ...prev,
              loading: null,
              error: 'Computation failed on worker.'
            }));
            setToastMessage(`Computation failed for ${dataset.name}.`);
          } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setRowState(prev => ({
              ...prev,
              loading: null,
              error: 'Operation timed out.'
            }));
            setToastMessage(`Operation timed out for ${dataset.name}. Check details.`);
          }
        } catch (pollErr) {
          console.error('Polling error', pollErr);
        }
      }, 1000);

    } catch (error) {
      setRowState(prev => ({
        ...prev,
        loading: null,
        error: error.response?.data?.detail || 'Failed to dispatch compute job'
      }));
      setToastMessage(error.response?.data?.detail || 'Compute dispatch failed.');
    }
  };

  const handleClearResults = () => {
    setRowState(prev => ({ ...prev, results: {} }));
    localStorage.removeItem(`cipher_ds_metrics_${dataset.id}`);
    setToastMessage(`Results cleared for ${dataset.name}.`);
  };

  return (
    <tr className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0">
      {/* Dataset Identity & ID */}
      <td className="px-5 py-3.5 whitespace-nowrap">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-500 shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
          <div className="min-w-0">
            <Link 
              to={`/datasets/${dataset.id}`}
              className="text-xs font-semibold text-slate-900 hover:text-sky-600 transition-colors block truncate max-w-xs"
            >
              {dataset.name}
            </Link>
            <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400 mt-0.5">
              <span>ID::{dataset.id.toString().padStart(4, '0')}</span>
              <span>•</span>
              <span>{dataset.rows_count.toLocaleString()} rows</span>
              <span>•</span>
              <span>{dataset.columns_count} cols</span>
            </div>
          </div>
        </div>
      </td>

      {/* Encryption & Ingestion Status */}
      <td className="px-5 py-3.5 whitespace-nowrap">
        <StatusBadge status={dataset.status} errorMessage={dataset.error_message} />
      </td>

      {/* Governance & Compute Mode */}
      <td className="px-5 py-3.5 whitespace-nowrap">
        <div className="flex items-center space-x-1.5">
          <StatusBadge status={dataset.compute_mode || 'STRICT'} />
          <StatusBadge status={dataset.visibility || 'PRIVATE'} />
        </div>
      </td>

      {/* Live Computed Metrics */}
      <td className="px-5 py-3.5 whitespace-nowrap">
        <MetricsCell 
          results={rowState.results} 
          loadingOperation={rowState.loading} 
        />
        {rowState.error && (
          <div className="text-[10px] text-rose-500 font-mono mt-1">{rowState.error}</div>
        )}
      </td>

      {/* Actions */}
      <td className="px-5 py-3.5 whitespace-nowrap text-right">
        <div className="flex items-center justify-end space-x-2">
          {/* Researcher without grant -> Request button */}
          {isResearcher && !dataset.has_access && (
            <button
              onClick={() => onRequestAccess(dataset)}
              disabled={dataset.request_pending}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                dataset.request_pending 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
              }`}
            >
              {dataset.request_pending ? 'Pending Grant' : 'Request Access'}
            </button>
          )}

          {/* Compute Controls (Owner or authorized researcher) */}
          {(!isResearcher || dataset.has_access) && (
            <ComputeDropdown 
              disabled={dataset.status !== 'READY'}
              isComputing={!!rowState.loading}
              isOpen={dropdownOpen}
              onToggle={setDropdownOpen}
              onCompute={handleCompute}
              onClear={handleClearResults}
            />
          )}

          {/* View Details Link */}
          <Link
            to={`/datasets/${dataset.id}`}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
            title="Inspect Artifact Details"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {/* Delete Action (Owners only) */}
          {!isResearcher && onDeleteClick && (
            <button
              onClick={() => onDeleteClick(dataset)}
              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
              title="Delete Dataset"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default DatasetRow;
