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
    compute_mode: 'STRICT',
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
      if (!formData.name) {
        setFormData(prev => ({ ...prev, name: file.name.replace('.csv', '') }));
      }
    } else {
      setToastMessage({ type: 'error', text: 'Invalid file format. Only standard CSV tables (.csv) are accepted.' });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      handleFileChange(files[0]);
    } else {
      setFormData(prev => {
        const newState = { ...prev, [name]: value };
        // Enforce Orthogonal Constraints: Private data cannot have Aggregated policy
        if (name === 'visibility' && value === 'PRIVATE' && prev.compute_mode === 'AGGREGATED') {
          newState.compute_mode = 'STRICT';
        }
        return newState;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.original_file) {
      setToastMessage({ type: 'error', text: 'Select a valid CSV file before uploading.' });
      return;
    }
    if (!formData.name.trim()) {
      setToastMessage({ type: 'error', text: 'Dataset name is required.' });
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    const data = new FormData();
    data.append('name', formData.name.trim());
    data.append('visibility', formData.visibility);
    data.append('compute_mode', formData.compute_mode);
    data.append('original_file', formData.original_file);

    try {
      const response = await client.post('datasets/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      setToastMessage({ type: 'success', text: `Dataset "${response.data.name}" ingested. Dispatching Celery encryption pipeline...` });
      
      setTimeout(() => {
        navigate('/datasets');
      }, 1500);

    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.response?.data?.name?.[0] || error.message || 'Dataset ingestion failed.';
      setToastMessage({ type: 'error', text: errorMsg });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {toastMessage.text && (
        <Toast 
          message={toastMessage.text} 
          type={toastMessage.type} 
          onClose={() => setToastMessage({ type: '', text: '' })} 
        />
      )}

      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200/90">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
            PIPELINE::INGEST
          </span>
          <span className="text-xs font-mono text-slate-400">CSV AUTO-PROFILING & FHE ENCRYPTION</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
          Ingest Dataset to Cryptographic Enclave
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Uploaded tables are inspected for numeric types, safely imputed, and serialized into CKKS polynomial ciphertexts.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-5">
          {/* File Upload Dropzone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Source Table (.csv)
            </label>
            <div
              className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
                dragActive 
                  ? 'border-sky-500 bg-sky-50/50' 
                  : formData.original_file 
                    ? 'border-emerald-300 bg-emerald-50/20' 
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/30'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                name="original_file"
                accept=".csv"
                onChange={handleChange}
                className="hidden"
              />
              
              {formData.original_file ? (
                <div className="flex items-center justify-center space-x-3 text-left">
                  <div className="w-10 h-10 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">{formData.original_file.name}</div>
                    <div className="text-[11px] font-mono text-slate-500">
                      {(formData.original_file.size / (1024 * 1024)).toFixed(2)} MB • Ready for ingestion
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                    </svg>
                  </div>
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-sky-600">Click to upload</span> or drag and drop a file
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    Supported format: UTF-8 / ASCII CSV tables up to 15MB
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dataset Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Artifact Identifier / Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. oncology_biomarkers_cohort_a"
              className="block w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono transition-colors"
            />
          </div>

          {/* Governance Mode Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catalog Visibility
              </label>
              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="block w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              >
                <option value="PRIVATE">PRIVATE — Visible only to owner</option>
                <option value="DISCOVERABLE">DISCOVERABLE — Visible in research catalog</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Controls whether external researchers can see this asset in catalog searches.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Compute Governance Mode
              </label>
              <select
                name="compute_mode"
                value={formData.compute_mode}
                onChange={handleChange}
                className="block w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              >
                <option value="STRICT">STRICT — Explicit Research Grant required</option>
                <option value="WHITELIST">WHITELIST — Authorized users only</option>
                {formData.visibility === 'DISCOVERABLE' && (
                  <option value="AGGREGATED">AGGREGATED — Automated k-anonymity validation</option>
                )}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Zero-trust execution policy enforcing math validation and grant requirements.
              </p>
            </div>
          </div>
        </Card>

        {/* Progress indicator during upload */}
        {loading && (
          <Card className="p-4 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-700 font-medium">Ingesting dataset payload...</span>
              <span className="text-slate-500">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-sky-600 h-1.5 rounded-full transition-all duration-150"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/datasets')}
            className="px-4 py-2 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-5 py-2 rounded text-xs font-medium text-white shadow-sm transition-colors ${
              loading 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            {loading ? 'Processing Ingestion...' : 'Ingest & Encrypt Dataset'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadDataset;
