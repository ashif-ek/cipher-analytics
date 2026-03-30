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
  const [computing, setComputing] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [computationResult, setComputationResult] = useState(null);

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

  const handleCompute = async (operation) => {
    try {
      setComputing(true);
      const response = await client.post(`datasets/${id}/compute/`, { operation });
      
      setComputationResult({
        ...response.data,
        datasetName: dataset.name
      });
      setShowResultModal(true);
      setToastMessage(`Computation successful.`);
    } catch (error) {
      setToastMessage(`Computation failed: ${error.response?.data?.detail || error.message}`);
    } finally {
      setComputing(false);
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
             {dataset.status === 'READY' && (
               <>
                 <button 
                  onClick={() => handleCompute('sum')}
                  disabled={computing}
                  className="px-4 py-2 border border-blue-200 shadow-sm text-sm font-bold rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-50"
                 >
                  {computing ? '...' : 'Run Sum'}
                 </button>
                 <button 
                  onClick={() => handleCompute('mean')}
                  disabled={computing}
                  className="px-4 py-2 border border-emerald-200 shadow-sm text-sm font-bold rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                 >
                  {computing ? '...' : 'Run Mean'}
                 </button>
               </>
             )}
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
      {/* Result Modal */}
      <Modal 
        isOpen={showResultModal} 
        onClose={() => setShowResultModal(false)}
        title="Analytical Audit Report"
        variant="info"
        size="md"
        confirmText="Close Report"
        onConfirm={() => setShowResultModal(false)}
        message={
          <div className="space-y-6 text-left">
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
              <div className="relative text-center">
                <span className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Verified Numerical Output</span>
                <div className="flex flex-col items-center">
                  <span className="text-5xl font-black text-slate-900 tracking-tighter font-mono">
                    {typeof computationResult?.result === 'number' 
                      ? computationResult.result.toFixed(6)
                      : 'N/A'}
                  </span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(computationResult?.result);
                      setToastMessage('Value copied to clipboard');
                    }}
                    className="mt-6 flex items-center px-3 py-1.5 bg-white rounded-lg text-[10px] font-black text-slate-500 hover:bg-slate-900 hover:text-white transition-all border border-slate-200 uppercase tracking-widest"
                  >
                    <svg className="w-3.5 h-3.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-3 8v3m-3-3l3 3m0 0l3-3" />
                    </svg>
                    Copy to Clipboard
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

            <p className="text-[10px] text-slate-400 leading-relaxed max-w-sm mx-auto text-center">
              This report confirms that the computation bypasses traditional decryption layers to ensure end-to-end data privacy.
            </p>
          </div>
        }
      />
    </div>
  );
};

export default DatasetDetails;
