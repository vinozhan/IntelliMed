export default function PageTransition({ children, variant = 'fade' }) {
  const className = variant === 'slide-up' ? 'animate-slide-up' : 'animate-fade-in';
  return <div className={className}>{children}</div>;
}
