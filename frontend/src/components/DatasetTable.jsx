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
    if (sortField !== field) return <svg className="w-4 h-4 ml-1 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>;
    if (sortDirection === 'asc') return <svg className="w-4 h-4 ml-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>;
    return <svg className="w-4 h-4 ml-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
      
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="relative rounded-md shadow-sm max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              type="text"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2"
              placeholder="Search datasets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select 
            className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="READY">Ready</option>
            <option value="PROCESSING">Processing</option>
            <option value="FAILED">Failed</option>
          </select>
          <select 
            className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={accessFilter}
            onChange={(e) => setAccessFilter(e.target.value)}
          >
            <option value="ALL">All Access Levels</option>
            <option value="PRIVATE">Private</option>
            <option value="SHARED">Shared</option>
            <option value="AGGREGATED">Aggregated</option>
          </select>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <svg className={`-ml-1 mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer group hover:bg-slate-100" onClick={() => handleSort('name')}>
                <div className="flex items-center">Dataset Name <SortIcon field="name" /></div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer group hover:bg-slate-100" onClick={() => handleSort('status')}>
                <div className="flex items-center">Status <SortIcon field="status" /></div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Rows / Cols
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer group hover:bg-slate-100" onClick={() => handleSort('access_level')}>
                <div className="flex items-center">Access <SortIcon field="access_level" /></div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer group hover:bg-slate-100" onClick={() => handleSort('created_at')}>
                <div className="flex items-center">Created <SortIcon field="created_at" /></div>
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {loading && datasets.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                  <div className="flex justify-center flex-col items-center">
                    <svg className="animate-spin h-8 w-8 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Loading datasets...
                  </div>
                </td>
              </tr>
            ) : filteredAndSortedDatasets.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                  <h3 className="mt-2 text-sm font-medium text-slate-900">No datasets found</h3>
                  <p className="mt-1 text-sm text-slate-500">Get started by uploading a new dataset.</p>
                </td>
              </tr>
            ) : (
              filteredAndSortedDatasets.map((dataset) => (
                <tr key={dataset.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900"><Link to={`/datasets/${dataset.id}`} className="hover:text-indigo-600 hover:underline">{dataset.name}</Link></div>
                        <div className="text-xs text-slate-500">ID: {dataset.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={dataset.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <span className="font-medium text-slate-900">{dataset.rows_count || '-'}</span> 
                    <span className="text-slate-400 mx-1">/</span> 
                    {dataset.columns_count || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <StatusBadge status={dataset.access_level} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(dataset.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                       <Link
                          to={`/datasets/${dataset.id}`}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors"
                        >
                          View Details
                        </Link>
                      {dataset.status === 'READY' && (
                        <>
                          <button
                            onClick={() => handleCompute(dataset.id, 'sum')}
                            disabled={computingId === dataset.id}
                            className="text-xs font-medium text-blue-600 hover:text-blue-900 bg-blue-50 px-2.5 py-1.5 rounded-md border border-blue-200 transition-colors disabled:opacity-50"
                          >
                            {computingId === dataset.id ? '...' : 'Sum'}
                          </button>
                          <button
                            onClick={() => handleCompute(dataset.id, 'mean')}
                            disabled={computingId === dataset.id}
                            className="text-xs font-medium text-emerald-600 hover:text-emerald-900 bg-emerald-50 px-2.5 py-1.5 rounded-md border border-emerald-200 transition-colors disabled:opacity-50"
                          >
                            {computingId === dataset.id ? '...' : 'Mean'}
                          </button>
                        </>
                      )}
                      {deletingId === dataset.id ? (
                         <span className="text-xs text-red-500 animate-pulse px-2">Deleting...</span>
                      ) : (
                        <button
                          onClick={() => handleDeleteClick(dataset)}
                          className="text-slate-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors focus:outline-none"
                          title="Delete Dataset"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
        title="Computation Complete"
        variant="success"
        message={
          <div className="py-2">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
              <span className="text-sm text-slate-500 font-medium">Data Asset</span>
              <span className="text-sm text-slate-900 font-bold">{computationResult?.datasetName}</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-500 font-medium">Operation</span>
              <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 bg-emerald-100 text-emerald-700 rounded border border-emerald-200">
                {computationResult?.operation}
              </span>
            </div>
            <div className="mt-6 p-8 bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl text-center">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">Homomorphic Result</span>
              <span className="text-5xl font-black text-white tracking-tighter">
                {typeof computationResult?.result === 'number' 
                  ? computationResult.result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })
                  : 'N/A'}
              </span>
            </div>
            <p className="mt-6 text-[10px] text-slate-400 text-center leading-relaxed">
              This value was derived entirely within the encrypted domain using CKKS Homomorphic Encryption. 
              The server processed the data without decryption.
            </p>
          </div>
        }
        confirmText="Acknowledge"
        onConfirm={() => setShowResultModal(false)}
      />
    </div>
  );
};

export default DatasetTable;
