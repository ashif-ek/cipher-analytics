import React, { useState } from 'react';
import client from '../api/client';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    UPLOADING: { color: 'bg-gray-100 text-gray-800 border-gray-200', text: 'Uploading', icon: null },
    PROCESSING: { 
      color: 'bg-yellow-50 text-yellow-800 border-yellow-200', 
      text: 'Processing',
      icon: (
        <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-yellow-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )
    },
    READY: { color: 'bg-green-50 text-green-800 border-green-200', text: 'Ready', icon: null },
    FAILED: { color: 'bg-red-50 text-red-800 border-red-200', text: 'Failed', icon: null },
  };

  const config = statusConfig[status] || statusConfig.UPLOADING;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      {config.icon}
      {config.text}
    </span>
  );
};

const DatasetTable = ({ datasets, loading, onRefresh, onDelete }) => {
  const [deletingId, setDeletingId] = useState(null);
  const [computingId, setComputingId] = useState(null);
  const [results, setResults] = useState({});

  const handleCompute = async (id, operation) => {
    try {
      setComputingId(id);
      const res = await client.post(`datasets/${id}/compute/`, { operation });
      setResults(prev => ({ ...prev, [id]: `${operation.toUpperCase()}: ${res.data.result}` }));
    } catch (error) {
      alert(`Computation failed: ${error.response?.data?.detail || error.message}`);
    } finally {
      setComputingId(null);
    }
  };

  const handleDeleteClick = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete dataset "${name}"? This action cannot be undone.`)) {
      try {
        setDeletingId(id);
        await client.delete(`datasets/${id}/`);
        onDelete(id); // optimistic update
      } catch (error) {
        alert(`Failed to delete dataset: ${error.message}`);
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (loading && datasets.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <svg className="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 flex flex-col mt-8">
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center sm:flex-row flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-gray-900">Your Datasets</h2>
          <p className="text-sm text-gray-500 mt-1">Manage encrypted telemetry and analytics datasets.</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center space-x-2 text-sm text-gray-700 bg-white border border-gray-300 px-3 py-1.5 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <svg className={`h-4 w-4 ${loading ? 'animate-spin text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dataset Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rows</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cols</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Access</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {datasets.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-sm text-gray-500">
                  No datasets uploaded yet. Use the form above to securely ingest a dataset.
                </td>
              </tr>
            ) : (
              datasets.map((dataset) => (
                <tr key={dataset.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{dataset.name}</div>
                    <div className="text-xs text-gray-500">ID: {dataset.id}</div>
                    {results[dataset.id] && (
                      <div className="mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded inline-block">
                        Result: {results[dataset.id]}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={dataset.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dataset.rows_count || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dataset.columns_count || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dataset.access_level}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(dataset.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      {dataset.status === 'READY' && (
                        <>
                          <button
                            onClick={() => handleCompute(dataset.id, 'sum')}
                            disabled={computingId === dataset.id}
                            className="text-xs font-medium text-blue-600 hover:text-blue-900 bg-blue-50 px-2 py-1 rounded border border-blue-200 transition-colors disabled:opacity-50"
                          >
                            {computingId === dataset.id ? '...' : 'Compute Sum'}
                          </button>
                          <button
                            onClick={() => handleCompute(dataset.id, 'mean')}
                            disabled={computingId === dataset.id}
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-2 py-1 rounded border border-indigo-200 transition-colors disabled:opacity-50"
                          >
                            {computingId === dataset.id ? '...' : 'Compute Mean'}
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteClick(dataset.id, dataset.name)}
                        disabled={deletingId === dataset.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 transition-colors ml-2"
                      >
                        {deletingId === dataset.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DatasetTable;
