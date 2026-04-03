import React, { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'priority';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-[var(--bg)] text-[var(--text-primary)] border border-[var(--border)]',
    success: 'bg-[var(--success-bg)] text-[var(--success)] border border-[var(--success)]',
    warning: 'bg-[var(--warning-bg)] text-[var(--warning)] border border-[var(--warning)]',
    danger: 'bg-[var(--danger-bg)] text-[var(--danger)] border border-[var(--danger)]',
    info: 'bg-blue-50 text-blue-700 border border-blue-100',
    priority: 'bg-[var(--primary)] text-white shadow-sm'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium transition-all duration-200 ${variants[variant]} ${className}`}
      style={{ borderRadius: 'var(--dashboard-badge-radius, 9999px)' }}
    >
      {children}
    </span>
  );
};

export default Badge;
