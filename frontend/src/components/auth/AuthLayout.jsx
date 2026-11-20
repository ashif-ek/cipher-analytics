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

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-slate-50 font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* Minimal Top Brand Bar */}
      <header className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs shadow-sm">
            C
          </div>
          <span className="font-mono text-sm font-bold tracking-tight text-slate-900">CIPHER ANALYTICS</span>
        </Link>

        <Link 
          to="/" 
          className="text-xs font-mono text-slate-500 hover:text-slate-900 transition-colors"
        >
          &larr; Back to Public Overview
        </Link>
      </header>

      {/* Centered Independent Authentication Card */}
      <main className="w-full max-w-[420px] mx-auto px-6 py-8">
        <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
          <div className="space-y-1.5 mb-6 text-center">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
            <p className="text-xs text-slate-500 leading-normal">{subtitle}</p>
          </div>

          <div>
            {children}
          </div>
        </div>
      </main>

      {/* Minimal Bottom Footer */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
        <div>&copy; {new Date().getFullYear()} Cipher Analytics • High-Dimensional Privacy Enclave</div>
        <div>FIPS 140-3 Cryptographic Standards Aligned</div>
      </footer>
    </div>
  );
};

export default AuthLayout;
