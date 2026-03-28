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

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email protocol'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

const Login = ({ openLegal }) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const navigate = useNavigate();

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
        password: data.password 
      });
      
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      setToast({ message: 'Authentication successful. Synchronizing session...', type: 'success' });
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      if (err.response?.data?.detail === "Verify your email first") {
        setToast({ message: 'Identity verification required.', type: 'error' });
        setTimeout(() => {
          navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`);
        }, 2000);
      } else {
        // Industry standard: Do not reveal if email exists or password is wrong
        setToast({ message: 'Invalid credentials or unauthorized access.', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Sign In" 
      subtitle="Welcome back. Please enter your details."
    >
      {toast.message && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ message: '', type: 'success' })} 
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <InputField
          label="Email address"
          placeholder="name@company.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="space-y-3">
          <PasswordField
            label="Password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="flex justify-end">
            <button 
              type="button" 
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 py-1">
          <input
            type="checkbox"
            id="rememberMe"
            className="w-4 h-4 border-slate-300 rounded text-slate-900 focus:ring-slate-900/10 cursor-pointer"
            {...register('rememberMe')}
          />
          <label htmlFor="rememberMe" className="text-sm font-medium text-slate-600 cursor-pointer select-none">
            Remember me for 30 days
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !isValid}
          className="w-full bg-slate-900 text-white text-sm font-semibold py-3 px-4 rounded-md hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.99] mt-2"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <FormFooter 
          secondaryText="Don't have an account?" 
          secondaryAction={{ text: 'Create an account', to: '/register' }}
          onLinkClick={openLegal}
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
