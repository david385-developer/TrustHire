import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  showCount?: boolean;
  maxCount?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, showCount, maxCount, className = '', value, ...props }, ref) => {
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <label className="block text-sm font-medium text-[var(--text-primary)]">
              {label}
            </label>
          )}
          {showCount && maxCount && (
            <span className="text-xs text-[var(--text-muted)]">
              {currentLength}/{maxCount}
            </span>
          )}
        </div>
        <textarea
          ref={ref}
          value={value}
          className={`w-full px-4 py-2.5 bg-white border ${
            error ? 'border-red-500' : 'border-[var(--border, #e2e8f0)]'
          } text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--dashboard-accent)] focus:border-transparent transition-all duration-200 resize-vertical ${className}`}
          style={{ borderRadius: 'var(--dashboard-input-radius, 6px)' }}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
