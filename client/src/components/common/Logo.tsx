import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
}

const Logo: React.FC<LogoProps> = ({ className = '', variant = 'dark' }) => {
  const iconColor = variant === 'dark' ? '#1B4D3E' : '#FFFFFF';
  const trustColor = variant === 'dark' ? '#1A1A1A' : '#FFFFFF';
  const hireColor = variant === 'dark' ? '#1A1A1A' : '#D1D5DB';

  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      {/* SVG Shield Icon with Checkmark */}
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M16 2L4 8v8c0 7.2 5.1 13.9 12 16 6.9-2.1 12-8.8 12-16V8L16 2z" 
          stroke={iconColor} 
          strokeWidth="2" 
          fill="none"
        />
        <path 
          d="M12 16l3 3 5-6" 
          stroke={iconColor} 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>

      {/* Text */}
      <span className="text-xl" style={{ fontFamily: "'DM Serif Display', serif" }}>
        <span style={{ color: trustColor, fontWeight: 700 }}>Trust</span>
        <span style={{ color: hireColor, fontWeight: 400 }}>Hire</span>
      </span>
    </Link>
  );
};

export default Logo;
