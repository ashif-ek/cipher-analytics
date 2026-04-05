import React from 'react';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    UPLOADING: { color: 'bg-slate-50 text-slate-500 border-slate-200', text: 'Uploading', icon: null },
    PROCESSING: { 
      color: 'bg-amber-50 text-amber-600 border-amber-200', 
      text: 'Encrypting (FHE)',
      icon: (
        <svg className="animate-spin -ml-1 mr-2 h-2.5 w-2.5 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )
    },
    READY: { color: 'bg-emerald-50 text-emerald-600 border-emerald-200', text: 'Ready', icon: null },
    FAILED: { color: 'bg-red-50 text-red-600 border-red-200', text: 'Failed', icon: null },
    PRIVATE: { color: 'bg-indigo-50 text-indigo-600 border-indigo-200', text: 'Private', icon: null },
    DISCOVERABLE: { color: 'bg-blue-50 text-blue-600 border-blue-200', text: 'Discoverable', icon: null },
    STRICT: { color: 'bg-red-50 text-red-600 border-red-200', text: 'Strict', icon: null },
    COLLABORATIVE: { color: 'bg-purple-50 text-purple-600 border-purple-200', text: 'Collaboration', icon: null },
    AGGREGATED: { color: 'bg-emerald-50 text-emerald-600 border-emerald-200', text: 'Aggregated', icon: null },
    PENDING: { color: 'bg-amber-50 text-amber-600 border-amber-200', text: 'Pending', icon: null },
    APPROVED: { color: 'bg-emerald-50 text-emerald-600 border-emerald-200', text: 'Approved', icon: null },
    REJECTED: { color: 'bg-red-50 text-red-600 border-red-200', text: 'Rejected', icon: null },
    REVOKED: { color: 'bg-slate-100 text-slate-500 border-slate-300', text: 'Revoked', icon: null },
  };

  const config = statusConfig[status] || { color: 'bg-slate-50 text-slate-500 border-slate-200', text: status, icon: null };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${config.color} shadow-sm`}>
      {config.icon}
      {config.text}
    </span>
  );
};

export default StatusBadge;
