import React, { useState } from 'react';

const Dashboard = () => {
  const [formData, setFormData] = useState({
    name: '',
    access_level: 'PRIVATE',
    is_shared_for_research: false,
    original_file: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (!formData.original_file || !formData.name) {
      setMessage({ type: 'error', text: 'Name and a CSV file are required.' });
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('access_level', formData.access_level);
    data.append('is_shared_for_research', formData.is_shared_for_research);
    data.append('original_file', formData.original_file);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8000/api/datasets/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data,
      });

      if (response.ok) {
        const responseData = await response.json();
        setMessage({ type: 'success', text: `Dataset uploaded successfully. Identifier: ${responseData.id}` });
        setFormData({
          name: '',
          access_level: 'PRIVATE',
          is_shared_for_research: false,
          original_file: null,
        });
        const fileInput = document.getElementById('original_file');
        if (fileInput) fileInput.value = '';
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: `Upload exception: ${JSON.stringify(errorData)}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `System Error: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans">
      
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Cipher Control Panal</h1>
          <span className="text-xs text-gray-500 uppercase tracking-widest mt-1 block">Engineering Console</span>
        </div>
        <button 
          onClick={handleLogout}
          className="text-sm border border-gray-300 px-4 py-2 hover:bg-gray-50 transition-colors font-medium"
        >
          Terminate Session
        </button>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        
        <div className="bg-white border border-gray-200 p-8">
          <div className="mb-8 border-b border-gray-100 pb-4">
            <h2 className="text-lg font-semibold tracking-tight">Dataset Ingestion</h2>
            <p className="text-sm text-gray-500 mt-1">Upload files to the secure processing pipeline.</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide text-xs">Privacy Clearance</label>
                <select 
                  name="access_level" 
                  value={formData.access_level} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm"
                >
                  <option value="PRIVATE">Private Use</option>
                  <option value="SHARED">Internal Share</option>
                  <option value="AGGREGATED">Aggregated Pool</option>
                </select>
              </div>
              
              <div className="col-span-1 flex items-center mt-6">
                <label className="flex items-center space-x-3 cursor-pointer text-sm text-gray-700 hover:text-gray-900">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      name="is_shared_for_research" 
                      checked={formData.is_shared_for_research} 
                      onChange={handleChange}
                      className="form-checkbox h-5 w-5 text-gray-900 border-gray-300 rounded-none focus:ring-gray-900 focus:ring-offset-0"
                    />
                  </div>
                  <span className="font-medium">Authorize Research Use</span>
                </label>
              </div>
              
            </div>

            <div className="pt-6 border-t border-gray-100 mt-6">
              <button 
                type="submit" 
                disabled={loading}
                className="bg-gray-900 text-white font-medium py-3 px-8 hover:bg-black transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm uppercase tracking-wider"
              >
                {loading ? 'Transmitting...' : 'Execute Upload'}
              </button>
            </div>
          </form>
        </div>
        
      </main>
    </div>
  );
};

export default Dashboard;
