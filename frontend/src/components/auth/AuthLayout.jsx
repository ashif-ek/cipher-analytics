import React, { useState, createContext, useContext } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../ui/Modal';
import { LegalContent } from './LegalContent';

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
 * Enterprise Full-Viewport Auth Layout
 * Optimized for min-height 100svh / 100vh with balanced vertical distribution,
 * crisp borders, brand rail telemetry, and flexible form container sizing.
 */
const AuthLayout = ({ children, title, subtitle, badge = "WORKSPACE ACCESS", maxWidth = "max-w-[480px]" }) => {
  return (
    <div className="min-h-[100vh] min-h-[100svh] w-full flex flex-col justify-between bg-[#fbfcfd] text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      {/* 1. Top Enterprise Header Bar */}
      <header className="w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs shadow-sm transition-transform group-hover:scale-95">
              C
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xs sm:text-sm font-bold tracking-tight text-slate-900">
                CIPHER ANALYTICS
              </span>
              <span className="text-[9px] font-mono tracking-wider text-slate-400 uppercase -mt-0.5">
                Privacy-Preserving Platform
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-[10px] font-mono px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>TLS 1.3 SECURE LINK</span>
            </div>

            <Link 
              to="/" 
              className="text-xs font-mono text-slate-600 hover:text-slate-900 transition-colors flex items-center space-x-1"
            >
              <span>&larr;</span>
              <span className="hidden xs:inline">Back to Overview</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Main Authentication Enclosure (Vertically Centered & Horizontally Balanced) */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-8 sm:py-12">
        <div className={`w-full ${maxWidth} transition-all`}>
          {/* Elevation Container with 1px Enterprise Border */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-9 shadow-[0_1px_3px_0_rgba(15,23,42,0.04),0_1px_2px_-1px_rgba(15,23,42,0.02)]">
            
            {/* Header Text & Badge */}
            <div className="space-y-2 mb-6">
              <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
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

          {/* Under-Card Technical Assurance */}
          <div className="mt-4 px-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>FHE ENCLAVE ISOLATION</span>
            <span>RLWE N=8192</span>
          </div>
        </div>
      </main>

      {/* 3. Enterprise Footer Bar */}
      <footer className="w-full border-t border-slate-200/80 bg-white/60 py-4 font-mono text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            &copy; {new Date().getFullYear()} Cipher Analytics Inc. • Zero-Trust Homomorphic Analytics
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>SOC2 TYPE II ALIGNED</span>
            <span>&bull;</span>
            <span>ZERO KEY CUSTODY</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
