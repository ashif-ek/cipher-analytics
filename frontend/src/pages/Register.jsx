import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import client from '../api/client';
import Toast from '../components/ui/Toast';
import AuthLayout, { useAuth } from '../components/auth/AuthLayout';
import InputField from '../components/auth/InputField';
import PasswordField from '../components/auth/PasswordField';
import FormFooter from '../components/auth/FormFooter';
import { Database, LineChart, ArrowRight, CheckCircle2 } from 'lucide-react';

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address format'),
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

const Register = () => {
  const { openLegal } = useAuth();
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
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      role: 'DATA_OWNER'
    }
  });

  const passwordValue = watch('password', '');

  const getRequirements = (pass) => {
    return [
      { text: 'At least 8 characters', met: pass.length >= 8 },
      { text: 'Upper & lowercase letters', met: /[A-Z]/.test(pass) && /[a-z]/.test(pass) },
      { text: 'At least one number (0-9)', met: /[0-9]/.test(pass) },
      { text: 'At least one symbol (!@#$...)', met: /[^A-Za-z0-9]/.test(pass) },
    ];
  };

  const requirements = getRequirements(passwordValue);
  const metCount = requirements.filter(r => r.met).length;

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { confirmPassword: _confirmPassword, terms: _terms, ...registerData } = data;
      await client.post('accounts/register/', registerData);
      setToast({ message: 'Identity initialized. Dispatching verification token...', type: 'success' });
      
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

  const selectedRole = watch('role');

  return (
    <AuthLayout 
      title="Create Enclave Identity" 
      subtitle="Register an institutional Data Owner or certified Researcher account."
      badge="ORGANIZATION ONBOARDING"
      maxWidth="max-w-[560px]"
    >
      {toast.message && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ message: '', type: 'success' })} 
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        
        {/* Step 1: Institutional Role Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 tracking-tight block">
            Select Institutional Role
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => register('role').onChange({ target: { name: 'role', value: 'DATA_OWNER' }})}
              className={`p-3.5 border rounded-md text-left transition-all ${
                selectedRole === 'DATA_OWNER' 
                  ? 'border-slate-900 bg-slate-900 text-white shadow-sm ring-1 ring-slate-900' 
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Database className={`w-4 h-4 ${selectedRole === 'DATA_OWNER' ? 'text-white' : 'text-slate-600'}`} />
                <span className="text-xs font-bold tracking-tight">Data Owner</span>
              </div>
              <p className={`text-[11px] mt-1.5 leading-snug ${
                selectedRole === 'DATA_OWNER' ? 'text-slate-300' : 'text-slate-500'
              }`}>
                Ingest, encrypt with TenSEAL, and govern research grants.
              </p>
            </button>

            <button
              type="button"
              onClick={() => register('role').onChange({ target: { name: 'role', value: 'RESEARCHER' }})}
              className={`p-3.5 border rounded-md text-left transition-all ${
                selectedRole === 'RESEARCHER' 
                  ? 'border-slate-900 bg-slate-900 text-white shadow-sm ring-1 ring-slate-900' 
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                <LineChart className={`w-4 h-4 ${selectedRole === 'RESEARCHER' ? 'text-white' : 'text-slate-600'}`} />
                <span className="text-xs font-bold tracking-tight">Certified Researcher</span>
              </div>
              <p className={`text-[11px] mt-1.5 leading-snug ${
                selectedRole === 'RESEARCHER' ? 'text-slate-300' : 'text-slate-500'
              }`}>
                Submit FHE queries and compute statistics across cohorts.
              </p>
            </button>
            <input type="hidden" {...register('role')} />
          </div>
        </div>

        {/* Step 2: Account Identity Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <InputField
            label="Enclave Handle"
            placeholder="e.g. jdoe_lab"
            autoComplete="username"
            error={errors.username?.message}
            {...register('username')}
          />
          <InputField
            label="Corporate Email"
            placeholder="jdoe@institute.org"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        {/* Step 3: Security & Passphrase */}
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PasswordField
              label="Password"
              placeholder="••••••••••••"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />
            
            <PasswordField
              label="Confirm Password"
              placeholder="••••••••••••"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>

          {/* Cryptographic Password Strength Meter */}
          <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-500">ENTROPY VALIDATION:</span>
              <span className={`font-semibold ${
                metCount === 4 ? 'text-emerald-700' : metCount >= 2 ? 'text-amber-700' : 'text-slate-500'
              }`}>
                {metCount === 4 ? 'STRONG PASSKEY' : metCount >= 2 ? 'ACCEPTABLE' : 'MINIMUM CRITERIA REQUIRED'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
              {requirements.map((req, idx) => (
                <div key={idx} className="flex items-center space-x-1.5 text-slate-600">
                  <span className={`w-1.5 h-1.5 rounded-full ${req.met ? 'bg-emerald-600' : 'bg-slate-300'}`}></span>
                  <span className={req.met ? 'text-slate-900 font-medium' : 'text-slate-500'}>{req.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step 4: Policy & Consent */}
        <div className="pt-2">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="terms"
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900/10 cursor-pointer shrink-0"
              {...register('terms')}
            />
            <label htmlFor="terms" className="text-xs text-slate-600 cursor-pointer leading-relaxed select-none">
              I acknowledge and agree to the 
              <button 
                type="button" 
                onClick={() => openLegal('Terms of Service', 'terms')}
                className="text-slate-900 font-semibold hover:underline mx-1"
              >
                Terms of Service
              </button> 
              and 
              <button 
                type="button" 
                onClick={() => openLegal('Privacy Policy', 'privacy')}
                className="text-slate-900 font-semibold hover:underline mx-1"
              >
                Zero-Trust Privacy Policy
              </button>.
            </label>
          </div>
          {errors.terms && (
            <p className="text-xs text-rose-600 font-medium mt-1 px-1">{errors.terms.message}</p>
          )}
        </div>

        {/* Step 5: Primary Action Button */}
        <button
          type="submit"
          disabled={loading || !isValid}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-semibold py-3 px-4 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.99] flex items-center justify-center space-x-2 mt-2"
        >
          {loading ? (
            <span>Provisioning Enclave Account...</span>
          ) : (
            <>
              <span>Initialize Enclave Account</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </>
          )}
        </button>

        <FormFooter 
          secondaryText="Already registered with Cipher Analytics?" 
          secondaryAction={{ text: 'Sign in to console', to: '/login' }}
        />
      </form>
    </AuthLayout>
  );
};

export default Register;
