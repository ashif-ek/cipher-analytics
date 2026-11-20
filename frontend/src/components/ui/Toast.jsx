import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 5000 }) => {
  // Errors are persistent by default unless explicitly specified
  const effectiveDuration = type === 'error' ? 0 : duration;

  useEffect(() => {
    if (effectiveDuration > 0) {
      const timer = setTimeout(onClose, effectiveDuration);
      return () => clearTimeout(timer);
    }
  }, [effectiveDuration, onClose]);

  if (!message) return null;

  const config = {
    success: {
      bg: 'bg-slate-900 border-emerald-500/40 text-slate-100',
      badge: 'text-emerald-400',
      icon: (
        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    error: {
      bg: 'bg-slate-900 border-rose-500/40 text-slate-100',
      badge: 'text-rose-400',
      icon: (
        <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    info: {
      bg: 'bg-slate-900 border-slate-700 text-slate-100',
      badge: 'text-sky-400',
      icon: (
        <svg className="w-4 h-4 text-sky-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    loading: {
      bg: 'bg-slate-900 border-sky-500/40 text-slate-100',
      badge: 'text-sky-400',
      icon: (
        <svg className="animate-spin h-4 w-4 text-sky-400 shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      )
    }
  };

  const { bg, icon } = config[type] || config.info;

  return (
    <div className="fixed bottom-5 right-5 z-[100] animate-in slide-in-from-bottom-2 fade-in duration-200">
      <div className={`${bg} px-4 py-3 rounded-md shadow-xl flex items-center min-w-[300px] max-w-md border font-sans`}>
        <div className="mr-3">
          {icon}
        </div>
        <div className="flex-1 text-xs font-medium tracking-tight pr-3 text-slate-200 leading-snug">
          {message}
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors focus:outline-none"
          title="Dismiss"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toast;
