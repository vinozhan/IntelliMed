import { forwardRef, useId } from 'react';

const Textarea = forwardRef(function Textarea({
  label,
  error,
  helperText,
  className = '',
  ...props
}, ref) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-slate-50 resize-y ${
          error ? 'border-danger-300 focus:ring-danger-500' : 'border-slate-200'
        }`}
        {...props}
      />
      {error && <p id={errorId} className="mt-1 text-xs text-danger-600" role="alert">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
});

export default Textarea;
