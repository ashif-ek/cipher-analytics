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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dataset Management</h1>
          <p className="mt-1 text-sm text-slate-500">View, manage, and analyze your encrypted data securely.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link to="/upload" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
            </svg>
            Upload New
          </Link>
        </div>
      </div>

      <DatasetTable 
        datasets={datasets} 
        loading={loadingDatasets} 
        onRefresh={fetchDatasets} 
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Datasets;
