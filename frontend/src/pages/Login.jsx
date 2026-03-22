import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await client.post('accounts/login/', { email, password });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      navigate('/');
    } catch (err) {
      if (err.response?.data?.detail === "Verify your email first") {
        setError('verification_required');
      } else {
        setError('Login failed. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] text-gray-900 font-sans">
      <div className="w-full max-w-md p-8 bg-white border border-gray-200">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Login</h1>
        <p className="text-sm text-gray-500 mb-6">Enter your credentials to access the system.</p>
        
        {error && (
          <div className="mb-4 p-3 border-l-4 border-gray-900 bg-gray-100 text-sm">
            {error === 'verification_required' ? (
              <span>Unverified account. <Link to={`/verify-otp?email=${encodeURIComponent(email)}`} className="font-bold underline">Validate Access Code</Link></span>
            ) : (
              error
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm"
              placeholder="operator@system.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gray-900 text-white font-medium py-2 px-4 hover:bg-black transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            No access granted yet? <Link to="/register" className="font-medium text-gray-900 hover:underline">Request access</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
