import { useState } from 'react';

const COLORS = [
  'bg-primary-200 text-primary-700',
  'bg-accent-200 text-accent-700',
  'bg-warm-200 text-warm-700',
  'bg-purple-200 text-purple-700',
  'bg-pink-200 text-pink-700',
  'bg-cyan-200 text-cyan-700',
  'bg-orange-200 text-orange-700',
  'bg-teal-200 text-teal-700',
];

function hashName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

export default function Avatar({ src, name = '', size = 'md', className = '' }) {
  const [imgError, setImgError] = useState(false);
  const colorClass = COLORS[hashName(name) % COLORS.length];
  const sizeClass = sizeMap[size] || sizeMap.md;

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        onError={() => setImgError(true)}
        className={`${sizeClass} rounded-full object-cover ring-2 ring-white ${className}`}
      />
    );
  }

  return (
    <div className={`${sizeClass} ${colorClass} rounded-full flex items-center justify-center font-semibold ring-2 ring-white shrink-0 ${className}`}>
      {getInitials(name)}
    </div>
  );
}
