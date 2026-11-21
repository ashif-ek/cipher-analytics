import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordField = React.forwardRef(({ label, error, helperText, className = '', id, ...props }, ref) => {
  const [show, setShow] = useState(false);
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

      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={show ? 'text' : 'password'}
          {...props}
          className={`w-full px-3.5 py-2.5 pr-10 bg-white border ${
            error 
              ? 'border-rose-400 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/10' 
              : 'border-slate-300 hover:border-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10'
          } rounded-md text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 transition-all shadow-sm outline-none ${className}`}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1 rounded focus:outline-none focus:ring-1 focus:ring-slate-900"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {helperText && !error && (
        <p className="text-[11px] text-slate-500 leading-normal">{helperText}</p>
      )}
    </div>
  );
});

PasswordField.displayName = 'PasswordField';

export default PasswordField;
