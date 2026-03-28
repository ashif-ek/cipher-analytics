import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { LegalContent } from './LegalContent';

const AuthLayout = ({ children, title, subtitle }) => {
  const [modal, setModal] = useState({ isOpen: false, title: '', type: '' });

  const openLegal = (title, type) => {
    setModal({ isOpen: true, title, type });
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 font-sans px-4 text-slate-900 overflow-hidden">
      <div className="w-full max-w-[400px] bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header Section */}
        <div className="p-8 pb-4 text-center flex-shrink-0">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-slate-900 text-white font-bold rounded-lg mb-4 shadow-sm">
            C
          </div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">{title}</h1>
          <p className="text-xs text-slate-500 mt-1.5 font-medium">{subtitle}</p>
        </div>

        {/* Form Section */}
        <div className="px-10 py-4 overflow-y-auto custom-scrollbar flex-grow">
          {React.cloneElement(children, { openLegal })}
        </div>
      </div>
      
      {/* Footer */}
      <p className="mt-6 text-xs text-slate-400 font-medium tracking-tight flex-shrink-0">
        © 2026 Cipher Analytics
      </p>

      <Modal 
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        confirmText="Acknowledged"
        showIcon={false}
        size="lg"
        message={<LegalContent type={modal.type} />}
      />
    </div>
  );
};

export default AuthLayout;
