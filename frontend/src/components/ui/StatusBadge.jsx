import React from 'react';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    UPLOADING: { color: 'bg-slate-100 text-slate-800 border-slate-200', text: 'Uploading', icon: null },
    PROCESSING: { 
      color: 'bg-yellow-50 text-yellow-800 border-yellow-200', 
      text: 'Encrypting (FHE)',
      icon: (
        <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-yellow-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )
    },
    READY: { color: 'bg-green-50 text-green-700 border-green-200', text: 'Ready', icon: null },
    FAILED: { color: 'bg-red-50 text-red-700 border-red-200', text: 'Failed', icon: null },
    PRIVATE: { color: 'bg-purple-50 text-purple-700 border-purple-200', text: 'Private', icon: null },
    SHARED: { color: 'bg-blue-50 text-blue-700 border-blue-200', text: 'Shared', icon: null },
    AGGREGATED: { color: 'bg-indigo-50 text-indigo-700 border-indigo-200', text: 'Aggregated', icon: null },
  };

  const config = statusConfig[status] || statusConfig.UPLOADING;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      {config.icon}
      {config.text}
    </span>
  );
};

export default StatusBadge;
