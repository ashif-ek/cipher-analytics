import React from 'react';

const Modal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', variant = 'danger' }) => {
  if (!isOpen) return null;

  const config = {
    danger: { 
      button: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500', 
      iconBg: 'bg-red-100', 
      iconColor: 'text-red-600',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    },
    success: { 
      button: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500', 
      iconBg: 'bg-emerald-100', 
      iconColor: 'text-emerald-600',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    },
    info: { 
      button: 'bg-slate-900 hover:bg-slate-800 text-white focus:ring-slate-900', 
      iconBg: 'bg-blue-100', 
      iconColor: 'text-blue-600',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    }
  };

  const activeConfig = config[variant] || config.info;
  const buttonColor = activeConfig.button;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
          aria-hidden="true" 
          onClick={onClose}
        ></div>

        {/* Modal Box */}
        <div className="relative inline-block align-middle bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full z-10">
          <div className="bg-white px-6 pt-6 pb-5 sm:pb-6">
            <div className="sm:flex sm:items-start">
              <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${activeConfig.iconBg} sm:mx-0 sm:h-10 sm:w-10 mb-4 sm:mb-0`}>
                <svg className={`h-6 w-6 ${activeConfig.iconColor}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  {activeConfig.icon}
                </svg>
              </div>
              <div className="mt-2 text-center sm:ml-4 sm:text-left">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight" id="modal-title">
                  {title}
                </h3>
                <div className="mt-3 text-sm text-slate-600 leading-relaxed">
                  {message}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 px-6 py-4 sm:flex sm:flex-row-reverse border-t border-slate-100">
            <button
              type="button"
              className={`w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-6 py-2.5 text-sm font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto transition-all ${buttonColor}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-xl border border-slate-200 shadow-sm px-6 py-2.5 bg-white text-sm font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto transition-all"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
