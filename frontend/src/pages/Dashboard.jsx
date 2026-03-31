import React, { useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import DatasetTable from '../components/DatasetTable';
import UserProfile from '../components/UserProfile';

const Dashboard = () => {
  const [formData, setFormData] = useState({
    name: '',
    visibility: 'PRIVATE',
    access_policy: 'STRICT',
    original_file: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Dataset Management State
  const [datasets, setDatasets] = useState([]);
  const [loadingDatasets, setLoadingDatasets] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  };

  const fetchDatasets = useCallback(async () => {
    try {
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
    // Poll every 10 seconds for status updates
    const intervalId = setInterval(fetchDatasets, 10000);
    return () => clearInterval(intervalId);
  }, [fetchDatasets]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDelete = (deletedId) => {
    setDatasets(prev => prev.filter(ds => ds.id !== deletedId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: 'Initializing Client-Side FHE Engine...' });

    if (!formData.original_file || !formData.name) {
      setMessage({ type: 'error', text: 'Name and a CSV file are required.' });
      setLoading(false);
      return;
    }

    try {
      // 1. Initialize Web Worker
      const worker = new Worker('/fheWorker.js');
      
      const runWorkerCmd = (action, payload) => {
        return new Promise((resolve, reject) => {
          const id = Math.random().toString(36).substring(7);
          worker.onmessage = (e) => {
            if (e.data.id === id) {
              if (e.data.success) resolve(e.data.data);
              else reject(new Error(e.data.error));
            }
          };
          worker.postMessage({ action, id, payload });
        });
      };

      setMessage({ type: '', text: 'Generating FHE Keypair locally...' });
      const fhek = await runWorkerCmd('generateKeys', {});
      
      // We would normally parse the CSV and get an array of floats
      // Let's mock a vector
      const parsedVector = [1.5, 2.5, 3.5, 4.5];
      
      setMessage({ type: '', text: 'Encrypting data vector (CKKS Scheme)...' });
      const encData = await runWorkerCmd('encryptVector', { vector: parsedVector, public_key: fhek.public_key });
      
      worker.terminate();

      // 2. Prepare payload
      setMessage({ type: '', text: 'Transmitting ciphertext to Zero-Trust Backend...' });
      const data = new FormData();
      data.append('name', formData.name);
      data.append('visibility', formData.visibility);
      data.append('access_policy', formData.access_policy);
      
      // Store Ciphertext purely as file blob
      const ciphertextBlob = new Blob([encData.ciphertext], { type: 'application/octet-stream' });
      data.append('ciphertext_path', ciphertextBlob, 'data.enc');
      
      data.append('public_key', fhek.public_key);
      data.append('eval_keys', fhek.eval_keys);
      data.append('schema_hash', 'ckks_float64_simd');

      const response = await client.post('datasets/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const responseData = response.data;
      
      setMessage({ type: 'success', text: `Encrypted Asset stored. Identifier: ${responseData.id}` });
      setFormData({
        name: '',
        visibility: 'PRIVATE',
        access_policy: 'STRICT',
        original_file: null,
      });
      const fileInput = document.getElementById('original_file');
      if (fileInput) fileInput.value = '';
      
      fetchDatasets();

    } catch (error) {
      if (error.response) {
        setMessage({ type: 'error', text: `Upload exception: ${JSON.stringify(error.response.data)}` });
      } else {
        setMessage({ type: 'error', text: `System Error: ${error.message}` });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans pb-12">
      
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-40 relative">
        <div>
          <h1 className="text-xl font-bold tracking-tight">cipher-analytics</h1>
        </div>
        <UserProfile onLogout={handleLogout} />
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        
        {/* Upload Form Section */}
        <div className="bg-white border border-gray-200 p-8 shadow-sm">
          <div className="mb-8 border-b border-gray-100 pb-4">
            <h2 className="text-lg font-semibold tracking-tight">Your Accessible Datasets</h2>
            <p className="text-sm text-gray-500 mt-1">Upload records or manage shared inventories.</p>
          </div>
          
          
          {message.text && (
            <div className={`mb-6 p-4 text-sm border-l-4 ${message.type === 'success' ? 'border-gray-900 bg-gray-50 text-gray-800' : 'border-red-600 bg-red-50 text-red-800'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide text-xs">Dataset Identifier</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm"
                  placeholder="e.g., telemetry_data_v2"
                  required
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide text-xs">Source File</label>
                <div className="flex items-center">
                  <input 
                    type="file" 
                    id="original_file"
                    name="original_file" 
                    accept=".csv"
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm file:mr-4 file:py-1 file:px-4 file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                    required
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">Requires .csv structure.</p>
              </div>

               <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide text-xs">Discovery Layer</label>
                <select 
                  name="visibility" 
                  value={formData.visibility} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm"
                >
                  <option value="PRIVATE">Private (Only Me)</option>
                  <option value="DISCOVERABLE">Discoverable (Research Directory)</option>
                </select>
              </div>

               <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide text-xs">Governance Protocol</label>
                <select 
                  name="access_policy" 
                  value={formData.access_policy} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm"
                >
                  <option value="STRICT">Strict (Request Required)</option>
                  <option value="COLLABORATIVE">Collaborative Pool</option>
                  <option value="AGGREGATED">Aggregated Analysis</option>
                </select>
              </div>
              
            </div>

            <div className="pt-6 border-t border-gray-100 mt-6">
              <button 
                type="submit" 
                disabled={loading}
                className="bg-gray-900 text-white font-medium py-3 px-8 hover:bg-black transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm uppercase tracking-wider shadow-sm"
              >
                {loading ? 'Encrypting & Transmitting...' : 'Execute Encrypted Upload'}
              </button>
            </div>
          </form>
        </div>

        {/* Dataset Table Section */}
        <DatasetTable 
          datasets={datasets} 
          loading={loadingDatasets} 
          onRefresh={fetchDatasets} 
          onDelete={handleDelete}
        />
        
      </main>
    </div>
  );
};

export default Dashboard;
