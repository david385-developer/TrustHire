import React, { ReactNode } from 'react';

interface CardProps {
  children?: ReactNode;
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = false, style, onClick }) => {
  return (
    <div
      className={`bg-[var(--surface)] p-6 transition-all duration-200 ${
        hover ? 'hover:-translate-y-1 hover:shadow-lg' : 'shadow-sm'
      } ${className}`}
      style={{ 
        borderRadius: 'var(--dashboard-card-radius, 16px)',
        boxShadow: 'var(--dashboard-card-shadow, 0 8px 20px rgba(31, 63, 43, 0.08))',
        border: 'var(--dashboard-border, 1px solid rgba(203, 213, 216, 0.4))',
        ...style 
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
