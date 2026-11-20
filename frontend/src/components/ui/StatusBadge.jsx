import React from 'react';

const StatusBadge = ({ status, errorMessage }) => {
  const statusConfig = {
    UPLOADING: { 
      color: 'bg-slate-100 text-slate-700 border-slate-300', 
      dot: 'bg-slate-400',
      text: 'UPLOADING', 
      icon: null 
    },
    PROCESSING: { 
      color: 'bg-amber-50 text-amber-800 border-amber-200/80', 
      dot: 'bg-amber-500',
      text: 'PROCESSING',
      icon: (
        <svg className="animate-spin -ml-0.5 mr-1.5 h-2.5 w-2.5 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )
    },
    READY: { 
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200/80', 
      dot: 'bg-emerald-500',
      text: 'READY', 
      icon: null 
    },
    FAILED: { 
      color: 'bg-rose-50 text-rose-800 border-rose-200/80', 
      dot: 'bg-rose-500',
      text: 'FAILED', 
      icon: null 
    },
    PRIVATE: { 
      color: 'bg-slate-100 text-slate-700 border-slate-200', 
      dot: 'bg-slate-400',
      text: 'PRIVATE', 
      icon: null 
    },
    DISCOVERABLE: { 
      color: 'bg-sky-50 text-sky-800 border-sky-200/80', 
      dot: 'bg-sky-500',
      text: 'DISCOVERABLE', 
      icon: null 
    },
    STRICT: { 
      color: 'bg-purple-50 text-purple-800 border-purple-200/80', 
      dot: 'bg-purple-500',
      text: 'STRICT', 
      icon: null 
    },
    COLLABORATIVE: { 
      color: 'bg-indigo-50 text-indigo-800 border-indigo-200/80', 
      dot: 'bg-indigo-500',
      text: 'COLLABORATIVE', 
      icon: null 
    },
    AGGREGATED: { 
      color: 'bg-teal-50 text-teal-800 border-teal-200/80', 
      dot: 'bg-teal-500',
      text: 'AGGREGATED', 
      icon: null 
    },
    WHITELIST: { 
      color: 'bg-blue-50 text-blue-800 border-blue-200/80', 
      dot: 'bg-blue-500',
      text: 'WHITELIST', 
      icon: null 
    },
    PENDING: { 
      color: 'bg-amber-50 text-amber-800 border-amber-200/80', 
      dot: 'bg-amber-500',
      text: 'PENDING', 
      icon: null 
    },
    APPROVED: { 
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200/80', 
      dot: 'bg-emerald-500',
      text: 'AUTHORIZED', 
      icon: null 
    },
    REJECTED: { 
      color: 'bg-rose-50 text-rose-800 border-rose-200/80', 
      dot: 'bg-rose-500',
      text: 'REJECTED', 
      icon: null 
    },
    REVOKED: { 
      color: 'bg-slate-100 text-slate-600 border-slate-200', 
      dot: 'bg-slate-400',
      text: 'REVOKED', 
      icon: null 
    },
  };

  const config = statusConfig[status] || { 
    color: 'bg-slate-100 text-slate-700 border-slate-200', 
    dot: 'bg-slate-400',
    text: status, 
    icon: null 
  };

  return (
    <span 
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${config.color} tracking-tight select-none`}
      title={errorMessage}
    >
      {config.icon ? (
        config.icon
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot} mr-1.5 shrink-0`}></span>
      )}
      {config.text}
    </span>
  );
};

export default StatusBadge;
