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
      button: 'bg-slate-900 hover:bg-black text-white', 
      iconBg: 'bg-red-50', 
      iconColor: 'text-red-600',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    },
    success: { 
      button: 'bg-slate-900 hover:bg-black text-white', 
      iconBg: 'bg-emerald-50', 
      iconColor: 'text-emerald-600',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    },
    info: { 
      button: 'bg-slate-900 hover:bg-black text-white', 
      iconBg: 'bg-indigo-50', 
      iconColor: 'text-indigo-600',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    }
  };

  const activeConfig = config[variant] || config.info;
  const maxWidth = size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-lg';

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] transition-opacity" 
          aria-hidden="true" 
          onClick={onClose}
        ></div>

        <div className={`relative inline-block align-middle bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 ${maxWidth} sm:w-full z-10 border border-slate-200/50`}>
          <div className="bg-white px-8 pt-8 pb-6">
            <div className="sm:flex sm:items-start">
              {showIcon && (
                <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-xl ${activeConfig.iconBg} sm:mx-0 mb-4 sm:mb-0 border border-current opacity-20`}>
                  <svg className={`h-5 w-5 ${activeConfig.iconColor}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {activeConfig.icon}
                  </svg>
                </div>
              )}
              <div className={`mt-0 text-center sm:text-left ${showIcon ? 'sm:ml-6' : ''}`}>
                <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase" id="modal-title">
                  {title}
                </h3>
                <div className="mt-4">
                  {message}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-50/50 px-8 py-5 sm:flex sm:flex-row-reverse gap-3 border-t border-slate-100">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all shadow-sm bg-slate-900 hover:bg-black text-white"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
            <button
              type="button"
              className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-xl px-6 py-2.5 bg-white text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-slate-200 transition-all sm:w-auto"
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
