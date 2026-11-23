import React, { useState, createContext, useContext } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../ui/Modal';
import { LegalContent } from './LegalContent';
import { ShieldCheck, Cpu, Lock, Network, Database, Activity } from 'lucide-react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [modal, setModal] = useState({ isOpen: false, title: '', type: 'terms' });

  const openLegal = (title, type) => {
    setModal({ isOpen: true, title, type });
  };

  return (
    <AuthContext.Provider value={{ openLegal }}>
      {children}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        confirmText="Acknowledge"
        showIcon={false}
        size="lg"
        message={<LegalContent type={modal.type} />}
      />
    </AuthContext.Provider>
  );
};

/**
 * Enterprise Split-Screen Auth Layout
 * 
 * Clean, calm enterprise palette:
 * - Removed mathematical equations and noisy telemetry blocks.
 * - Converted all loud screaming badges / labels to standard natural sentence case.
 * - Balanced layout: Desktop left informational rail, right clean form canvas.
 * 
 * @param {string} mode - "login" | "register"
 */
const AuthLayout = ({ 
  children, 
  title, 
  subtitle, 
  badge = "Workspace Access", 
  mode = "login",
  maxWidth = "max-w-[420px]" 
}) => {
  const isRegister = mode === 'register';

  return (
    <div className="min-h-[100vh] min-h-[100svh] w-full flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      
      {/* =========================================================================
          LEFT PANEL: Platform Overview (Calm, Professional Slate Neutral)
          Desktop: order-1 (lg:w-[48%] xl:w-[50%])
          Mobile: order-2 (stacks neatly below the form)
         ========================================================================= */}
      <aside 
        aria-label="Platform Architecture Overview"
        className="order-2 lg:order-1 lg:w-[48%] xl:w-[50%] bg-slate-50 border-t lg:border-t-0 lg:border-r border-slate-200/90 p-6 sm:p-10 lg:p-12 flex flex-col justify-between"
      >
        {/* 1. Header Branding */}
        <div className="flex items-center justify-between pb-4 sm:pb-6">
          <Link to="/" className="flex items-center space-x-3 group focus:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 rounded">
            <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs transition-transform group-hover:scale-95">
              C
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-slate-900">
                Cipher Analytics
              </span>
              <span className="text-[11px] text-slate-500 font-normal">
                Privacy-Preserving Platform
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-2 text-xs px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            <span>{isRegister ? 'Account onboarding' : 'Secure session'}</span>
          </div>
        </div>

        {/* 2. Platform Value Narrative */}
        <div className="my-auto py-6 space-y-6 max-w-lg">
          
          <div className="space-y-2">
            <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-200/70 border border-slate-300/80 text-slate-700 text-xs font-medium">
              {isRegister ? 'Institutional Access' : 'Encrypted Analytics Gateway'}
            </span>
            
            <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight text-slate-900 leading-snug">
              {isRegister 
                ? 'Collaborate on research without sharing raw underlying data.'
                : 'Run analytical workloads across encrypted datasets directly.'
              }
            </h2>
            
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              {isRegister
                ? 'Connect as a verified Data Owner or Certified Researcher. Cryptographic guarantees ensure raw records remain private throughout the analytical lifecycle.'
                : 'Sign in to access your secure analytical workspace. Computations evaluate directly over encrypted records with zero plaintext exposure.'
              }
            </p>
          </div>

          {/* Clean Capability Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {isRegister ? (
              <>
                <div className="p-3.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs space-y-1">
                  <div className="flex items-center space-x-2 text-slate-800">
                    <Database className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-semibold text-slate-900">Data Owner Control</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-normal">
                    Generate client encryption keys locally. You maintain sole custody over data access.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs space-y-1">
                  <div className="flex items-center space-x-2 text-slate-800">
                    <Activity className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-semibold text-slate-900">Certified Researcher</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-normal">
                    Submit statistical and machine learning queries across authorized cohorts safely.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs space-y-1">
                  <div className="flex items-center space-x-2 text-slate-800">
                    <Lock className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-semibold text-slate-900">Grant Governance</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-normal">
                    Explicit time-bound access approvals require mutual consent between parties.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs space-y-1">
                  <div className="flex items-center space-x-2 text-slate-800">
                    <ShieldCheck className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-semibold text-slate-900">Audited Compliance</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-normal">
                    Every operation is logged into immutable, auditable computational receipts.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-3.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs space-y-1">
                  <div className="flex items-center space-x-2 text-slate-800">
                    <Cpu className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-semibold text-slate-900">Encrypted Computation</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-normal">
                    Statistics, regressions, and ML models compute directly over encrypted ciphertexts.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs space-y-1">
                  <div className="flex items-center space-x-2 text-slate-800">
                    <ShieldCheck className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-semibold text-slate-900">Privacy Protection</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-normal">
                    Built-in k-anonymity checks prevent individual reconstruction or inference attacks.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs space-y-1">
                  <div className="flex items-center space-x-2 text-slate-800">
                    <Network className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-semibold text-slate-900">Distributed Workers</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-normal">
                    Dedicated worker pools handle complex tasks asynchronously in the background.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs space-y-1">
                  <div className="flex items-center space-x-2 text-slate-800">
                    <Activity className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-semibold text-slate-900">Real-Time Updates</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-normal">
                    Live WebSocket channels provide instantaneous status updates without page reloads.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 3. Footer Telemetry */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Zero key custody</span>
          <Link to="/" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
            Back to overview
          </Link>
        </div>
      </aside>

      {/* =========================================================================
          RIGHT PANEL: Clean, Mature White Form Container
          Desktop: order-2 (lg:w-[52%] xl:w-[50%])
          Mobile: order-1 (displayed immediately at top)
         ========================================================================= */}
      <main 
        role="main"
        className="order-1 lg:order-2 lg:w-[52%] xl:w-[50%] bg-white flex flex-col justify-center px-4 sm:px-8 lg:px-12 py-6 sm:py-8 lg:py-10 lg:overflow-y-auto"
      >
        <div className={`w-full ${maxWidth} mx-auto transition-all`}>
          
          {/* Mobile-Only Top Navigation Bar */}
          <div className="lg:hidden flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                C
              </div>
              <span className="text-sm font-semibold tracking-tight text-slate-900">
                Cipher Analytics
              </span>
            </Link>
            <div className="flex items-center space-x-1.5 text-xs text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>Secure Link</span>
            </div>
          </div>

          {/* Clean Form Card with Subtle 1px Border and Soft Enterprise Shadow */}
          <div className="bg-white border border-slate-200/90 rounded-lg p-5 sm:p-7 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)]">
            
            {/* Header Text & Badge */}
            <div className="space-y-1 mb-5">
              <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium">
                <span>{badge}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Form Slot */}
            <div>
              {children}
            </div>
          </div>

          {/* Under-Card Subtle Note */}
          <div className="mt-3 px-1 flex items-center justify-between text-xs text-slate-400">
            <span>Encrypted transmission</span>
            <span>Session expiry: 24h</span>
          </div>
        </div>
      </main>

    </div>
  );
};

export default AuthLayout;