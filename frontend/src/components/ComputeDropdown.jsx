import React, { useRef, useEffect } from 'react';

const OPERATIONS = [
  { id: 'sum', label: 'Sum' },
  { id: 'mean', label: 'Mean' },
  { id: 'variance', label: 'Variance' },
  { id: 'std_deviation', label: 'Standard Deviation' }
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
        className={`inline-flex items-center px-3 py-1.5 border border-slate-300 text-[11px] font-bold rounded-[4px] transition-all group ${
          disabled || isComputing 
            ? 'bg-slate-50 text-slate-400 cursor-not-allowed' 
            : 'bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400'
        }`}
      >
         {isComputing ? (
            <>
               <svg className="animate-spin mr-1.5 h-3.5 w-3.5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               Computing
            </>
         ) : (
            <>
               Compute
               <svg className="ml-1.5 h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
               </svg>
            </>
         )}
      </button>

      {isOpen && !disabled && !isComputing && (
        <div className="absolute right-0 z-10 mt-1 w-44 origin-top-right rounded-[4px] bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none py-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Basic Statistics
          </div>
          {OPERATIONS.map((op) => (
            <button
              key={op.id}
              onClick={() => {
                onCompute(op.id);
                onToggle(false);
              }}
              className="block w-full text-left px-4 py-2 text-[11px] font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
            >
              {op.label}
            </button>
          ))}
          <div className="border-t border-slate-100 my-1"></div>
          <button
            onClick={() => {
              onClear();
              onToggle(false);
            }}
            className="block w-full text-left px-4 py-2 text-[11px] font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            Clear Results
          </button>
        </div>
      )}
    </div>
  );
};

export default ComputeDropdown;
