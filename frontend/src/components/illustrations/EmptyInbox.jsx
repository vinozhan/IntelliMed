export default function EmptyInbox({ className = '', size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect x="25" y="35" width="70" height="55" rx="10" className="fill-slate-100 stroke-slate-300" strokeWidth="2" />
      <path d="M25 60 L60 78 L95 60" className="stroke-slate-300" strokeWidth="2" fill="none" />
      <rect x="30" y="28" width="60" height="12" rx="6" className="fill-primary-100" />
      <line x1="42" y1="50" x2="65" y2="50" className="stroke-slate-200" strokeWidth="2" strokeLinecap="round" />
      <line x1="42" y1="56" x2="58" y2="56" className="stroke-slate-200" strokeWidth="2" strokeLinecap="round" />
      <circle cx="82" cy="32" r="8" className="fill-primary-200" />
      <text x="79" y="36" className="fill-primary-500" fontSize="11" fontWeight="bold" fontFamily="sans-serif">0</text>
      <circle cx="30" cy="95" r="2" className="fill-warm-200" />
      <circle cx="90" cy="95" r="2" className="fill-accent-200" />
    </svg>
  );
}
