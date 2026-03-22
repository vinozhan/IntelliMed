const colorMap = {
  primary: { solid: 'bg-primary-600 text-white', soft: 'bg-primary-100 text-primary-700' },
  accent: { solid: 'bg-accent-600 text-white', soft: 'bg-accent-100 text-accent-700' },
  warm: { solid: 'bg-warm-500 text-white', soft: 'bg-warm-100 text-warm-700' },
  danger: { solid: 'bg-danger-600 text-white', soft: 'bg-danger-100 text-danger-700' },
  slate: { solid: 'bg-slate-600 text-white', soft: 'bg-slate-100 text-slate-700' },
  purple: { solid: 'bg-purple-600 text-white', soft: 'bg-purple-100 text-purple-700' },
  blue: { solid: 'bg-blue-600 text-white', soft: 'bg-blue-100 text-blue-700' },
};

const statusColorMap = {
  PENDING: 'warm',
  CONFIRMED: 'blue',
  COMPLETED: 'accent',
  CANCELLED: 'danger',
  REJECTED: 'danger',
  FAILED: 'danger',
  REFUNDED: 'slate',
  ACTIVE: 'accent',
  INACTIVE: 'danger',
  PATIENT: 'slate',
  DOCTOR: 'blue',
  ADMIN: 'purple',
};

export default function Badge({
  children,
  color,
  status,
  variant = 'soft',
  dot = false,
  className = '',
}) {
  const resolvedColor = color || statusColorMap[status] || 'slate';
  const colors = colorMap[resolvedColor] || colorMap.slate;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors[variant]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${variant === 'soft' ? 'bg-current' : 'bg-white/70'}`} />}
      {children || status}
    </span>
  );
}
