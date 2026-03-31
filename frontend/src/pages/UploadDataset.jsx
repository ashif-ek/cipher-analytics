import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import Card from '../components/ui/Card';
import Toast from '../components/ui/Toast';

const UploadDataset = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    visibility: 'PRIVATE',
    access_policy: 'STRICT',
    original_file: null,
  });
  
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState({ type: '', text: '' });

  const handleDrag = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = function(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (file) => {
    if (file && file.name.endsWith('.csv')) {
      setFormData(prev => ({ ...prev, original_file: file }));
      // Auto-fill name if empty
      if (!formData.name) {
        setFormData(prev => ({ ...prev, name: file.name.replace('.csv', '') }));
      }
    } else {
      setToastMessage({ type: 'error', text: 'Please select a valid .csv file.' });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      handleFileChange(files[0]);
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => {
        const newState = { ...prev, [name]: value };
        // Enforce Orthogonal Constraints: Private data cannot have Aggregated policy
        if (name === 'visibility' && value === 'PRIVATE' && prev.access_policy === 'AGGREGATED') {
          newState.access_policy = 'STRICT';
        }
        return newState;
      });
    }
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, original_file: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToastMessage({ type: '', text: '' });

    if (!formData.original_file || !formData.name) {
      setToastMessage({ type: 'error', text: 'Name and a CSV file are required.' });
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('visibility', formData.visibility);
    data.append('access_policy', formData.access_policy);
    data.append('original_file', formData.original_file);

    try {
      const response = await client.post('datasets/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      setToastMessage({ type: 'success', text: `Dataset uploaded successfully. Redirecting...` });
      
      setTimeout(() => {
        navigate('/datasets');
      }, 1500);

    } catch (error) {
      if (error.response) {
        setToastMessage({ type: 'error', text: `Upload exception: ${JSON.stringify(error.response.data)}` });
      } else {
        setToastMessage({ type: 'error', text: `System Error: ${error.message}` });
      }
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      {toastMessage.text && <Toast message={toastMessage.text} type={toastMessage.type} onClose={() => setToastMessage({ type: '', text: '' })} />}
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dataset Ingestion Pipeline</h1>
        <p className="mt-1 text-sm text-slate-500">Securely upload and configure your data assets before processing.</p>
      </div>

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="divide-y divide-slate-100">
          
          <div className="p-8 space-y-10">
            {/* File Upload Area */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Ingestion Source</label>
              <div 
                className={`relative border border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center transition-all duration-300 ${
                  dragActive ? 'border-indigo-500 bg-indigo-50/30' : 
                  formData.original_file ? 'border-emerald-300 bg-emerald-50/10' : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  id="original_file"
                  name="original_file" 
                  accept=".csv"
                  onChange={handleChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={loading}
                />
                
                {formData.original_file ? (
                  <div className="z-20 flex flex-col items-center">
                    <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-4 shadow-sm">
                      <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <p className="text-sm font-bold text-slate-900 tracking-tight">{formData.original_file.name}</p>
                    <p className="text-[10px] font-mono text-slate-500 mt-1 uppercase">{(formData.original_file.size / 1024 / 1024).toFixed(2)} MiB • Ready for post-processing</p>
                    <button 
                      type="button" 
                      onClick={(e) => { e.preventDefault(); removeFile(); }}
                      className="mt-6 text-xs font-bold text-red-600 hover:text-red-700 underline underline-offset-4 relative z-30 pointer-events-auto transition-colors"
                    >
                      Clear Selection
                    </button>
                  </div>
                ) : (
                  <div className="z-0 pointer-events-none">
                    <div className="mx-auto h-10 w-10 text-slate-300 mb-5">
                      <svg className="mx-auto h-10 w-10" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M24 8v32m-16-16h32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-800 font-bold tracking-tight">Select Data Asset</p>
                    <p className="text-xs text-slate-500 mt-2 font-medium">CSV Format Only • 15 MiB Maximum</p>
                  </div>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
              
              <div className="col-span-1 md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">Dataset Identifier <span className="text-red-500 select-none">*</span></label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 text-sm transition-all font-medium text-slate-900"
                  placeholder="e.g. USER_RETENTION_QUERY_v1"
                  required
                  disabled={loading}
                />
              </div>

              {/* Discovery Layer */}
              <div className="col-span-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Discovery Layer</label>
                <select 
                  name="visibility" 
                  value={formData.visibility} 
                  onChange={handleChange}
                  className="bg-white block w-full px-4 py-3 text-xs font-bold border-slate-200 rounded-xl focus:ring-slate-900 focus:border-slate-900 transition-all cursor-pointer"
                  disabled={loading}
                >
                  <option value="PRIVATE">Private (Internal Only)</option>
                  <option value="DISCOVERABLE">Discoverable (Research Directory)</option>
                </select>
              </div>

              {/* Governance Protocol */}
              <div className="col-span-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Governance Protocol</label>
                <select 
                  name="access_policy" 
                  value={formData.access_policy} 
                  onChange={handleChange}
                  className="bg-white block w-full px-4 py-3 text-xs font-bold border-slate-200 rounded-xl focus:ring-slate-900 focus:border-slate-900 transition-all cursor-pointer"
                  disabled={loading}
                >
                  <option value="STRICT">Strict (Request Required)</option>
                  <option value="COLLABORATIVE">Collaborative (Team Access)</option>
                  <option value="AGGREGATED" disabled={formData.visibility === 'PRIVATE'}>
                    Aggregated (Analysis Only) {formData.visibility === 'PRIVATE' && '• Discovery Required'}
                  </option>
                </select>
              </div>
              
              <div className="col-span-1 md:col-span-2 mt-4 flex items-center justify-center p-8 border border-slate-100 rounded-xl bg-slate-50/30">
                <p className="text-xs text-slate-400 font-medium italic">Protocol-specific encryption will be applied upon ingestion.</p>
              </div>
              
            </div>
          </div>

          <div className="px-8 py-6 bg-slate-50/50 flex items-center justify-between border-t border-slate-200">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Encryption Key: [AUTO_GEN]</div>
            <div className="flex">
              <button 
                type="button" 
                onClick={() => navigate('/datasets')}
                className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-widest rounded-lg shadow-sm hover:bg-slate-50 transition-all mr-4"
                disabled={loading}
              >
                Discard
              </button>
              <button 
                type="submit" 
                disabled={loading || !formData.original_file || !formData.name}
                className="inline-flex items-center px-8 py-2.5 border border-transparent text-xs font-bold uppercase tracking-[0.2em] rounded-lg shadow-sm text-white bg-slate-900 hover:bg-black focus:outline-none transition-all disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{uploadProgress < 100 ? `Uploading ${uploadProgress}%` : 'Finalizing...'}</span>
                  </div>
                ) : 'Ingest Asset'}
              </button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default UploadDataset;
