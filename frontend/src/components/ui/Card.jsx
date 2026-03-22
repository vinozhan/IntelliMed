export default function Card({
  children,
  variant = 'default',
  className = '',
  padding = true,
  ...props
}) {
  const base = 'bg-white rounded-2xl border';
  const variantStyles = {
    default: 'border-slate-100 shadow-sm',
    interactive: 'border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
    bordered: 'border-slate-200',
  };

  return (
    <div
      className={`${base} ${variantStyles[variant]} ${padding ? 'p-6' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return <div className={`mt-4 pt-4 border-t border-slate-100 ${className}`}>{children}</div>;
}
