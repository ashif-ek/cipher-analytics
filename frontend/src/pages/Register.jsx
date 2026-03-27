import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import Toast from '../components/ui/Toast';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'DATA_OWNER'
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setToast({ message: 'Passwords do not match. Please verify your credentials.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      await client.post('accounts/register/', registerData);
      setToast({ message: 'Identity created. Redirecting to verification protocol...', type: 'success' });
      
      setTimeout(() => {
        navigate('/verify-otp?email=' + encodeURIComponent(formData.email));
      }, 2000);
    } catch (err) {
      let errorMessage = 'Registration failed. Username or email might be taken.';
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        errorMessage = Object.values(errorData).flat().join(' ');
      }
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] text-gray-900 font-sans py-12">
      {toast.message && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ message: '', type: 'success' })} 
        />
      )}

      <div className="w-full max-w-md p-8 bg-white border border-gray-200 shadow-sm rounded-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create Account</h1>
          <p className="text-sm font-medium text-slate-500 mt-2">Join the secure analytics network</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label>
            <input 
              type="text" 
              name="username"
              value={formData.username} 
              onChange={handleChange} 
              required 
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-sm placeholder:text-slate-300"
              placeholder="data_steward_01"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
            <input 
              type="email"
              name="email"
              value={formData.email} 
              onChange={handleChange} 
              required 
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-sm placeholder:text-slate-300"
              placeholder="name@company.com"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <input 
                type="password" 
                name="password"
                value={formData.password} 
                onChange={handleChange} 
                required 
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-0 focus:border-slate-900 transition-all text-sm"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
              <input 
                type="password" 
                name="confirmPassword"
                value={formData.confirmPassword} 
                onChange={handleChange} 
                required 
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-0 focus:border-slate-900 transition-all text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Role Assignment</label>
            <select 
              name="role"
              value={formData.role} 
              onChange={handleChange} 
              required
              className="w-full px-3 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-0 focus:border-slate-900 transition-all text-sm appearance-none cursor-pointer"
            >
              <option value="DATA_OWNER">Data Owner</option>
              <option value="RESEARCHER">Researcher</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white text-sm font-bold py-3 px-4 mt-4 rounded-xl hover:bg-black transition-all disabled:bg-slate-200 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? 'Processing...' : 'Create Account'}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs font-semibold text-slate-500">
            Already have an account? <Link to="/login" className="text-slate-900 hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
