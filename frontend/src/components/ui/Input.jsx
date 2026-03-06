import { forwardRef, useId } from 'react';

const Input = forwardRef(function Input({
  label,
  error,
  helperText,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  ...props
}, ref) {
  const id = useId();
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-slate-50 disabled:text-slate-500 ${
            Icon ? 'pl-10' : ''
          } ${IconRight ? 'pr-10' : ''} ${
            error ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500' : 'border-slate-200'
          }`}
          {...props}
        />
        {IconRight && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <IconRight size={18} />
          </div>
        )}
      </div>
      {error && <p id={errorId} className="mt-1 text-xs text-danger-600" role="alert">{error}</p>}
      {helperText && !error && <p id={helperId} className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
});

export default Input;
