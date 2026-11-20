import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import DatasetTable from '../components/DatasetTable';
import useWebSockets from '../hooks/useWebSockets';
import Modal from '../components/ui/Modal';

const Datasets = () => {
  const [datasets, setDatasets] = useState([]);
  const [loadingDatasets, setLoadingDatasets] = useState(true);

  // Lifted filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [visibilityFilter, setVisibilityFilter] = useState('ALL');
  const [policyFilter, setPolicyFilter] = useState('ALL');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Request Access Modal State
  const [requestModal, setRequestModal] = useState({ isOpen: false, dataset: null, reason: '' });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchDatasets = useCallback(async () => {
    try {
        setLoadingDatasets(true);
        const response = await client.get('datasets/', { 
            params: {
                q: debouncedSearch,
                status: statusFilter,
                visibility: visibilityFilter,
                sort_field: sortField,
                sort_dir: sortDirection
            }
        });
        setDatasets(response.data);
    } catch (error) {
        console.error("Failed to fetch datasets", error);
    } finally {
        setLoadingDatasets(false);
    }
  }, [debouncedSearch, statusFilter, visibilityFilter, sortField, sortDirection]);

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  // Real-time updates via WebSockets
  useWebSockets(useCallback((message) => {
    if (message.type === 'DATASET_STATUS_UPDATED') {
      fetchDatasets();
    }
  }, [fetchDatasets]));

  const handleDelete = (deletedId) => {
    setDatasets(prev => prev.filter(ds => ds.id !== deletedId));
  };

  const handleRequestAccess = async () => {
    const { dataset, reason } = requestModal;
    if (!reason.trim()) {
        alert("Please provide a reason for the access request.");
        return;
    }

    try {
        const response = await client.post('research/requests/', { 
            dataset: dataset.id,
            reason: reason
        });
        
        // Update local state to show pending
        setDatasets(prev => prev.map(ds => 
            ds.id === dataset.id ? { ...ds, pending_request: true } : ds
        ));
        
        setRequestModal({ isOpen: false, dataset: null, reason: '' });
        console.log("Access request sent successfully", response.data);
    } catch (error) {
        console.error("Failed to request access", error);
        alert(`Request failed: ${error.response?.data?.detail || error.message}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Technical Header & Ingestion Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">
            <span>REPOSITORY</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">DATASET REGISTRY</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Encrypted Dataset Inventory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographic storage, differential privacy parameters, and homomorphic compute registry.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex flex-col items-end px-3 py-1.5 rounded border border-slate-200 bg-white">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Registered Assets</span>
            <span className="text-xs font-mono font-bold text-slate-900">{datasets.length} Objects</span>
          </div>
          <Link
            to="/upload"
            className="inline-flex items-center px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium rounded transition-colors shadow-sm"
          >
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ingest Dataset
          </Link>
        </div>
      </div>

      <div className="px-0 sm:px-0">
        <DatasetTable 
          datasets={datasets} 
          loading={loadingDatasets} 
          onRefresh={fetchDatasets} 
          onDelete={handleDelete}
          onRequestAccess={(ds) => setRequestModal({ isOpen: true, dataset: ds, reason: '' })}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          visibilityFilter={visibilityFilter}
          setVisibilityFilter={setVisibilityFilter}
          policyFilter={policyFilter}
          setPolicyFilter={setPolicyFilter}
          sortField={sortField}
          setSortField={setSortField}
          sortDirection={sortDirection}
          setSortDirection={setSortDirection}
        />

        {/* Request Access Modal */}
        <Modal 
          isOpen={requestModal.isOpen}
          onClose={() => setRequestModal({ isOpen: false, dataset: null, reason: '' })}
          onConfirm={handleRequestAccess}
          title="Request Dataset Access"
          confirmText="Send Request"
          size="md"
          message={
            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                You are requesting access to <span className="font-bold text-slate-900">{requestModal.dataset?.name}</span>. 
                Please explain why you need this data and how you plan to use it.
              </p>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">Justification / Research Goal</label>
                <textarea 
                  className="w-full h-32 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none"
                  placeholder="e.g. Analyzing transaction patterns to detect multi-stage fraud anomalies..."
                  value={requestModal.reason}
                  onChange={(e) => setRequestModal(prev => ({ ...prev, reason: e.target.value }))}
                />
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default Datasets;
