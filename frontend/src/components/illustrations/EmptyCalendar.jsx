export default function EmptyCalendar({ className = '', size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect x="20" y="30" width="80" height="70" rx="12" className="fill-slate-100 stroke-slate-300" strokeWidth="2" />
      <rect x="20" y="30" width="80" height="20" rx="12" className="fill-primary-100" />
      <rect x="20" y="42" width="80" height="8" className="fill-primary-100" />
      <rect x="38" y="22" width="4" height="16" rx="2" className="fill-slate-300" />
      <rect x="78" y="22" width="4" height="16" rx="2" className="fill-slate-300" />
      <rect x="32" y="60" width="12" height="10" rx="2" className="fill-slate-200" />
      <rect x="54" y="60" width="12" height="10" rx="2" className="fill-slate-200" />
      <rect x="76" y="60" width="12" height="10" rx="2" className="fill-slate-200" />
      <rect x="32" y="78" width="12" height="10" rx="2" className="fill-slate-200" />
      <rect x="54" y="78" width="12" height="10" rx="2" className="fill-slate-200" />
      <circle cx="82" cy="83" r="3" className="fill-primary-300" />
      <path d="M50 95 C55 88, 65 88, 70 95" className="stroke-slate-300" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="46" cy="48" r="1.5" className="fill-primary-400" />
      <circle cx="74" cy="48" r="1.5" className="fill-primary-400" />
    </svg>
  );
}
