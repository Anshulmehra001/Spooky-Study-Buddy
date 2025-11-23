import React, { useState, useEffect } from 'react';
import { Card, Button } from '../index';
import { LevelInfo } from '../../services/gamificationService';
import { Badge } from '../../../../shared/src/types';

interface LevelUpNotificationProps {
  isVisible: boolean;
  levelInfo: LevelInfo;
  newBadges: Badge[];
  onClose: () => void;
}

export const LevelUpNotification: React.FC<LevelUpNotificationProps> = ({
  isVisible,
  levelInfo,
  newBadges,
  onClose
}) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowAnimation(true);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <Card className={`max-w-md w-full text-center transform transition-all duration-500 ${
        showAnimation ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
      }`}>
        {/* Celebration Animation */}
        <div className="relative mb-6">
          <div className="text-8xl mb-4 animate-bounce">
            {levelInfo.icon}
          </div>
          
          {/* Sparkle effects */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute text-2xl animate-ping"
                style={{
                  left: `${20 + (i * 15)}%`,
                  top: `${10 + (i % 2) * 20}%`,
                  animationDelay: `${i * 0.2}s`
                }}
              >
                ✨
              </div>
            ))}
          </div>
        </div>

        {/* Level Up Message */}
        <h2 className="text-3xl font-creepster text-spooky-orange mb-2">
          Level Up!
        </h2>
        
        <div className="text-6xl font-bold text-spooky-purple mb-2">
          {levelInfo.level}
        </div>
        
        <h3 className="text-xl font-bold text-spooky-cream mb-4">
          {levelInfo.title}
        </h3>
        
        <p className="text-spooky-cream opacity-80 mb-6">
          {levelInfo.description}
        </p>

        {/* New Badges */}
        {newBadges.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-bold text-spooky-orange mb-3">
              🏆 New Badges Earned!
            </h4>
            <div className="flex flex-wrap justify-center gap-3">
              {newBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex flex-col items-center p-2 rounded-lg bg-spooky-purple bg-opacity-20 border border-spooky-purple border-opacity-30"
                >
                  <div className="text-2xl mb-1">{badge.icon}</div>
                  <div className="text-xs font-bold text-spooky-cream">
                    {badge.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Motivational Message */}
        <div className="mb-6 p-4 bg-spooky-navy bg-opacity-50 rounded-lg">
          <p className="text-spooky-cream italic">
            "Your magical studies grow stronger with each spell cast! Keep up the enchanting work!"
          </p>
          <div className="text-right text-sm text-spooky-orange mt-2">
            - The Halloween Spirits 👻
          </div>
        </div>

        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="primary"
          className="w-full"
        >
          Continue Your Journey! 🎃
        </Button>
      </Card>
    </div>
  );
};