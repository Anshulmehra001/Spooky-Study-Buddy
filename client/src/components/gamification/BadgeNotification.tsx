import React, { useState, useEffect } from 'react';
import { Badge } from '../../../../shared/src/types';

interface BadgeNotificationProps {
  badge: Badge | null;
  isVisible: boolean;
  onClose: () => void;
}

export const BadgeNotification: React.FC<BadgeNotificationProps> = ({
  badge,
  isVisible,
  onClose
}) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isVisible && badge) {
      setShowAnimation(true);
      
      // Auto-close after 4 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, badge, onClose]);

  const getBadgeRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-400 bg-yellow-400 bg-opacity-10 text-yellow-400';
      case 'rare': return 'border-purple-400 bg-purple-400 bg-opacity-10 text-purple-400';
      case 'common': return 'border-green-400 bg-green-400 bg-opacity-10 text-green-400';
      default: return 'border-gray-400 bg-gray-400 bg-opacity-10 text-gray-400';
    }
  };

  const getRarityGlow = (rarity: string): string => {
    switch (rarity) {
      case 'legendary': return 'shadow-lg shadow-yellow-400/50';
      case 'rare': return 'shadow-lg shadow-purple-400/50';
      case 'common': return 'shadow-lg shadow-green-400/50';
      default: return 'shadow-lg shadow-gray-400/50';
    }
  };

  if (!isVisible || !badge) return null;

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <div className={`transform transition-all duration-500 ${
        showAnimation ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <div className={`
          max-w-sm p-4 rounded-lg border-2 backdrop-blur-sm
          ${getBadgeRarityColor(badge.rarity)}
          ${getRarityGlow(badge.rarity)}
          pointer-events-auto
        `}>
          <div className="flex items-center space-x-3">
            {/* Badge Icon with Animation */}
            <div className="relative">
              <div className="text-4xl animate-bounce">
                {badge.icon}
              </div>
              
              {/* Sparkle effect for legendary badges */}
              {badge.rarity === 'legendary' && (
                <div className="absolute -top-1 -right-1 text-sm animate-ping">
                  ✨
                </div>
              )}
            </div>

            {/* Badge Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-bold text-sm">
                  🏆 Badge Earned!
                </h4>
                <span className={`text-xs px-2 py-1 rounded-full border ${getBadgeRarityColor(badge.rarity)}`}>
                  {badge.rarity.toUpperCase()}
                </span>
              </div>
              
              <h5 className="font-bold text-spooky-cream mb-1">
                {badge.name}
              </h5>
              
              <p className="text-xs text-spooky-cream opacity-80">
                {badge.description}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-spooky-cream opacity-60 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>

          {/* Progress Bar Animation */}
          <div className="mt-3 w-full bg-spooky-navy rounded-full h-1">
            <div 
              className={`h-full rounded-full transition-all duration-4000 ease-out ${
                badge.rarity === 'legendary' ? 'bg-yellow-400' :
                badge.rarity === 'rare' ? 'bg-purple-400' : 'bg-green-400'
              }`}
              style={{ 
                width: showAnimation ? '100%' : '0%',
                transitionDuration: '4000ms'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};