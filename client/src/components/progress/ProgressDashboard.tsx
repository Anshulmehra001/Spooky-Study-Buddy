import React, { useState, useEffect } from 'react';
import { Card, LoadingSpinner, Ghost, Witch, Vampire, Skeleton, StreakCounter, LevelUpNotification, BadgeNotification } from '../index';
import { progressApi, handleApiError } from '../../services/api';
import { gamificationService, LevelInfo } from '../../services/gamificationService';
import { UserProgress, Badge } from '../../../../shared/src/types';

interface ProgressDashboardProps {
  userId?: string;
}

interface HalloweenMetrics {
  pumpkinsCollected: number;
  ghostsBefriended: number;
  spellsCast: number;
  candyEarned: number;
}

interface LearningStats {
  averageScore: number;
  totalTimeSpent: number;
  improvementTrend: number;
  favoriteTopics: string[];
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ userId = 'default' }) => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [halloweenMetrics, setHalloweenMetrics] = useState<HalloweenMetrics | null>(null);
  const [learningStats, setLearningStats] = useState<LearningStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showBadgeNotification, setShowBadgeNotification] = useState(false);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);

  useEffect(() => {
    loadProgressData();
  }, [userId]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await progressApi.getUserProgress(userId);
      
      if (response.success) {
        setProgress(response.progress);
        setHalloweenMetrics(response.halloweenMetrics);
        setLearningStats(response.learningStats);
        setSelectedCharacter(response.progress.favoriteCharacter || '');
        
        // Calculate level info
        const levelData = gamificationService.getLevelInfo(response.progress);
        setLevelInfo(levelData);
      } else {
        throw new Error('Failed to load progress data');
      }
    } catch (err) {
      console.error('Error loading progress:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCharacterSelection = async (character: string) => {
    try {
      setSelectedCharacter(character);
      await progressApi.updateFavoriteCharacter(character, userId);
      
      // Reload progress to get updated data
      await loadProgressData();
    } catch (err) {
      console.error('Error updating favorite character:', err);
      setError(handleApiError(err));
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getBadgeRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-400 border-yellow-400';
      case 'rare': return 'text-purple-400 border-purple-400';
      case 'common': return 'text-green-400 border-green-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getStreakEmoji = (streak: number): string => {
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '⚡';
    if (streak >= 1) return '✨';
    return '💤';
  };

  if (loading) {
    return (
      <Card className="max-w-6xl mx-auto text-center">
        <LoadingSpinner size="lg" />
        <h3 className="text-xl font-bold text-spooky-orange mt-4">
          📊 Summoning Your Progress Data...
        </h3>
        <div className="flex justify-center space-x-4 mt-4">
          <Ghost message="Gathering your achievements!" />
          <Witch message="Calculating your spells!" />
        </div>
      </Card>
    );
  }

  if (error || !progress || !halloweenMetrics || !learningStats) {
    return (
      <Card className="max-w-6xl mx-auto text-center border-red-500 border-opacity-50">
        <div className="text-6xl mb-4">😱</div>
        <h3 className="text-xl font-bold text-red-400 mb-2">
          Progress Data Vanished!
        </h3>
        <p className="text-spooky-cream opacity-80 mb-4">
          {error || 'Unable to load your progress from the spirit realm!'}
        </p>
        <button
          onClick={loadProgressData}
          className="text-spooky-orange hover:text-spooky-cream transition-colors"
        >
          🔄 Try Again
        </button>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header with Level and XP */}
      <Card className="text-center">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-4xl font-creepster text-spooky-orange mb-2">
              📊 Your Spooky Progress
            </h2>
            <p className="text-lg text-spooky-cream opacity-80">
              Level {progress.level} Sorcerer • {progress.experiencePoints} XP
            </p>
          </div>
          <div className="text-center">
            <div className="text-6xl mb-2">🔮</div>
            <div className="text-sm text-spooky-cream opacity-60">
              Next Level: {Math.pow(progress.level, 2) * 100} XP
            </div>
          </div>
        </div>
        
        {/* XP Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-spooky-cream opacity-80 mb-2">
            <span>Level {progress.level}</span>
            <span>Level {progress.level + 1}</span>
          </div>
          <div className="w-full bg-spooky-navy rounded-full h-4 border border-spooky-purple border-opacity-30">
            <div 
              className="bg-gradient-to-r from-spooky-orange to-spooky-purple h-full rounded-full transition-all duration-500 relative"
              style={{ 
                width: `${levelInfo ? gamificationService.getLevelProgress(progress) : 0}%` 
              }}
            >
              <div className="absolute right-0 top-0 h-full w-2 bg-white bg-opacity-30 rounded-r-full" />
            </div>
          </div>
          <div className="text-center text-xs text-spooky-cream opacity-60 mt-1">
            {levelInfo && `${progress.experiencePoints - levelInfo.requiredXP} / ${levelInfo.nextLevelXP - levelInfo.requiredXP} XP`}
          </div>
        </div>
      </Card>

      {/* Halloween Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="glow" className="text-center">
          <div className="text-4xl mb-2">🎃</div>
          <div className="text-3xl font-bold text-spooky-orange">{halloweenMetrics.pumpkinsCollected}</div>
          <div className="text-sm opacity-80">Stories Read</div>
        </Card>
        
        <Card variant="glow" className="text-center">
          <div className="text-4xl mb-2">👻</div>
          <div className="text-3xl font-bold text-spooky-orange">{halloweenMetrics.ghostsBefriended}</div>
          <div className="text-sm opacity-80">Ghosts Befriended</div>
          <div className="text-xs opacity-60 mt-1">(80%+ Quiz Scores)</div>
        </Card>
        
        <Card variant="glow" className="text-center">
          <div className="text-4xl mb-2">🧙‍♀️</div>
          <div className="text-3xl font-bold text-spooky-orange">{halloweenMetrics.spellsCast}</div>
          <div className="text-sm opacity-80">Spells Cast</div>
          <div className="text-xs opacity-60 mt-1">(Quizzes Taken)</div>
        </Card>
        
        <Card variant="glow" className="text-center">
          <div className="text-4xl mb-2">🍬</div>
          <div className="text-3xl font-bold text-spooky-orange">{halloweenMetrics.candyEarned}</div>
          <div className="text-sm opacity-80">Candy Earned</div>
          <div className="text-xs opacity-60 mt-1">(XP ÷ 10)</div>
        </Card>
      </div>

      {/* Streak Counter */}
      <StreakCounter 
        currentStreak={progress.currentStreak}
        longestStreak={progress.longestStreak}
      />

      {/* Learning Statistics */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-2xl font-bold text-spooky-orange mb-4">📈 Learning Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-spooky-cream opacity-80">Average Score:</span>
              <span className="text-xl font-bold text-spooky-orange">
                {learningStats.averageScore.toFixed(1)}%
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-spooky-cream opacity-80">Time Spent:</span>
              <span className="text-xl font-bold text-spooky-orange">
                {formatTime(learningStats.totalTimeSpent)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-spooky-cream opacity-80">Improvement:</span>
              <span className={`text-xl font-bold ${learningStats.improvementTrend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {learningStats.improvementTrend >= 0 ? '+' : ''}{learningStats.improvementTrend.toFixed(1)}%
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-spooky-cream opacity-80 flex items-center">
                Current Streak: {getStreakEmoji(progress.currentStreak)}
              </span>
              <span className="text-xl font-bold text-spooky-orange">
                {progress.currentStreak} days
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-spooky-cream opacity-80">Best Streak:</span>
              <span className="text-xl font-bold text-spooky-orange">
                {progress.longestStreak} days
              </span>
            </div>
          </div>
        </Card>

        {/* Favorite Topics */}
        <Card>
          <h3 className="text-2xl font-bold text-spooky-orange mb-4">📚 Favorite Topics</h3>
          {learningStats.favoriteTopics.length > 0 ? (
            <div className="space-y-3">
              {learningStats.favoriteTopics.map((topic, index) => (
                <div key={topic} className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </div>
                  <span className="text-spooky-cream">{topic}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📖</div>
              <p className="text-spooky-cream opacity-60">
                Read more stories to discover your favorite topics!
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Character Selection */}
      <Card>
        <h3 className="text-2xl font-bold text-spooky-orange mb-4">👻 Choose Your Spooky Companion</h3>
        <p className="text-spooky-cream opacity-80 mb-6">
          Select your favorite Halloween character to personalize your experience!
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { type: 'ghost', component: Ghost, name: 'Friendly Ghost' },
            { type: 'vampire', component: Vampire, name: 'Wise Vampire' },
            { type: 'witch', component: Witch, name: 'Clever Witch' },
            { type: 'skeleton', component: Skeleton, name: 'Scholarly Skeleton' },
            { type: 'pumpkin', component: () => <div className="text-6xl">🎃</div>, name: 'Magic Pumpkin' }
          ].map(({ type, component: Component, name }) => (
            <button
              key={type}
              onClick={() => handleCharacterSelection(type)}
              className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                selectedCharacter === type
                  ? 'border-spooky-orange bg-spooky-orange bg-opacity-20'
                  : 'border-spooky-purple border-opacity-30 hover:border-spooky-orange hover:border-opacity-50'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <Component />
                <span className="text-sm text-spooky-cream">{name}</span>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Badge Collection */}
      <Card>
        <h3 className="text-2xl font-bold text-spooky-orange mb-4">🏆 Badge Collection</h3>
        {progress.badges.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {progress.badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-lg border-2 ${getBadgeRarityColor(badge.rarity)} bg-opacity-10 text-center`}
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <h4 className="font-bold text-sm mb-1">{badge.name}</h4>
                <p className="text-xs opacity-80 mb-2">{badge.description}</p>
                <div className="text-xs opacity-60">
                  {new Date(badge.unlockedAt).toLocaleDateString()}
                </div>
                <div className={`text-xs font-bold mt-1 ${getBadgeRarityColor(badge.rarity)}`}>
                  {badge.rarity.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎭</div>
            <p className="text-spooky-cream opacity-60 mb-4">
              Complete stories and quizzes to earn spooky badges!
            </p>
            <div className="flex justify-center space-x-4">
              <Ghost message="Start your journey!" />
              <Witch message="Badges await!" />
            </div>
          </div>
        )}
      </Card>

      {/* Level Up Notification */}
      {levelInfo && (
        <LevelUpNotification
          isVisible={showLevelUp}
          levelInfo={levelInfo}
          newBadges={progress.badges.slice(-2)} // Show last 2 badges as "new"
          onClose={() => setShowLevelUp(false)}
        />
      )}

      {/* Badge Notification */}
      <BadgeNotification
        badge={newBadge}
        isVisible={showBadgeNotification}
        onClose={() => {
          setShowBadgeNotification(false);
          setNewBadge(null);
        }}
      />
    </div>
  );
};