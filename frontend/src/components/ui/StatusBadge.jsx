import React from 'react';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    UPLOADING: { color: 'bg-slate-50 text-slate-500 border-slate-200', text: 'UPLOADING', icon: null },
    PROCESSING: { 
      color: 'bg-amber-50 text-amber-700 border-amber-200', 
      text: 'PROCESSING',
      icon: (
        <svg className="animate-spin -ml-0.5 mr-1.5 h-2 w-2 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )
    },
    READY: { color: 'bg-emerald-50 text-emerald-700 border-emerald-300', text: 'ACTIVE / READY', icon: null },
    FAILED: { color: 'bg-red-50 text-red-700 border-red-200', text: 'FAILED', icon: null },
    PRIVATE: { color: 'bg-slate-100 text-slate-600 border-slate-300', text: 'PRIVATE', icon: null },
    DISCOVERABLE: { color: 'bg-blue-50 text-blue-700 border-blue-200', text: 'DISCOVERABLE', icon: null },
    STRICT: { color: 'bg-red-50 text-red-700 border-red-200', text: 'STRICT', icon: null },
    COLLABORATIVE: { color: 'bg-purple-50 text-purple-700 border-purple-200', text: 'COLLABORATION', icon: null },
    AGGREGATED: { color: 'bg-emerald-50 text-emerald-700 border-emerald-300', text: 'AGGREGATED', icon: null },
    PENDING: { color: 'bg-amber-50 text-amber-700 border-amber-200', text: 'PENDING', icon: null },
    APPROVED: { color: 'bg-emerald-50 text-emerald-700 border-emerald-300', text: 'AUTHORIZED', icon: null },
    REJECTED: { color: 'bg-red-50 text-red-700 border-red-200', text: 'REJECTED', icon: null },
    REVOKED: { color: 'bg-slate-200 text-slate-600 border-slate-300', text: 'REVOKED', icon: null },
  };

  const config = statusConfig[status] || { color: 'bg-slate-100 text-slate-600 border-slate-200', text: status, icon: null };

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-[2px] text-[10px] font-bold border ${config.color} leading-none tracking-tight`}>
      {config.icon}
      {config.text}
    </span>
  );
};

export default StatusBadge;
