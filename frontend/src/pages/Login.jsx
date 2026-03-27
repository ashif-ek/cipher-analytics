import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import Toast from '../components/ui/Toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await client.post('accounts/login/', { email, password });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      setToast({ message: 'Session authorized. Synthesizing environment...', type: 'success' });
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      if (err.response?.data?.detail === "Verify your email first") {
        setToast({ message: 'Verification protocol required. Redirecting...', type: 'error' });
        setTimeout(() => {
          navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
        }, 2000);
      } else {
        setToast({ message: 'Authentication failed. Verify credentials and try again.', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] text-gray-900 font-sans px-4">
      {toast.message && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ message: '', type: 'success' })} 
        />
      )}

      <div className="w-full max-w-md p-8 bg-white border border-gray-200 shadow-sm rounded-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tighter uppercase text-slate-900">Login</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Establish Authorized Session</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Operational Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-0 focus:border-slate-900 transition-all text-sm placeholder:text-slate-300"
              placeholder="operator@system.com"
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-0 focus:border-slate-900 transition-all text-sm"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] py-3 px-4 rounded-xl hover:bg-black transition-all disabled:bg-slate-300 disabled:cursor-not-allowed shadow-sm shadow-slate-200"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            No access granted yet? <Link to="/register" className="text-slate-900 hover:underline">Request Authorized Access</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
