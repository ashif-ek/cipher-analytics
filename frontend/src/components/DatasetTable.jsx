import React, { useState } from 'react';
import client from '../api/client';
import Modal from './ui/Modal';
import Toast from './ui/Toast';
import { jwtDecode } from 'jwt-decode';
import DatasetRow from './DatasetRow';

const DatasetTable = ({ 
  datasets, loading, onRefresh, onDelete, onRequestAccess, userRole: propRole,
  searchQuery, setSearchQuery,
  statusFilter, setStatusFilter,
  visibilityFilter, setVisibilityFilter,
  policyFilter, setPolicyFilter,
  sortField, setSortField,
  sortDirection, setSortDirection
}) => {
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
  
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [datasetToDelete, setDatasetToDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

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
              <th scope="col" className="px-5 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-tight border-r border-slate-100 last:border-0">
                COMPUTED METRICS
              </th>
              <th scope="col" className="px-5 py-2.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {loading && datasets.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span className="text-[11px] font-bold text-slate-400">LOADING REGISTRY...</span>
                  </div>
                </td>
              </tr>
            ) : datasets.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-5 py-12 text-center">
                   <div className="max-w-xs mx-auto">
                    <h3 className="text-[11px] font-bold text-slate-900">NO RESOURCES FOUND</h3>
                    <p className="text-[11px] text-slate-400 mt-1 font-medium italic">Verify filters or initiate new ingestion.</p>
                   </div>
                </td>
              </tr>
            ) : (
              datasets.map((dataset) => (
                <DatasetRow 
                  key={dataset.id}
                  dataset={dataset}
                  isResearcher={isResearcher}
                  onDeleteClick={handleDeleteClick}
                  setToastMessage={setToastMessage}
                />
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
    </div>
  );
};

export default DatasetTable;
