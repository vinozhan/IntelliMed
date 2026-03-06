export default function Skeleton({ variant = 'text', width, height, className = '' }) {
  const base = 'bg-slate-200 animate-pulse';

  if (variant === 'circle') {
    return (
      <div
        className={`${base} rounded-full ${className}`}
        style={{ width: width || 40, height: height || 40 }}
      />
    );
  }

  if (variant === 'rect') {
    return (
      <div
        className={`${base} rounded-xl ${className}`}
        style={{ width: width || '100%', height: height || 120 }}
      />
    );
  }

  return (
    <div
      className={`${base} rounded-md h-4 ${className}`}
      style={{ width: width || '100%' }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
      <Skeleton width="60%" />
      <Skeleton width="80%" />
      <Skeleton width="40%" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} width={`${100 / cols}%`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
