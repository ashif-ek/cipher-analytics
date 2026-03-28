import React from 'react';

const InputField = React.forwardRef(({ label, error, ...props }, ref) => {
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
      <input
        ref={ref}
        {...props}
        className={`w-full px-4 py-2.5 bg-white border ${
          error ? 'border-red-500 ring-2 ring-red-500/5' : 'border-slate-200'
        } rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all duration-200 shadow-sm`}
      />
    </div>
  );
});

InputField.displayName = 'InputField';

export default InputField;
