import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import Toast from '../components/ui/Toast';
import Modal from '../components/ui/Modal';

const DatasetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [toastMessage, setToastMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchDataset = async () => {
      try {
        const response = await client.get(`datasets/${id}/`);
        setDataset(response.data);
      } catch (error) {
        console.error("Failed to fetch dataset details", error);
        setToastMessage('Failed to load dataset details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDataset();

    // Polling if processing
    let intervalId;
    if (dataset && dataset.status === 'PROCESSING') {
      intervalId = setInterval(async () => {
        try {
          const response = await client.get(`datasets/${id}/`);
          setDataset(response.data);
          if (response.data.status !== 'PROCESSING') {
            clearInterval(intervalId);
          }
        } catch (error) {
          clearInterval(intervalId);
        }
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [id, dataset?.status]);

  const handleDelete = async () => {
    try {
      setShowDeleteModal(false);
      await client.delete(`datasets/${id}/`);
      navigate('/datasets');
    } catch (error) {
      setToastMessage(`Failed to delete dataset: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="text-center py-24">
        <h2 className="text-xl font-bold text-slate-900">Dataset Not Found</h2>
        <p className="mt-2 text-slate-500">The dataset you are looking for does not exist or you don't have access.</p>
        <Link to="/datasets" className="mt-6 inline-block text-indigo-600 hover:text-indigo-800 font-medium">← Back to Datasets</Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'access', name: 'Access Control' },
    { id: 'logs', name: 'Activity Logs' }
  ];

  return (
    <div className="space-y-6">
      {toastMessage && <Toast message={toastMessage} type="error" onClose={() => setToastMessage('')} />}
      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Dataset"
        message={`Are you sure you want to delete "${dataset.name}"? This action cannot be undone.`}
        confirmText="Yes, delete it"
        variant="danger"
      />

      {/* Header */}
      <div>
        <Link to="/datasets" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Datasets
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center">
            <div className="h-16 w-16 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mr-5 shrink-0">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center">
                {dataset.name}
                <span className="ml-3"><StatusBadge status={dataset.status} /></span>
              </h1>
              <p className="text-sm text-slate-500 mt-1 flex items-center">
                ID: <span className="font-mono ml-1 text-xs px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">{dataset.id}</span>
                <span className="mx-2">•</span>
                Uploaded {new Date(dataset.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
             <button className="px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
              Export Metadata
            </button>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1 md:col-span-2 space-y-8">
              <Card className="p-6 border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-6 pb-4 border-b border-slate-100">Dataset Architecture</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
                  <div className="sm:col-span-1">
                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-tight">Logical Row Count</dt>
                    <dd className="mt-2 text-3xl font-bold text-slate-900 tracking-tighter">{dataset.rows_count?.toLocaleString() || 'N/A'}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-tight">Feature Dimensions</dt>
                    <dd className="mt-2 text-3xl font-bold text-slate-900 tracking-tighter">{dataset.columns_count || 'N/A'} <span className="text-sm font-normal text-slate-400">Cols</span></dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-tight">Security State</dt>
                    <dd className="mt-2 text-sm text-slate-900 font-semibold flex items-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                      Encrypted & Guarded
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-tight">Persistence Policy</dt>
                    <dd className="mt-2 text-sm font-mono text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100 inline-block">
                      {dataset.access_level}
                    </dd>
                  </div>
                </dl>
              </Card>
              
              {dataset.status === 'READY' && (
                <Card className="p-6">
                  <h3 className="text-lg font-medium text-slate-900 mb-4">Schema Context</h3>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 font-mono text-sm overflow-x-auto text-slate-700">
                    {/* In a real app, this would come from an API call to get schema */}
                    Detected: {dataset.columns_count} columns available for computation.
                  </div>
                </Card>
              )}
            </div>
            
            <div className="col-span-1 space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-medium text-slate-900 mb-4">Policy Settings</h3>
                <div className="space-y-4">
                  <div>
                    <span className="block text-sm font-medium text-slate-500 mb-1">Access Level</span>
                    <StatusBadge status={dataset.access_level} />
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-slate-500 mb-1">Research Consent</span>
                    {dataset.is_shared_for_research ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        Granted
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        Not Granted
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'access' && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-slate-900">Access Control List (ACL)</h3>
              <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Manage Access</button>
            </div>
            <div className="bg-slate-50 rounded-lg p-10 text-center border border-dashed border-slate-300">
               <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
               <h3 className="mt-2 text-sm font-medium text-slate-900">No external collaborators</h3>
               <p className="mt-1 text-sm text-slate-500">Currently only you and the system have access to this dataset.</p>
            </div>
          </Card>
        )}

        {activeTab === 'logs' && (
          <Card className="p-6">
            <h3 className="text-lg font-medium text-slate-900 mb-6">Security & Audit Timeline</h3>
            <div className="bg-slate-50 rounded-lg p-10 text-center border border-dashed border-slate-300">
               <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               <h3 className="mt-2 text-sm font-medium text-slate-900">Activity Logs</h3>
               <p className="mt-1 text-sm text-slate-500">Live activity tracing is currently being integrated with the audit service.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DatasetDetails;
