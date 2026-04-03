import React, { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: ReactNode;
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon, trend }) => {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--dashboard-card-radius)] p-5 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-[var(--primary)] mt-1">{value}</p>
        </div>
        {icon && <div className="text-[var(--accent)]">{icon}</div>}
      </div>
      {description && <p className="text-sm text-[var(--text-secondary)]">{description}</p>}
      {trend && <p className="mt-3 text-xs text-[var(--success)] font-medium">{trend}</p>}
    </div>
  );
};

export default StatCard;
