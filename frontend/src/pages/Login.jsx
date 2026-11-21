import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import client from '../api/client';
import Toast from '../components/ui/Toast';
import AuthLayout from '../components/auth/AuthLayout';
import InputField from '../components/auth/InputField';
import PasswordField from '../components/auth/PasswordField';
import FormFooter from '../components/auth/FormFooter';
import { ArrowRight, Lock } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email address is required').email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const navigate = useNavigate();

  React.useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await client.post('accounts/login/', { 
        email: data.email, 
        password: data.password,
        remember_me: data.rememberMe
      });
      
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      setToast({ message: 'Authentication successful. Synchronizing session...', type: 'success' });
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      if (err.response?.data?.detail === "Verify your email first") {
        setToast({ message: 'Identity verification required. Redirecting to OTP...', type: 'error' });
        setTimeout(() => {
          navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`);
        }, 2000);
      } else {
        // Industry standard: Do not reveal whether email exists or password failed
        setToast({ message: 'Invalid credentials or unauthorized access.', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Sign In to Enclave" 
      subtitle="Enter your verified corporate credentials to access the analytical console."
      badge="IDENTITY VERIFICATION"
      maxWidth="max-w-[440px]"
    >
      {toast.message && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ message: '', type: 'success' })} 
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <InputField
          label="Corporate Email"
          placeholder="researcher@institute.org"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="space-y-1.5">
          <PasswordField
            label="Password"
            placeholder="••••••••••••"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="flex justify-end pt-1">
            <button 
              type="button" 
              className="text-[11px] font-mono text-slate-500 hover:text-slate-900 transition-colors"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 py-1">
          <input
            type="checkbox"
            id="rememberMe"
            className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900/10 cursor-pointer"
            {...register('rememberMe')}
          />
          <label htmlFor="rememberMe" className="text-xs font-medium text-slate-600 cursor-pointer select-none">
            Keep enclave session active for 30 days
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !isValid}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-semibold py-3 px-4 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.99] flex items-center justify-center space-x-2"
        >
          {loading ? (
            <span>Verifying Credentials...</span>
          ) : (
            <>
              <span>Authenticate & Enter Console</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </>
          )}
        </button>

        <FormFooter 
          secondaryText="Don't have an enclave account?" 
          secondaryAction={{ text: 'Request registration', to: '/register' }}
          links={[
            { text: 'Privacy Policy', to: '#', type: 'privacy' },
            { text: 'Terms of Service', to: '#', type: 'terms' }
          ]}
        />
      </form>
    </AuthLayout>
  );
};

export default Login;
