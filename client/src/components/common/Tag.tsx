import React from 'react';
import { X } from 'lucide-react';

interface TagProps {
  label: string;
  onRemove?: () => void;
  variant?: 'default' | 'primary';
  className?: string;
}

const Tag: React.FC<TagProps> = ({ label, onRemove, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700 border-gray-200',
    primary: 'bg-[var(--dashboard-accent)] bg-opacity-10 text-[var(--dashboard-accent)] border-[var(--dashboard-accent)] border-opacity-20'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 border text-sm font-medium ${variants[variant]} ${className}`}
      style={{ borderRadius: 'var(--dashboard-badge-radius, 9999px)' }}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};

export default Tag;
