import React from 'react';

const InputField = React.forwardRef(({ label, error, helperText, className = '', id, ...props }, ref) => {
  const inputId = id || props.name;

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex justify-between items-baseline">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-slate-700 tracking-tight select-none">
            {label}
          </label>
        )}
        {error && (
          <span className="text-[11px] font-medium text-rose-600 tracking-tight" role="alert">
            {error}
          </span>
        )}
      </div>

      <input
        ref={ref}
        id={inputId}
        {...props}
        className={`w-full px-3.5 py-2.5 bg-white border ${
          error 
            ? 'border-rose-400 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/10' 
            : 'border-slate-300 hover:border-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10'
        } rounded-md text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 transition-all shadow-sm outline-none ${className}`}
      />

      {helperText && !error && (
        <p className="text-[11px] text-slate-500 leading-normal">{helperText}</p>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';

export default InputField;
