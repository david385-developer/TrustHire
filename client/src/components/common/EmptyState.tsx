import React, { ReactNode } from 'react';

import { Search } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  heading?: string;
  title?: string;
  description: string;
  action?: ReactNode;
  compact?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <Search className="w-12 h-12" />,
  heading,
  title,
  description,
  action,
  compact = false
}) => {
  const displayHeading = title || heading || "No results found";
  
  return (
    <div className={`flex flex-col items-center justify-center ${compact ? 'py-8' : 'py-16'} px-4 text-center`}>
      <div className="text-[var(--text-muted)] mb-4">
        {icon}
      </div>
      <h3 className={`${compact ? 'text-lg' : 'text-xl'} font-semibold heading-font text-[var(--text-primary)] mb-2`}>
        {displayHeading}
      </h3>
      <p className={`text-[var(--text-secondary)] max-w-md ${compact ? 'text-sm mb-4' : 'mb-6'}`}>
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
