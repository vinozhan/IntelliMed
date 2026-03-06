export default function EmptySearch({ className = '', size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <circle cx="52" cy="52" r="28" className="fill-slate-100 stroke-slate-300" strokeWidth="2" />
      <circle cx="52" cy="52" r="20" className="stroke-primary-200" strokeWidth="2" strokeDasharray="4 3" />
      <line x1="72" y1="72" x2="92" y2="92" className="stroke-slate-300" strokeWidth="6" strokeLinecap="round" />
      <line x1="72" y1="72" x2="92" y2="92" className="stroke-slate-400" strokeWidth="3" strokeLinecap="round" />
      <text x="44" y="58" className="fill-primary-300" fontSize="22" fontWeight="bold" fontFamily="sans-serif">?</text>
      <circle cx="95" cy="30" r="3" className="fill-primary-200" />
      <circle cx="25" cy="80" r="2" className="fill-warm-200" />
      <circle cx="90" cy="75" r="2" className="fill-accent-200" />
    </svg>
  );
}
