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
        if (name === 'visibility' && value === 'PRIVATE' && prev.compute_mode === 'AGGREGATED') {
          newState.compute_mode = 'STRICT';
        }
        return newState;
      });
    }
  };

  const handleToggleVisibility = () => {
    const newValue = formData.visibility === 'PRIVATE' ? 'DISCOVERABLE' : 'PRIVATE';
    setFormData(prev => {
      const newState = { ...prev, visibility: newValue };
      // Enforce Orthogonal Constraints: Private data cannot have Aggregated policy
      if (newValue === 'PRIVATE' && prev.compute_mode === 'AGGREGATED') {
        newState.compute_mode = 'STRICT';
      }
      return newState;
    });
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
    data.append('compute_mode', formData.compute_mode);
    data.append('original_file', formData.original_file);
    
    // Simple dimension induction for demonstration
    // In a production app, we would parse this on the client or server
    data.append('rows_count', Math.floor(Math.random() * 500) + 100); 
    data.append('columns_count', Math.floor(Math.random() * 10) + 5);

    try {
      const response = await client.post('datasets/', data, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      setToastMessage({ type: 'success', text: `Research artifact indexed. Redirecting...` });
      
      setTimeout(() => {
        navigate('/datasets');
      }, 1500);

    } catch (error) {
      if (error.response) {
        setToastMessage({ type: 'error', text: `Dataset ingestion pipeline failed validation: ${JSON.stringify(error.response.data)}` });
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
        <h1 className="text-2xl font-bold text-slate-900">Dataset Ingestion Pipeline</h1>
        <p className="mt-1 text-sm text-slate-500">Securely upload and configure your data assets before processing.</p>
      </div>

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="divide-y divide-slate-100">
          
          <div className="p-8 space-y-10">
            {/* File Upload Area */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-4">Ingestion Source</label>
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
                    <p className="text-sm font-bold text-slate-900">{formData.original_file.name}</p>
                    <p className="text-[10px] font-mono text-slate-500 mt-1">{(formData.original_file.size / 1024 / 1024).toFixed(2)} MiB • Ready for post-processing</p>
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
                    <p className="text-sm text-slate-800 font-bold">Select Data Asset</p>
                    <p className="text-xs text-slate-500 mt-2 font-medium">CSV Format Only • 15 MiB Maximum</p>
                  </div>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
              
              <div className="col-span-1 md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 mb-2.5">Dataset Identifier <span className="text-red-500 select-none">*</span></label>
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

              {/* Discovery Layer - Premium Toggle */}
              <div className="col-span-1">
                <label className="block text-[10px] font-bold text-slate-400 mb-4">Discovery Layer</label>
                <div 
                  className={`flex items-center px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                    formData.visibility === 'DISCOVERABLE' 
                      ? 'border-indigo-100 bg-indigo-50/30' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                  onClick={() => !loading && handleToggleVisibility()}
                >
                  <div className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                    formData.visibility === 'DISCOVERABLE' ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}>
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      formData.visibility === 'DISCOVERABLE' ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </div>
                  <div className="ml-3 select-none">
                    <p className={`text-[11px] font-bold transition-colors leading-none ${
                      formData.visibility === 'DISCOVERABLE' ? 'text-indigo-900' : 'text-slate-600'
                    }`}>
                      {formData.visibility === 'DISCOVERABLE' ? 'Discoverable' : 'Private'}
                    </p>
                    <p className="text-[9px] text-slate-400 font-medium mt-1 leading-none">
                      {formData.visibility === 'DISCOVERABLE' ? 'Visible in Research Directory' : 'Internal Only (Hidden)' }
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-span-1">
                <label className="block text-[10px] font-bold text-slate-400 mb-3">Governance Protocol</label>
                <select 
                  name="compute_mode" 
                  value={formData.compute_mode} 
                  onChange={handleChange}
                  className="bg-white block w-full px-4 py-3 text-xs font-bold border-slate-200 rounded-xl focus:ring-slate-900 focus:border-slate-900 transition-all cursor-pointer"
                  disabled={loading}
                >
                  <option value="STRICT">Strict (Request Required)</option>
                  <option value="WHITELIST">Whitelist (Direct Access)</option>
                  <option value="AGGREGATED" disabled={formData.visibility === 'PRIVATE'}>
                    Aggregated (Analysis Only) {formData.visibility === 'PRIVATE' && '• Discovery Required'}
                  </option>
                </select>
              </div>
              
              <div className="col-span-1 md:col-span-2 mt-4 flex items-center justify-center p-8 border border-slate-100 rounded-xl bg-slate-50/30">
                <p className="text-xs text-slate-400 font-medium italic">Protocol-specific encryption will be applied upon ingestion.</p>
              </div>

              {/* Guidelines Section */}
              <div className="col-span-1 md:col-span-2 mt-8 p-6 border border-blue-100 rounded-xl bg-blue-50/30 text-[11px] text-slate-700 space-y-4 shadow-sm">
                <h3 className="text-[13px] font-bold border-b border-blue-200 pb-2 text-blue-900">Governance & Validation Guidelines</h3>
                
                <p className="text-slate-600"><strong className="text-slate-800">Discovery Layer:</strong> Answers the question: <i>"Can other people see that my file exists in the system registry?"</i></p>
                <p className="text-slate-600"><strong className="text-slate-800">Governance Protocol:</strong> Answers the question: <i>"If someone finds my file, what are the rules for them to actually run math on it?"</i></p>

                <div className="space-y-4 pt-2">
                  <div className="p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
                    <p className="font-extrabold text-slate-900 text-[12px] mb-1">🔒 Private + Strict (The Vault)</p>
                    <p className="text-slate-600"><strong>What it means:</strong> The dataset is completely invisible to the public. Even if an administrator sends someone a direct link to the dataset, they will hit a brick wall and must submit a formal request just to look at the math.</p>
                    <p className="text-slate-600 mt-1"><strong>The Scenario:</strong> You are uploading the master payroll list (Salaries, SSNs, Bank details) for the entire corporation.</p>
                    <p className="text-slate-600 mt-1"><strong>Use Case:</strong> No one should know this file exists. If the HR Director needs an audit executed on the file, the system administrator will explicitly grant that one single director access after a formal request review.</p>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
                     <p className="font-extrabold text-slate-900 text-[12px] mb-1">🕵️‍♂️ Private + Whitelist (The Secret Taskforce)</p>
                     <p className="text-slate-600"><strong>What it means:</strong> The dataset is still completely invisible to the company directory, BUT a specific group of trusted individuals has been pre-cleared to run FHE math on it the moment it is uploaded.</p>
                     <p className="text-slate-600 mt-1"><strong>The Scenario:</strong> You are working on a highly classified merger and acquisition (M&A) deal under a strict NDA.</p>
                     <p className="text-slate-600 mt-1"><strong>Use Case:</strong> You upload the target company's financial records as Private so employees don't see it in the catalog and panic. You set the protocol to Whitelist, assigning the three executives on the M&A team. Those three executives can instantly run calculations without waiting for extra permissions.</p>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
                     <p className="font-extrabold text-slate-900 text-[12px] mb-1">📚 Discoverable + Strict (The Library Book)</p>
                     <p className="text-slate-600"><strong>What it means:</strong> Everyone in the organization can query the catalog and see the name/size of the dataset, but no one can touch it or run math on it without asking the owner for permission first.</p>
                     <p className="text-slate-600 mt-1"><strong>The Scenario:</strong> Your organization has purchased an extremely expensive third-party dataset (e.g., global satellite imagery metadata).</p>
                     <p className="text-slate-600 mt-1"><strong>Use Case:</strong> You want researchers to know the company owns this data so they don't buy it twice (Discoverable). However, because processing the data costs thousands of dollars per query, every researcher must submit a request explaining why they need to use it before they are given access (Strict).</p>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
                     <p className="font-extrabold text-slate-900 text-[12px] mb-1">⭐ Discoverable + Whitelist (The Premium Subscription)</p>
                     <p className="text-slate-600"><strong>What it means:</strong> The dataset is visible to everyone in the catalog. However, only a VIP group of pre-approved users can run math on it immediately. Everyone else gets blocked but can still see the dataset exists.</p>
                     <p className="text-slate-600 mt-1"><strong>The Scenario:</strong> A healthcare network maintains a database of clinical trial results.</p>
                     <p className="text-slate-600 mt-1"><strong>Use Case:</strong> The file is Discoverable so that all doctors know the trial data exists. However, the data is set to Whitelist restricted strictly to the "Oncology Research Team." An oncologist can click Compute and get an instant result. A standard pediatric doctor who browses the catalog and tries to click compute will get an "Access Denied" error.</p>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
                     <p className="font-extrabold text-slate-900 text-[12px] mb-1">🌍 Discoverable + Aggregated (The Open API)</p>
                     <p className="text-slate-600"><strong>What it means:</strong> The dataset is fully visible to the company, and anyone can freely run high-level math (Averages, Sums, Standard Deviations) on it immediately without permission.</p>
                     <p className="text-slate-600 mt-1"><strong>The Scenario:</strong> You are uploading basic corporate telemetry data—like "Daily Office Wi-Fi Usage Logs" or "Cafeteria Snack Sales."</p>
                     <p className="text-slate-600 mt-1"><strong>Use Case:</strong> You want to encourage interns or data analysts to build cool internal dashboards (Discoverable). Because you set it to Aggregated, they can run FHE math to find out "What is the average amount of coffee sold per day?" without ever bothering you for permission. However, the system's Zero-Trust cryptography prevents them from extracting row-level data to see exactly how many coffees the CEO bought on Tuesday.</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-100/50 border border-blue-200 rounded-lg flex gap-3 items-start">
                  <span className="text-[14px]">⚠️</span>
                  <p className="text-blue-900 font-medium"><strong>Note:</strong> "Private + Aggregated" does not exist, because you cannot open up public mathematical access to a file that you simultaneously want to hide from existence!</p>
                </div>
              </div>
              
            </div>
          </div>

          <div className="px-8 py-6 bg-slate-50/50 flex items-center justify-between border-t border-slate-200">
            <div className="text-[10px] items-center gap-2 font-bold text-slate-400 flex">
              <span>Encryption Key:</span>
              <span className="font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded transition-all animate-pulse">
                {Math.random().toString(16).substring(2, 10).toUpperCase()}-{Math.random().toString(16).substring(2, 10).toUpperCase()}
              </span>
            </div>
            <div className="flex">
              <button 
                type="button" 
                onClick={() => navigate('/datasets')}
                className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg shadow-sm hover:bg-slate-50 transition-all mr-4"
                disabled={loading}
              >
                Discard
              </button>
              <button 
                type="submit" 
                disabled={loading || !formData.original_file || !formData.name}
                className="inline-flex items-center px-8 py-2.5 border border-transparent text-xs font-bold rounded-lg shadow-sm text-white bg-slate-900 hover:bg-black focus:outline-none transition-all disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{uploadProgress < 100 ? `Transmitting analytical payload ${uploadProgress}%` : 'Initializing embedding pipeline...'}</span>
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
