import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import DatasetTable from '../components/DatasetTable';

const Datasets = () => {
  const [datasets, setDatasets] = useState([]);
  const [loadingDatasets, setLoadingDatasets] = useState(true);

  const fetchDatasets = useCallback(async () => {
    try {
        setLoadingDatasets(true);
        const response = await client.get('datasets/');
        setDatasets(response.data);
    } catch (error) {
        console.error("Failed to fetch datasets", error);
    } finally {
        setLoadingDatasets(false);
    }
  }, []);

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  // Polling for datasets in PROCESSING state
  useEffect(() => {
    const hasProcessing = datasets.some(ds => ds.status === 'PROCESSING');
    let intervalId;

    if (hasProcessing) {
      intervalId = setInterval(async () => {
        try {
          const response = await client.get('datasets/');
          setDatasets(response.data);
          
          const stillProcessing = response.data.some(ds => ds.status === 'PROCESSING');
          if (!stillProcessing) {
            clearInterval(intervalId);
          }
        } catch (error) {
          console.error("Polling failed", error);
          clearInterval(intervalId);
        }
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [datasets]);

  const handleDelete = (deletedId) => {
    setDatasets(prev => prev.filter(ds => ds.id !== deletedId));
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative -mx-4 px-4 sm:-mx-8 sm:px-8 py-8 bg-slate-50/50 border-b border-slate-200 -mt-8 mb-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dataset Registry</h1>
            <p className="text-sm text-slate-500 font-medium max-w-xl leading-relaxed">
              Consolidated command center for ingestion, metadata governance, and secure FHE analytics.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex flex-col items-end mr-6">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Inventory</span>
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
        />
      </div>
    </div>
  );
};

export default Datasets;
