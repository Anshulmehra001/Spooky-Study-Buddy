import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glow' | 'transparent';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  variant = 'default' 
}) => {
  const baseClasses = 'rounded-lg p-6 transition-all duration-300';
  
  const variantClasses = {
    default: 'bg-gray-800 bg-opacity-80 backdrop-blur-sm border border-spooky-orange border-opacity-30',
    glow: 'bg-gray-800 bg-opacity-80 backdrop-blur-sm border border-spooky-orange border-opacity-50 shadow-lg hover:shadow-spooky-orange/20',
    transparent: 'bg-transparent border border-spooky-orange border-opacity-20'
  };
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};