import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import client from '../api/client';

const VerifyOTP = () => {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!email) {
      setMessage({ type: 'error', text: 'Email parameter missing. Please provide your registered email.' });
    }
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      await client.post('accounts/verify-otp/', { email, otp });
      setMessage({ type: 'success', text: 'Account verified successfully! Redirecting...' });
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Verification failed. Invalid or expired OTP code.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Email is required to resend OTP.' });
      return;
    }
    
    setMessage({ type: '', text: '' });
    setResendLoading(true);

    try {
      const response = await client.post('accounts/resend-otp/', { email });
      setMessage({ type: 'success', text: response.data?.message || 'A new code has been sent.' });
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to resend code.' 
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] text-gray-900 font-sans py-12">
      <div className="w-full max-w-md p-8 bg-white border border-gray-200">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Security Verification</h1>
        <p className="text-sm text-gray-500 mb-6">Enter the 6-digit access code sent to your email.</p>
        
        {message.text && (
          <div className={`mb-4 p-3 border-l-4 text-sm ${message.type === 'success' ? 'border-gray-900 bg-gray-100 text-gray-900' : 'border-gray-900 bg-gray-100'}`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm bg-gray-50 mb-2"
              placeholder="operator@system.com"
              readOnly={!!initialEmail}
            />
            {!initialEmail && (
              <p className="text-xs text-gray-500">Provide the email bound to your account.</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Access Code (OTP)</label>
            <input 
              type="text" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} 
              required
              maxLength={6}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-center text-lg tracking-[0.5em] font-mono"
              placeholder="••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading || otp.length < 6 || !email}
            className="w-full bg-gray-900 text-white font-medium py-2 px-4 hover:bg-black transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm mt-4"
          >
            {loading ? 'Verifying...' : 'Validate Code'}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-gray-100 center">
          <button 
            type="button"
            onClick={handleResend}
            disabled={resendLoading || !email}
            className="w-full bg-white border border-gray-300 text-gray-900 font-medium py-2 px-4 hover:bg-gray-50 transition-colors disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed text-sm"
          >
            {resendLoading ? 'Transmitting...' : 'Resend Access Code'}
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm font-medium text-gray-900 hover:underline">
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
