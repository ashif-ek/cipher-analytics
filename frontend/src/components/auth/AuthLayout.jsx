import React, { useState, createContext, useContext } from 'react';
import Modal from '../ui/Modal';
import { LegalContent } from './LegalContent';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const AuthLayout = ({ children, title, subtitle }) => {
  const [modal, setModal] = useState({ isOpen: false, title: '', type: '' });

  const openLegal = (title, type) => {
    setModal({ isOpen: true, title, type });
  };

  return (
    <AuthContext.Provider value={{ openLegal }}>
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 font-sans px-4 text-slate-900 overflow-hidden">
        <div className="w-full max-w-[400px] bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden flex flex-col max-h-[98vh]">
          {/* Header Section - Minimalist & Compact */}
          <div className="p-6 pb-2 text-center flex-shrink-0">
            <div className="inline-flex items-center justify-center w-9 h-9 bg-slate-900 text-white font-bold rounded-lg mb-3 shadow-sm select-none">
              C
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">{title}</h1>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">{subtitle}</p>
          </div>

          {/* Form Section - Scrollable if needed, but optimized to not scroll */}
          <div className="px-8 py-2 overflow-y-auto custom-scrollbar flex-grow">
            {children}
          </div>
        </div>
        
        {/* Footer - Fixed position at bottom of viewport area */}
        <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest flex-shrink-0 opacity-60">
          © 2026 Cipher Analytics • Industrial Standard
        </p>

        <Modal 
          isOpen={modal.isOpen}
          onClose={() => setModal({ ...modal, isOpen: false })}
          onConfirm={() => setModal({ ...modal, isOpen: false })}
          title={modal.title}
          confirmText="Understand & Acknowledge"
          showIcon={false}
          size="lg"
          message={<LegalContent type={modal.type} />}
        />
      </div>
    </AuthContext.Provider>
  );
};

export default AuthLayout;
