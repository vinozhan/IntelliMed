export default function Skeleton({ variant = 'text', width, height, className = '', shimmer = false }) {
  const base = shimmer
    ? 'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer'
    : 'bg-slate-200 animate-pulse';

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

export function SkeletonCard({ shimmer = false }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
      <Skeleton width="60%" shimmer={shimmer} />
      <Skeleton width="80%" shimmer={shimmer} />
      <Skeleton width="40%" shimmer={shimmer} />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4, shimmer = false }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} width={`${100 / cols}%`} shimmer={shimmer} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
