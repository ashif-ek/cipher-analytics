import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 5000 }) => {
  // Errors should be persistent unless duration is explicitly passed
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
      bg: 'bg-emerald-600',
      icon: (
        <svg className="w-5 h-5 text-emerald-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    error: {
      bg: 'bg-rose-600',
      icon: (
        <svg className="w-5 h-5 text-rose-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    info: {
      bg: 'bg-slate-800',
      icon: (
        <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    loading: {
      bg: 'bg-blue-600',
      icon: (
        <svg className="animate-spin h-5 w-5 text-blue-100" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      )
    }
  };

  const { bg, icon } = config[type] || config.info;

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-right-5 fade-in duration-300">
      <div className={`${bg} text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center min-w-[320px] max-w-md border border-white/10 backdrop-blur-sm`}>
        <div className="flex-shrink-0 mr-4">
          {icon}
        </div>
        <div className="flex-1 text-[13px] font-bold tracking-tight pr-4">
          {message}
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white focus:outline-none"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toast;
