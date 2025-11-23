import React from 'react';
import { Card } from '../index';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  className?: string;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({
  currentStreak,
  longestStreak,
  className = ''
}) => {
  const getStreakEmoji = (streak: number): string => {
    if (streak >= 30) return '💎';
    if (streak >= 14) return '🔥';
    if (streak >= 7) return '⚡';
    if (streak >= 3) return '✨';
    if (streak >= 1) return '🌟';
    return '💤';
  };

  const getStreakColor = (streak: number): string => {
    if (streak >= 30) return 'text-blue-400';
    if (streak >= 14) return 'text-red-400';
    if (streak >= 7) return 'text-yellow-400';
    if (streak >= 3) return 'text-purple-400';
    if (streak >= 1) return 'text-green-400';
    return 'text-gray-400';
  };

  const getStreakMessage = (streak: number): string => {
    if (streak >= 30) return 'Diamond Dedication!';
    if (streak >= 14) return 'On Fire!';
    if (streak >= 7) return 'Lightning Fast!';
    if (streak >= 3) return 'Sparkling Progress!';
    if (streak >= 1) return 'Getting Started!';
    return 'Ready to Begin?';
  };

  const getMotivationalMessage = (streak: number): string => {
    if (streak >= 30) return 'You\'re a legendary learner! The spirits bow to your dedication! 👑';
    if (streak >= 14) return 'Your learning fire burns bright! Keep the flame alive! 🔥';
    if (streak >= 7) return 'A full week of spooky studies! The magic is strong with you! ⚡';
    if (streak >= 3) return 'Three days of magical learning! You\'re building great habits! ✨';
    if (streak >= 1) return 'Great start! Come back tomorrow to keep the magic alive! 🌟';
    return 'Start your learning journey today and build a spooky streak! 👻';
  };

  return (
    <Card className={`text-center ${className}`}>
      <div className="mb-4">
        <div className="text-6xl mb-2 animate-pulse">
          {getStreakEmoji(currentStreak)}
        </div>
        <h3 className="text-2xl font-bold text-spooky-orange mb-1">
          Learning Streak
        </h3>
        <div className={`text-4xl font-bold mb-2 ${getStreakColor(currentStreak)}`}>
          {currentStreak}
        </div>
        <div className="text-sm text-spooky-cream opacity-80 mb-2">
          {getStreakMessage(currentStreak)}
        </div>
      </div>

      {/* Streak Visualization */}
      <div className="mb-4">
        <div className="flex justify-center space-x-1 mb-2">
          {[...Array(Math.min(7, Math.max(7, currentStreak)))].map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < currentStreak % 7 || (currentStreak >= 7 && i < 7)
                  ? 'bg-spooky-orange animate-pulse'
                  : 'bg-spooky-navy border border-spooky-purple border-opacity-30'
              }`}
            />
          ))}
        </div>
        <div className="text-xs text-spooky-cream opacity-60">
          {currentStreak >= 7 ? `Week ${Math.floor(currentStreak / 7) + 1}` : 'This Week'}
        </div>
      </div>

      {/* Motivational Message */}
      <div className="p-3 bg-spooky-navy bg-opacity-50 rounded-lg mb-4">
        <p className="text-sm text-spooky-cream italic">
          {getMotivationalMessage(currentStreak)}
        </p>
      </div>

      {/* Best Streak */}
      {longestStreak > 0 && (
        <div className="border-t border-spooky-purple border-opacity-30 pt-3">
          <div className="text-sm text-spooky-cream opacity-80 mb-1">
            Personal Best
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-2xl">🏆</span>
            <span className="text-xl font-bold text-spooky-orange">
              {longestStreak} days
            </span>
          </div>
        </div>
      )}

      {/* Streak Milestones */}
      <div className="mt-4 text-xs text-spooky-cream opacity-60">
        <div className="grid grid-cols-2 gap-2">
          <div className={currentStreak >= 3 ? 'text-green-400' : ''}>
            ✨ 3 days
          </div>
          <div className={currentStreak >= 7 ? 'text-yellow-400' : ''}>
            ⚡ 7 days
          </div>
          <div className={currentStreak >= 14 ? 'text-red-400' : ''}>
            🔥 14 days
          </div>
          <div className={currentStreak >= 30 ? 'text-blue-400' : ''}>
            💎 30 days
          </div>
        </div>
      </div>
    </Card>
  );
};