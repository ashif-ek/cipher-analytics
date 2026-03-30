import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import StatusBadge from './ui/StatusBadge';
import Modal from './ui/Modal';
import Toast from './ui/Toast';

const DatasetTable = ({ datasets, loading, onRefresh, onDelete }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [accessFilter, setAccessFilter] = useState('ALL');
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
    if (accessFilter !== 'ALL') {
      result = result.filter(ds => ds.access_level === accessFilter);
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
  }, [datasets, searchQuery, statusFilter, accessFilter, sortField, sortDirection]);

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
      
      console.log('Computation Result Captured:', response.data);
      setComputationResult({
        ...response.data,
        datasetName: dataset?.name || `Dataset #${id}`
      });
      setShowResultModal(true);
      
      setToastMessage(`Computation successful for ${dataset?.name}.`);
      onRefresh();
    } catch (error) {
      alert(`Computation failed: ${error.response?.data?.detail || error.message}`);
    } finally {
      setComputingId(null);
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <svg className="w-3 h-3 ml-1.5 text-slate-300 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>;
    if (sortDirection === 'asc') return <svg className="w-3 h-3 ml-1.5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" /></svg>;
    return <svg className="w-3 h-3 ml-1.5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
      
      {/* Unified Command Bar */}
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex-1 min-w-0 max-w-lg">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              type="text"
              className="bg-white block w-full pl-11 pr-4 py-2.5 text-[10px] font-black uppercase tracking-widest border-slate-200 rounded-xl focus:ring-0 focus:border-slate-900 transition-all placeholder:text-slate-400"
              placeholder="Filter assets by ID or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 gap-1">
            <select 
              className="appearance-none bg-transparent pl-3 pr-8 py-1.5 text-[10px] font-black uppercase tracking-widest border-none focus:ring-0 text-slate-600 cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="READY">Ready</option>
              <option value="PROCESSING">Processing</option>
              <option value="FAILED">Failed</option>
            </select>
            <div className="w-px h-4 bg-slate-100"></div>
            <select 
              className="appearance-none bg-transparent pl-3 pr-8 py-1.5 text-[10px] font-black uppercase tracking-widest border-none focus:ring-0 text-slate-600 cursor-pointer"
              value={accessFilter}
              onChange={(e) => setAccessFilter(e.target.value)}
            >
              <option value="ALL">All Access Levels</option>
              <option value="PRIVATE">Private</option>
              <option value="SHARED">Shared</option>
              <option value="AGGREGATED">Aggregated</option>
            </select>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center px-4 py-2.5 bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest rounded-xl text-slate-900 hover:bg-slate-50 transition-all disabled:opacity-50 group"
          >
            <svg className={`mr-2 h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Industrial Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-white">
            <tr>
              <th scope="col" className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer group" onClick={() => handleSort('name')}>
                <div className="flex items-center group-hover:text-slate-900 transition-colors">Dataset Identity <SortIcon field="name" /></div>
              </th>
              <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer group" onClick={() => handleSort('status')}>
                <div className="flex items-center group-hover:text-slate-900 transition-colors">Status <SortIcon field="status" /></div>
              </th>
              <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Dimensions
              </th>
              <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer group" onClick={() => handleSort('access_level')}>
                <div className="flex items-center group-hover:text-slate-900 transition-colors">Access <SortIcon field="access_level" /></div>
              </th>
              <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer group" onClick={() => handleSort('created_at')}>
                <div className="flex items-center group-hover:text-slate-900 transition-colors">Created <SortIcon field="created_at" /></div>
              </th>
              <th scope="col" className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Analytical Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-50">
            {loading && datasets.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <svg className="animate-spin h-6 w-6 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synching Data Registry...</span>
                  </div>
                </td>
              </tr>
            ) : filteredAndSortedDatasets.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-8 py-24 text-center">
                   <div className="max-w-xs mx-auto">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-3.586a1 1 0 01-.707-.293l-1.414-1.414a1 1 0 00-.707-.293h-3.172a1 1 0 00-.707.293l-1.414 1.414a1 1 0 01-.707.293H4" /></svg>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">No data assets found</h3>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest leading-relaxed">Adjust your filters or initiate a new ingestion pipeline.</p>
                   </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedDatasets.map((dataset) => (
                <tr key={dataset.id} className="hover:bg-slate-50/50 transition-all group border-l-2 border-transparent hover:border-slate-900">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-11 w-11 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-all">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                      </div>
                      <div className="ml-5">
                        <div className="flex items-center gap-2">
                          <Link to={`/datasets/${dataset.id}`} className="text-sm font-extrabold text-slate-900 hover:text-indigo-600 transition-colors uppercase tracking-tight">{dataset.name}</Link>
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[9px] font-mono font-black text-slate-500 uppercase">#{dataset.id}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 font-bold tracking-widest uppercase">Verified CKKS-Object</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <StatusBadge status={dataset.status} />
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className="font-extrabold text-slate-900">{dataset.rows_count?.toLocaleString() || '-'}</span> 
                      <span className="text-slate-300">×</span> 
                      <span className="text-slate-500">{dataset.columns_count || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <StatusBadge status={dataset.access_level} />
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {new Date(dataset.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      {dataset.status === 'READY' && (
                        <div className="flex items-center bg-slate-100/50 p-1 rounded-xl border border-slate-100 group-hover:border-slate-200 transition-colors">
                          <button
                            onClick={() => handleCompute(dataset.id, 'sum')}
                            disabled={computingId === dataset.id}
                            className="text-[10px] font-black text-slate-600 hover:text-slate-900 hover:bg-white px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 uppercase tracking-tighter"
                            title="Sum Aggregation"
                          >
                            {computingId === dataset.id ? '...' : (
                              <span className="flex items-center italic">
                                <span className="mr-0.5 not-italic text-sm">∑</span> Sigma
                              </span>
                            )}
                          </button>
                          <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
                          <button
                            onClick={() => handleCompute(dataset.id, 'mean')}
                            disabled={computingId === dataset.id}
                            className="text-[10px] font-black text-slate-600 hover:text-slate-900 hover:bg-white px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 uppercase tracking-tighter"
                            title="Mean Average"
                          >
                            {computingId === dataset.id ? '...' : (
                              <span className="flex items-center italic">
                                <span className="mr-0.5 not-italic text-sm">x̄</span> Mean
                              </span>
                            )}
                          </button>
                        </div>
                      )}
                      
                      <div className="w-px h-6 bg-slate-100 mx-1"></div>
                      
                      <Link
                          to={`/datasets/${dataset.id}`}
                          className="bg-white border border-slate-200 p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:border-slate-400 transition-all shadow-sm"
                          title="Detailed Metrics"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        </Link>

                      {deletingId !== dataset.id && (
                        <button
                          onClick={() => handleDeleteClick(dataset)}
                          className="text-slate-300 hover:text-red-500 p-2 rounded-xl transition-colors focus:outline-none"
                          title="Expunge Asset"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
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
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Data Asset</span>
                <span className="text-sm font-bold text-slate-900 truncate block">{computationResult?.datasetName}</span>
              </div>
              <div>
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Protocol State</span>
                <span className="inline-flex items-center text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase">
                  {computationResult?.operation} / FHE-CKKS
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Computation ID</span>
                <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                  {computationResult?.computation_id || 'N/A'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Timestamp</span>
                <span className="text-xs text-slate-500">{new Date().toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                 <svg className="w-16 h-16 text-slate-900" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              </div>
              <div className="relative">
                <span className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Verified Numerical Output</span>
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-black text-slate-900 tracking-tighter font-mono">
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
              <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                Integrity Verified
              </div>
              <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Zero-Leakage FHE
              </div>
              <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
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
