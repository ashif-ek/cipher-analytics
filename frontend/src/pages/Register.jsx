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

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email protocol'),
  password: z.string()
    .min(8, 'Minimum 8 characters required')
    .regex(/[A-Z]/, 'Must contain one uppercase letter')
    .regex(/[a-z]/, 'Must contain one lowercase letter')
    .regex(/[0-9]/, 'Must contain one numeric character')
    .regex(/[^A-Za-z0-9]/, 'Must contain one special character'),
  confirmPassword: z.string(),
  role: z.enum(['DATA_OWNER', 'RESEARCHER']),
  terms: z.boolean().refine(val => val === true, 'Policy acknowledgment required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const Register = ({ openLegal }) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const passwordValue = watch('password', '');

  const getStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getStrength(passwordValue);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { confirmPassword, terms, ...registerData } = data;
      await client.post('accounts/register/', registerData);
      setToast({ message: 'Identity initialized. Awaiting verification...', type: 'success' });
      
      setTimeout(() => {
        navigate('/verify-otp?email=' + encodeURIComponent(data.email));
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data ? Object.values(err.response.data).flat()[0] : 'Registration failed.';
      setToast({ message: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Start your secure data analytics journey today."
    >
      {toast.message && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ message: '', type: 'success' })} 
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <InputField
          label="Full name"
          placeholder="Jane Doe"
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Username"
            placeholder="janedoe"
            error={errors.username?.message}
            {...register('username')}
          />
          <InputField
            label="Email address"
            placeholder="jane@company.com"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div className="space-y-2">
          <PasswordField
            label="Password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          
          {/* Password Strength Indicator */}
          <div className="flex space-x-1.5 h-1.5 px-0.5">
            {[1, 2, 3, 4].map((step) => (
              <div 
                key={step} 
                className={`flex-1 rounded-full transition-all duration-500 ${
                  strength >= step 
                    ? strength <= 2 ? 'bg-amber-400' : 'bg-emerald-500' 
                    : 'bg-slate-100'
                }`}
              />
            ))}
          </div>
          <p className="text-[11px] font-medium text-slate-500">
            Use 8 or more characters with a mix of letters, numbers & symbols
          </p>
          
          <PasswordField
            label="Confirm password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 px-0.5">Role</label>
          <div className="relative">
            <select 
              {...register('role')}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 appearance-none cursor-pointer font-medium shadow-sm transition-all"
            >
              <option value="DATA_OWNER">Data Owner</option>
              <option value="RESEARCHER">Researcher</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-start space-x-3 px-0.5">
            <input
              type="checkbox"
              id="terms"
              className="mt-1 w-4 h-4 border-slate-300 rounded text-slate-900 focus:ring-slate-900/10 cursor-pointer"
              {...register('terms')}
            />
            <label htmlFor="terms" className="text-[11px] font-medium text-slate-500 cursor-pointer leading-relaxed">
              I agree to the 
              <button 
                type="button" 
                onClick={() => openLegal('Terms of Service', 'terms')}
                className="text-slate-900 font-bold hover:underline mx-1"
              >
                Terms of Service
              </button> 
              and 
              <button 
                type="button" 
                onClick={() => openLegal('Privacy Policy', 'privacy')}
                className="text-slate-900 font-bold hover:underline mx-1"
              >
                Privacy Policy
              </button>
            </label>
          </div>
          {errors.terms && <p className="text-xs text-red-500 font-medium px-0.5">{errors.terms.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading || !isValid}
          className="w-full bg-slate-900 text-white text-[11px] uppercase tracking-widest font-bold py-3 px-4 rounded-md hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.99] mt-4"
        >
          {loading ? 'Initializing...' : 'Create Account'}
        </button>

        <FormFooter 
          secondaryText="Already have an account?" 
          secondaryAction={{ text: 'Sign in instead', to: '/login' }}
        />
      </form>
    </AuthLayout>
  );
};

export default Register;
