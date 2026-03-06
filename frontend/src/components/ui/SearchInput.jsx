import { useState, useRef } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchInput({
  value: controlledValue,
  onChange,
  placeholder = 'Search...',
  debounce = 300,
  className = '',
}) {
  const [internal, setInternal] = useState(controlledValue || '');
  const timerRef = useRef(null);

  const displayValue = controlledValue !== undefined ? controlledValue : internal;

  const handleChange = (val) => {
    setInternal(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange?.(val), debounce);
  };

  const clear = () => {
    setInternal('');
    onChange?.('');
  };

  return (
    <div className={`relative ${className}`}>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={displayValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        aria-label={placeholder}
      />
      {displayValue && (
        <button
          onClick={clear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
