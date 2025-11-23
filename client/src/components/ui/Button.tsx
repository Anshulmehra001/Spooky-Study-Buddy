import React from 'react';
import { keyboardNav } from '../../utils/accessibility';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  loading?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '', 
  loading = false,
  ariaLabel,
  ariaDescribedBy,
  onClick,
  onKeyDown,
  disabled,
  ...props 
}) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-spooky-navy disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';
  
  const variantClasses = {
    primary: 'bg-spooky-orange hover:bg-spooky-light-orange text-white focus:ring-spooky-orange',
    secondary: 'bg-spooky-purple hover:bg-spooky-dark-purple text-white focus:ring-spooky-purple',
    ghost: 'bg-transparent border-2 border-spooky-orange text-spooky-orange hover:bg-spooky-orange hover:text-white focus:ring-spooky-orange'
  };
  
  const sizeClasses = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-4 px-8 text-lg'
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) return;
    
    // Play click sound if available
    if ((window as any).spookySounds?.click) {
      (window as any).spookySounds.click();
    }
    
    onClick?.(event);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (loading || disabled) return;
    
    // Handle space key activation
    keyboardNav.handleActivation(event as any, () => {
      if (onClick) {
        onClick(event as any);
      }
    });
    
    onKeyDown?.(event);
  };

  const isDisabled = disabled || loading;
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="sr-only">Loading...</span>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
};