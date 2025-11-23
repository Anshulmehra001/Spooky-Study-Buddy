import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'cauldron' | 'pumpkin' | 'ghost';
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  variant = 'cauldron',
  message = 'Brewing something spooky...' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const CauldronSpinner = () => (
    <div className="relative">
      <div className={`${sizeClasses[size]} mx-auto mb-4`}>
        <div className="relative">
          {/* Cauldron base */}
          <div className="w-full h-full bg-gray-800 rounded-full border-2 border-spooky-orange"></div>
          
          {/* Bubbling animation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-spooky-green rounded-full animate-ping"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1 h-1 bg-spooky-orange rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-spooky-purple rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>
      {message && (
        <p className="text-spooky-cream text-center text-sm opacity-80">{message}</p>
      )}
    </div>
  );

  const PumpkinSpinner = () => (
    <div className="relative">
      <div className={`${sizeClasses[size]} mx-auto mb-4 animate-spin`}>
        <div className="text-spooky-orange text-4xl">🎃</div>
      </div>
      {message && (
        <p className="text-spooky-cream text-center text-sm opacity-80">{message}</p>
      )}
    </div>
  );

  const GhostSpinner = () => (
    <div className="relative">
      <div className={`${sizeClasses[size]} mx-auto mb-4 animate-float`}>
        <div className="text-white text-4xl">👻</div>
      </div>
      {message && (
        <p className="text-spooky-cream text-center text-sm opacity-80">{message}</p>
      )}
    </div>
  );

  const spinners = {
    cauldron: <CauldronSpinner />,
    pumpkin: <PumpkinSpinner />,
    ghost: <GhostSpinner />
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {spinners[variant]}
    </div>
  );
};