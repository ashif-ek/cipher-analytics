import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordField = React.forwardRef(({ label, error, ...props }, ref) => {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-2 w-full">
      <div className="flex justify-between items-baseline px-0.5">
        <label className="text-sm font-semibold text-slate-700">
          {label}
        </label>
        {error && (
          <span className="text-xs text-red-500 font-medium">
            {error}
          </span>
        )}
      </div>
      <div className="relative group">
        <input
          ref={ref}
          type={show ? 'text' : 'password'}
          {...props}
          className={`w-full px-3 py-2 pr-10 bg-white border ${
            error ? 'border-red-500 ring-2 ring-red-500/5' : 'border-slate-200'
          } rounded text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all shadow-sm`}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none p-1"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
});

PasswordField.displayName = 'PasswordField';

export default PasswordField;
