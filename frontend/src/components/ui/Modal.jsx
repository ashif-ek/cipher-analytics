import React from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  variant = 'info',
  size = 'md',
  showIcon = true
}) => {
  if (!isOpen) return null;

  const config = {
    danger: { 
      button: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500/30', 
      iconBg: 'bg-rose-50 border-rose-200 text-rose-600', 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    },
    success: { 
      button: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500/30', 
      iconBg: 'bg-emerald-50 border-emerald-200 text-emerald-600', 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    },
    info: { 
      button: 'bg-slate-900 hover:bg-slate-800 text-white focus:ring-slate-500/30', 
      iconBg: 'bg-sky-50 border-sky-200 text-sky-600', 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    }
  };

  const activeConfig = config[variant] || config.info;
  const maxWidth = size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-lg';

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-[2px] transition-opacity" 
          aria-hidden="true" 
          onClick={onClose}
        ></div>

        <div className={`relative inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 ${maxWidth} sm:w-full z-10 border border-slate-200`}>
          <div className="bg-white px-6 pt-6 pb-5">
            <div className="sm:flex sm:items-start">
              {showIcon && (
                <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-9 w-9 rounded-md border ${activeConfig.iconBg} sm:mx-0 mb-3 sm:mb-0`}>
                  <svg className="h-4.5 w-4.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {activeConfig.icon}
                  </svg>
                </div>
              )}
              <div className={`mt-0 text-center sm:text-left flex-1 ${showIcon ? 'sm:ml-4' : ''}`}>
                <h3 className="text-sm font-semibold text-slate-900 tracking-tight" id="modal-title">
                  {title}
                </h3>
                <div className="mt-2 text-xs text-slate-600 leading-relaxed">
                  {message}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-50/80 px-6 py-3 sm:flex sm:flex-row-reverse gap-2 border-t border-slate-200">
            <button
              type="button"
              className={`w-full sm:w-auto inline-flex justify-center items-center rounded px-3.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 transition-colors shadow-sm ${activeConfig.button}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
            <button
              type="button"
              className="mt-2 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center rounded px-3.5 py-1.5 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-300 transition-colors"
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
