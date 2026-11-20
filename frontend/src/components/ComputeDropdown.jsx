import React, { useRef, useEffect } from 'react';

const OPERATIONS = [
  { id: 'sum', label: 'Sum', desc: 'Additive FHE vector aggregation' },
  { id: 'mean', label: 'Mean', desc: 'Secure enclave arithmetic mean' },
  { id: 'variance', label: 'Variance', desc: 'Second central moment computation' },
  { id: 'std_deviation', label: 'Std Deviation', desc: 'Dispersion measurement' },
  { id: 'correlation', label: 'Correlation (ML)', desc: 'Pearson dependency matrix' },
  { id: 'anomaly_detection', label: 'Anomaly Detection (ML)', desc: 'Isolation Forest & SHAP' }
];

const ComputeDropdown = ({ disabled, isComputing, isOpen, onToggle, onCompute, onClear }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (isOpen) onToggle(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => {
           if(!disabled && !isComputing) onToggle(!isOpen)
        }}
        disabled={disabled || isComputing}
        className={`inline-flex items-center px-2.5 py-1.5 border text-xs font-medium rounded transition-colors group ${
          disabled || isComputing 
            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-sm'
        }`}
      >
         {isComputing ? (
            <>
               <svg className="animate-spin mr-1.5 h-3 w-3 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               <span className="font-mono text-[11px]">Computing...</span>
            </>
         ) : (
            <>
               <span>Compute</span>
               <svg className="ml-1.5 h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
               </svg>
            </>
         )}
      </button>

      {isOpen && !disabled && !isComputing && (
        <div className="absolute right-0 z-20 mt-1 w-56 origin-top-right rounded-md bg-white shadow-lg border border-slate-200 focus:outline-none py-1 animate-in fade-in duration-100">
          <div className="px-3 py-1.5 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
            FHE & ML Primitives
          </div>
          {OPERATIONS.map((op) => (
            <button
              key={op.id}
              onClick={() => {
                onCompute(op.id);
                onToggle(false);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-slate-50 transition-colors group"
            >
              <div className="text-xs font-medium text-slate-700 group-hover:text-sky-600">
                {op.label}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {op.desc}
              </div>
            </button>
          ))}
          <div className="border-t border-slate-100 my-1"></div>
          <button
            onClick={() => {
              onClear();
              onToggle(false);
            }}
            className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
          >
            Clear Stored Results
          </button>
        </div>
      )}
    </div>
  );
};

export default ComputeDropdown;
