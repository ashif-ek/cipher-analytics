import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import DatasetTable from '../components/DatasetTable';
import useWebSockets from '../hooks/useWebSockets';

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

  const handleRequestAccess = async (dataset) => {
    try {
        const response = await client.post('research/requests/', { 
            dataset: dataset.id,
            reason: "Standard research analysis request."
        });
        
        // Update local state to show pending
        setDatasets(prev => prev.map(ds => 
            ds.id === dataset.id ? { ...ds, pending_request: true } : ds
        ));
        
        console.log("Access request sent successfully", response.data);
    } catch (error) {
        console.error("Failed to request access", error);
        alert(`Request failed: ${error.response?.data?.detail || error.message}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative -mx-4 px-4 sm:-mx-8 sm:px-8 py-8 bg-slate-50/50 border-b border-slate-200 -mt-8 mb-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900">Dataset Registry</h1>
            <p className="text-sm text-slate-500 font-medium max-w-xl leading-relaxed">
              Consolidated command center for ingestion, metadata governance, and secure FHE analytics.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex flex-col items-end mr-6">
              <span className="text-[11px] font-semibold text-slate-400">Active Inventory</span>
              <span className="text-sm font-bold text-slate-900">{datasets.length} Objects</span>
            </div>
            <Link 
              to="/upload" 
              className="inline-flex items-center px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-all shadow-sm group"
            >
              <svg className="mr-2 h-4 w-4 text-slate-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              Ingest New Asset
            </Link>
          </div>
        </div>
      </div>

      <div className="px-0 sm:px-0">
        <DatasetTable 
          datasets={datasets} 
          loading={loadingDatasets} 
          onRefresh={fetchDatasets} 
          onDelete={handleDelete}
          onRequestAccess={handleRequestAccess}
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
      </div>
    </div>
  );
};

export default Datasets;
