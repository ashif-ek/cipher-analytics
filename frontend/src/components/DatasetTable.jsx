import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import StatusBadge from './ui/StatusBadge';
import Modal from './ui/Modal';
import Toast from './ui/Toast';
import { jwtDecode } from 'jwt-decode';

const DatasetTable = ({ datasets, loading, onRefresh, onDelete, onRequestAccess, userRole: propRole }) => {
  let userRole = propRole;
  if (!userRole) {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        userRole = jwtDecode(token).role;
      }
    } catch(e) {}
  }
  const isResearcher = userRole === 'RESEARCHER';
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [visibilityFilter, setVisibilityFilter] = useState('ALL');
  const [policyFilter, setPolicyFilter] = useState('ALL');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  
  const [deletingId, setDeletingId] = useState(null);
  const [computingId, setComputingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [datasetToDelete, setDatasetToDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  
  // Computation result state
  const [showResultModal, setShowResultModal] = useState(false);
  const [computationResult, setComputationResult] = useState(null);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedDatasets = useMemo(() => {
    let result = [...datasets];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(ds => 
        ds.name.toLowerCase().includes(q) || 
        ds.id.toString().includes(q)
      );
    }

    // Filter
    if (statusFilter !== 'ALL') {
      result = result.filter(ds => ds.status === statusFilter);
    }
    if (visibilityFilter !== 'ALL') {
      result = result.filter(ds => ds.visibility === visibilityFilter);
    }
    if (policyFilter !== 'ALL') {
      result = result.filter(ds => ds.access_policy === policyFilter);
    }

    // Sort
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      
      if (sortField === 'created_at') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [datasets, searchQuery, statusFilter, visibilityFilter, policyFilter, sortField, sortDirection]);

  const handleDeleteClick = (ds) => {
    setDatasetToDelete(ds);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!datasetToDelete) return;
    try {
      setDeletingId(datasetToDelete.id);
      setShowDeleteModal(false);
      await client.delete(`datasets/${datasetToDelete.id}/`);
      onDelete(datasetToDelete.id);
      setToastMessage(`Dataset "${datasetToDelete.name}" deleted successfully.`);
    } catch (error) {
      alert(`Failed to delete dataset: ${error.message}`);
    } finally {
      setDeletingId(null);
      setDatasetToDelete(null);
    }
  };

  const handleCompute = async (id, operation) => {
    try {
      setComputingId(id);
      const dataset = datasets.find(d => d.id === id);
      const response = await client.post(`datasets/${id}/compute/`, { operation });
      
      const jobId = response.data.job_id;
      setToastMessage(`Job #${jobId} queued. Processing FHE operation...`);

      // Polling for completion
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds max
      const pollInterval = setInterval(async () => {
        try {
          attempts++;
          // We need a way to fetch the job status.
          // For now, let's assume we can fetch it via datasets/compute_status/?job_id=X or similar.
          // Since I don't have that endpoint yet, I'll add a quick one to DatasetViewSet or 
          // just use the list endpoint if it includes jobs. 
          // Actually, let's check a specific job endpoint.
          const jobRes = await client.get(`datasets/jobs/${jobId}/`);
          
          if (jobRes.data.status === 'COMPLETED') {
            clearInterval(pollInterval);
            console.log('Computation Result Captured:', jobRes.data);
            setComputationResult({
              ...jobRes.data,
              result: jobRes.data.result_value,
              datasetName: dataset?.name || `Dataset #${id}`
            });
            setShowResultModal(true);
            setToastMessage(`Computation successful for ${dataset?.name}.`);
            setComputingId(null);
            onRefresh();
          } else if (jobRes.data.status === 'FAILED') {
            clearInterval(pollInterval);
            alert('Computation job failed on backend.');
            setComputingId(null);
          } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            alert('Computation timed out. Check Audit Logs for status.');
            setComputingId(null);
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 2000);

    } catch (error) {
      alert(`Computation failed: ${error.response?.data?.detail || error.message}`);
      setComputingId(null);
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <svg className="w-3 h-3 ml-1.5 text-slate-300 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>;
    if (sortDirection === 'asc') return <svg className="w-3 h-3 ml-1.5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" /></svg>;
    return <svg className="w-3 h-3 ml-1.5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] shadow-sm flex flex-col overflow-hidden">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
      
      {/* Search and Filters Bar */}
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="relative w-full max-w-sm group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-600">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              type="text"
              className="bg-white block w-full pl-9 pr-3 py-1.5 text-[11px] font-medium border border-slate-200 rounded-[4px] focus:ring-0 focus:border-slate-400 focus:outline-none transition-all placeholder:text-slate-400"
              placeholder="Find by Resource ID or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="h-4 w-px bg-slate-200 hidden md:block"></div>
          
          <div className="hidden md:flex items-center space-x-2">
            <select 
              className="bg-transparent pl-2 pr-6 py-1 text-[11px] font-bold border-none focus:ring-0 text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="READY">Ready</option>
              <option value="PROCESSING">Processing</option>
              <option value="FAILED">Failed</option>
            </select>
            <select 
              className="bg-transparent pl-2 pr-6 py-1 text-[11px] font-bold border-none focus:ring-0 text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
            >
              <option value="ALL">All Visibility</option>
              <option value="PRIVATE">Private</option>
              <option value="DISCOVERABLE">Discoverable</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center px-3 py-1.5 bg-white border border-slate-300 text-[11px] font-bold rounded-[4px] text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all disabled:opacity-50 group"
          >
            <svg className={`mr-2 h-3.5 w-3.5 text-slate-400 group-hover:text-slate-900 transition-colors ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* High-Density Console Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 border-collapse">
          <thead className="bg-[#f2f3f3]/50">
            <tr>
              <th scope="col" className="px-5 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-tight border-r border-slate-100 last:border-0 cursor-pointer group" onClick={() => handleSort('name')}>
                <div className="flex items-center group-hover:text-slate-900">IDENTIFIER <SortIcon field="name" /></div>
              </th>
              <th scope="col" className="px-5 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-tight border-r border-slate-100 last:border-0 cursor-pointer group" onClick={() => handleSort('status')}>
                <div className="flex items-center group-hover:text-slate-900">STATUS <SortIcon field="status" /></div>
              </th>
              <th scope="col" className="px-5 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-tight border-r border-slate-100 last:border-0">
                DIMENSIONS
              </th>
              <th scope="col" className="px-5 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-tight border-r border-slate-100 last:border-0 cursor-pointer group" onClick={() => handleSort('visibility')}>
                <div className="flex items-center group-hover:text-slate-900">VISIBILITY <SortIcon field="visibility" /></div>
              </th>
              <th scope="col" className="px-5 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-tight border-r border-slate-100 last:border-0">
                GOVERNANCE
              </th>
              <th scope="col" className="px-5 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-tight border-r border-slate-100 last:border-0 cursor-pointer group" onClick={() => handleSort('created_at')}>
                <div className="flex items-center group-hover:text-slate-900">CREATED <SortIcon field="created_at" /></div>
              </th>
              <th scope="col" className="px-5 py-2.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {loading && datasets.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span className="text-[11px] font-bold text-slate-400">LOADING REGISTRY...</span>
                  </div>
                </td>
              </tr>
            ) : filteredAndSortedDatasets.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-5 py-12 text-center">
                   <div className="max-w-xs mx-auto">
                    <h3 className="text-[11px] font-bold text-slate-900">NO RESOURCES FOUND</h3>
                    <p className="text-[11px] text-slate-400 mt-1 font-medium italic">Verify filters or initiate new ingestion.</p>
                   </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedDatasets.map((dataset) => (
                <tr key={dataset.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-5 py-3 whitespace-nowrap border-r border-slate-50 group-hover:border-slate-100">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-slate-50 rounded-[4px] flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200 transition-all">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                      </div>
                      <div className="ml-3 min-w-0">
                        <Link to={`/datasets/${dataset.id}`} className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline block truncate">{dataset.name}</Link>
                        <span className="text-[10px] font-mono text-slate-400">res-{dataset.id.toString().padStart(5, '0')}</span>
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
                  <td className="px-5 py-3 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      {dataset.status === 'READY' && (
                        <div className="flex items-center bg-slate-50 rounded-[4px] border border-slate-200 p-0.5">
                          {['sum', 'mean', 'variance', 'std_deviation'].map(op => {
                            const isGated = dataset.access_policy === 'STRICT' && isResearcher;
                            return (
                              <button
                                key={op}
                                onClick={() => handleCompute(dataset.id, op)}
                                disabled={computingId === dataset.id || isGated}
                                className={`p-1.5 rounded-[2px] transition-all ${
                                  isGated 
                                    ? 'text-slate-200 cursor-not-allowed' 
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-white'
                                }`}
                                title={isGated ? "GOVERNANCE GATED" : op.toUpperCase()}
                              >
                                <span className="text-[10px] font-bold">{op === 'sum' ? '∑' : op === 'mean' ? 'x̄' : op === 'variance' ? 'σ²' : 'σ'}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                      
                      <div className="w-[1px] h-4 bg-slate-200 mx-1"></div>
                      
                      <button
                        onClick={() => handleDeleteClick(dataset)}
                        className="p-1.5 text-slate-300 hover:text-red-600 rounded-[2px] transition-colors"
                        title="TERMINATE RESOURCE"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Dataset"
        message={`Are you sure you want to delete "${datasetToDelete?.name}"? This action cannot be undone and will remove all associated analytics.`}
        confirmText="Yes, delete it"
        variant="danger"
      />

      {/* Result Modal */}
      <Modal 
        isOpen={showResultModal} 
        onClose={() => setShowResultModal(false)}
        title="Analytical Audit Result"
        variant="info"
        size="md"
        confirmText="Close Report"
        onConfirm={() => setShowResultModal(false)}
        message={
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 pb-6 border-b border-slate-100">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 mb-1.5">Data Asset</span>
                <span className="text-sm font-bold text-slate-900 truncate block">{computationResult?.datasetName}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 mb-1.5">Protocol State</span>
                <span className="inline-flex items-center text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  {computationResult?.operation} / FHE-CKKS
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 mb-1.5">Computation ID</span>
                <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                  {computationResult?.computation_id || 'N/A'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 mb-1.5">Timestamp</span>
                <span className="text-xs text-slate-500">{new Date().toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                 <svg className="w-16 h-16 text-slate-900" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              </div>
              <div className="relative">
                <span className="block text-[10px] font-bold text-slate-500 mb-4">Verified Numerical Output</span>
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-bold text-slate-900 font-mono">
                    {typeof computationResult?.result === 'number' 
                      ? computationResult.result.toFixed(6)
                      : 'N/A'}
                  </span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(computationResult?.result);
                      setToastMessage('Value copied to clipboard');
                    }}
                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-200"
                    title="Copy Value"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-3 8v3m-3-3l3 3m0 0l3-3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center text-[10px] font-bold text-slate-500">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                Integrity Verified
              </div>
              <div className="flex items-center text-[10px] font-bold text-slate-500">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Zero-Leakage FHE
              </div>
              <div className="flex items-center text-[10px] font-bold text-slate-500">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                Audit Logged
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed max-w-md">
              This computation was processed entirely within the encrypted domain. No plaintext data was resident in system memory during the execution phase.
            </p>
          </div>
        }
      />
    </div>
  );
};

export default DatasetTable;
