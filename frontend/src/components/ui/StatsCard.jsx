export default function StatsCard({ icon, label, value, trend, color = 'primary', loading = false }) {
  const colorMap = {
    primary: 'bg-primary-100 text-primary-600',
    accent: 'bg-accent-100 text-accent-600',
    warm: 'bg-warm-100 text-warm-600',
    danger: 'bg-danger-100 text-danger-600',
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
  };

  const IconComponent = icon;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <IconComponent size={20} />
        </div>
        <span className="text-sm font-medium text-slate-500">{label}</span>
      </div>
      {loading ? (
        <div className="h-8 w-20 bg-slate-200 animate-pulse rounded-md" />
      ) : (
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-heading text-slate-800">{value}</span>
          {trend && (
            <span className={`text-xs font-medium ${trend > 0 ? 'text-accent-600' : 'text-danger-600'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}
