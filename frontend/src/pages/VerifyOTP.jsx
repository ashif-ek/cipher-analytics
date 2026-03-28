import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import client from '../api/client';
import AuthLayout from '../components/auth/AuthLayout';
import InputField from '../components/auth/InputField';

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
      setMessage({ type: 'error', text: 'Email parameter missing.' });
    }
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      await client.post('accounts/verify-otp/', { email, otp });
      setMessage({ type: 'success', text: 'Identity verified. Redirecting...' });
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Verification failed.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Email required.' });
      return;
    }
    
    setMessage({ type: '', text: '' });
    setResendLoading(true);

    try {
      const response = await client.post('accounts/resend-otp/', { email });
      setMessage({ type: 'success', text: response.data?.message || 'Code sent.' });
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Resend failed.' 
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Verify your email" 
      subtitle="We've sent a 6-digit code to your inbox."
    >
      {message.text && (
        <div className={`mb-6 p-4 rounded-md text-sm font-medium ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
            : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          label="Email address"
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="name@company.com"
          readOnly={!!initialEmail}
        />
        
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 px-0.5">Verification code</label>
          <input 
            type="text" 
            value={otp} 
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} 
            maxLength={6}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-md text-center text-2xl tracking-[0.75em] font-bold text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all shadow-sm"
            placeholder="000000"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading || otp.length < 6 || !email}
          className="w-full bg-slate-900 text-white text-sm font-semibold py-3 px-4 rounded-md hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.99] mt-2"
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>

      <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col gap-4">
        <button 
          type="button"
          onClick={handleResend}
          disabled={resendLoading || !email}
          className="w-full bg-white border border-slate-200 text-slate-900 text-sm font-semibold py-3 px-4 rounded-md hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {resendLoading ? 'Sending...' : 'Resend code'}
        </button>
        
        <Link to="/login" className="text-sm font-semibold text-slate-500 hover:text-slate-900 text-center transition-colors">
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
};

export default VerifyOTP;
