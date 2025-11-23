import React from 'react';

interface WitchProps {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
  message?: string;
}

export const Witch: React.FC<WitchProps> = ({ 
  size = 'md', 
  animated = true, 
  className = '',
  message 
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12 text-2xl',
    md: 'w-16 h-16 text-4xl',
    lg: 'w-24 h-24 text-6xl'
  };

  const animationClass = animated ? 'animate-bounce' : '';

  return (
    <div className={`relative ${className}`}>
      <div className={`${sizeClasses[size]} ${animationClass} flex items-center justify-center bg-spooky-green bg-opacity-90 rounded-full shadow-lg hover:shadow-spooky-green/30 transition-all duration-300`}>
        <span className="text-white">🧙‍♀️</span>
      </div>
      {message && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-800 text-spooky-cream text-sm px-3 py-2 rounded-lg border border-spooky-green border-opacity-30 whitespace-nowrap">
          {message}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-800"></div>
        </div>
      )}
    </div>
  );
};