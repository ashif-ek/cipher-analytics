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
      setToastMessage(`Dataset "${datasetToDelete.name}" purged successfully.`);
    } catch (error) {
      alert(`Failed to delete dataset: ${error.message}`);
    } finally {
      setDeletingId(null);
      setDatasetToDelete(null);
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return (
        <svg className="w-3 h-3 ml-1 text-slate-300 group-hover:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    if (sortDirection === 'asc') {
      return (
        <svg className="w-3 h-3 ml-1 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
        </svg>
      );
    }
    return (
      <svg className="w-3 h-3 ml-1 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-md shadow-[0_1px_2px_0_rgba(15,23,42,0.04)] flex flex-col overflow-hidden">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
      
      {/* Search and Filters Toolbar */}
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5 flex-1 min-w-0">
          <div className="relative w-full max-w-xs group">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-600">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Filter by name or ID::XXXX..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded text-xs py-1.5 px-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          >
            <option value="ALL">Status: All</option>
            <option value="READY">Ready</option>
            <option value="PROCESSING">Processing</option>
            <option value="FAILED">Failed</option>
            <option value="UPLOADING">Uploading</option>
          </select>

          {/* Visibility Filter */}
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="border border-slate-300 rounded text-xs py-1.5 px-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          >
            <option value="ALL">Visibility: All</option>
            <option value="PRIVATE">Private</option>
            <option value="DISCOVERABLE">Discoverable</option>
          </select>
        </div>

        {/* Refresh & Item Count */}
        <div className="flex items-center space-x-3 shrink-0">
          <span className="text-[11px] font-mono text-slate-400">
            {datasets.length} {datasets.length === 1 ? 'artifact' : 'artifacts'}
          </span>
          <button
            onClick={onRefresh}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
            title="Refresh Catalog"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Datasets Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 text-slate-500 text-[10px] font-mono uppercase tracking-wider select-none">
            <tr>
              <th 
                className="px-5 py-2.5 text-left font-semibold cursor-pointer group"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  <span>Dataset Entity</span>
                  <SortIcon field="name" />
                </div>
              </th>
              <th 
                className="px-5 py-2.5 text-left font-semibold cursor-pointer group"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  <span>Encryption State</span>
                  <SortIcon field="status" />
                </div>
              </th>
              <th 
                className="px-5 py-2.5 text-left font-semibold cursor-pointer group"
                onClick={() => handleSort('visibility')}
              >
                <div className="flex items-center">
                  <span>Governance Policy</span>
                  <SortIcon field="visibility" />
                </div>
              </th>
              <th className="px-5 py-2.5 text-left font-semibold">
                FHE Analytical Insights
              </th>
              <th className="px-5 py-2.5 text-right font-semibold">
                Execution
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100 text-xs">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-5 py-12 text-center text-slate-400 font-mono text-xs">
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-4 w-4 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading cryptographic catalog...</span>
                  </div>
                </td>
              </tr>
            ) : datasets.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-5 py-12 text-center text-slate-400">
                  <div className="max-w-xs mx-auto text-center space-y-1">
                    <div className="font-medium text-slate-600 text-xs">No matching datasets located</div>
                    <div className="text-[11px] text-slate-400">Upload a CSV or adjust active filter criteria to display assets.</div>
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
                  onRequestAccess={onRequestAccess}
                  setToastMessage={setToastMessage}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Purge Cryptographic Dataset"
        variant="danger"
        message={
          <div>
            <p>Are you sure you want to delete <strong className="text-slate-900">{datasetToDelete?.name}</strong>?</p>
            <p className="mt-2 text-[11px] text-slate-500 font-mono">
              All associated encrypted ciphertext files, column profiles, and cached computation jobs will be purged irreversibly.
            </p>
          </div>
        }
        confirmText="Confirm Purge"
      />
    </div>
  );
};

export default DatasetTable;
