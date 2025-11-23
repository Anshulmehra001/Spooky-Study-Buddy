import React from 'react';
import { motion } from 'framer-motion';
import { QuizResult } from '../../../../shared/src/types';
import { Button, Card, Ghost, Vampire, Witch, Skeleton } from '../index';

interface QuizResultsProps {
  result: QuizResult;
  celebrationMessage?: string;
  retrySuggestions?: string[];
  onRetry?: () => void;
  onBackToStory?: () => void;
  onViewProgress?: () => void;
}

const ScoreCircle: React.FC<{ score: number; size?: 'sm' | 'md' | 'lg' }> = ({ 
  score, 
  size = 'lg' 
}) => {
  const radius = size === 'lg' ? 60 : size === 'md' ? 45 : 30;
  const strokeWidth = size === 'lg' ? 8 : size === 'md' ? 6 : 4;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10B981'; // Green
    if (score >= 80) return '#F59E0B'; // Yellow
    if (score >= 70) return '#F97316'; // Orange
    return '#EF4444'; // Red
  };

  return (
    <div className="relative">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          stroke="#374151"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress circle */}
        <motion.circle
          stroke={getScoreColor(score)}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            className={`font-bold ${
              size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-2xl' : 'text-xl'
            } text-spooky-cream`}
          >
            {score}%
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const BadgeDisplay: React.FC<{ badges: string[] }> = ({ badges }) => {
  if (!badges || badges.length === 0) return null;

  const badgeEmojis: Record<string, string> = {
    'Perfect Score Phantom': '👻',
    'Spooky Scholar': '🎓',
    'Ghostly Graduate': '🎃',
    'Lightning Learner': '⚡',
    'Quiz Conqueror': '🏆',
    'First Quiz Completed': '🌟'
  };

  return (
    <div className="space-y-3">
      <h4 className="text-lg font-bold text-spooky-orange text-center">
        🏆 Badges Earned
      </h4>
      <div className="flex flex-wrap justify-center gap-2">
        {badges.map((badge, index) => (
          <motion.div
            key={badge}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              delay: 1 + index * 0.2, 
              type: "spring", 
              stiffness: 200 
            }}
            className="bg-spooky-purple bg-opacity-30 border border-spooky-purple border-opacity-50 rounded-full px-3 py-1 flex items-center space-x-2"
          >
            <span className="text-lg">
              {badgeEmojis[badge] || '🎖️'}
            </span>
            <span className="text-sm font-medium text-spooky-cream">
              {badge}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const CelebrationCharacters: React.FC<{ score: number }> = ({ score }) => {
  const getCharacters = () => {
    if (score >= 90) {
      return [
        { component: <Ghost message="Boo-tiful work!" />, delay: 0 },
        { component: <Witch message="Magical performance!" />, delay: 0.2 },
        { component: <Vampire message="Excellent!" />, delay: 0.4 },
        { component: <Skeleton message="Bone-afide genius!" />, delay: 0.6 }
      ];
    } else if (score >= 80) {
      return [
        { component: <Ghost message="Great job!" />, delay: 0 },
        { component: <Witch message="Well done!" />, delay: 0.3 },
        { component: <Vampire message="Impressive!" />, delay: 0.6 }
      ];
    } else if (score >= 70) {
      return [
        { component: <Ghost message="Good effort!" />, delay: 0 },
        { component: <Witch message="Keep practicing!" />, delay: 0.4 }
      ];
    } else {
      return [
        { component: <Ghost message="Don't give up!" />, delay: 0 },
        { component: <Skeleton message="Try again!" />, delay: 0.3 }
      ];
    }
  };

  const characters = getCharacters();

  return (
    <div className="flex justify-center space-x-4">
      {characters.map((char, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            delay: 1.5 + char.delay, 
            type: "spring", 
            stiffness: 200 
          }}
        >
          {char.component}
        </motion.div>
      ))}
    </div>
  );
};

export const QuizResults: React.FC<QuizResultsProps> = ({
  result,
  celebrationMessage,
  retrySuggestions = [],
  onRetry,
  onBackToStory,
  onViewProgress
}) => {
  const percentage = result.score;
  const accuracy = Math.round((result.correctAnswers / result.totalQuestions) * 100);
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceMessage = (score: number): string => {
    if (score >= 90) return "Outstanding! You're a spooky study master! 🎉";
    if (score >= 80) return "Excellent work! The spirits are impressed! 👻";
    if (score >= 70) return "Good job! You're getting the hang of this! 🎃";
    if (score >= 60) return "Not bad! A little more practice will help! 🧙‍♀️";
    return "Keep trying! Every ghost was once a beginner! 💀";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Main Results Card */}
      <Card className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-creepster text-spooky-orange mb-6"
        >
          🎃 Quiz Complete! 🎃
        </motion.h2>

        {/* Score Display */}
        <div className="flex justify-center mb-6">
          <ScoreCircle score={percentage} />
        </div>

        {/* Performance Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mb-6"
        >
          <p className="text-xl text-spooky-cream mb-2">
            {getPerformanceMessage(percentage)}
          </p>
          <p className="text-lg text-spooky-cream opacity-80">
            {result.feedback}
          </p>
        </motion.div>

        {/* Celebration Characters */}
        <CelebrationCharacters score={percentage} />
      </Card>

      {/* Detailed Stats */}
      <Card>
        <h3 className="text-xl font-bold text-spooky-orange mb-4 text-center">
          📊 Detailed Results
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <div className="text-3xl font-bold text-spooky-orange">
              {result.correctAnswers}
            </div>
            <div className="text-sm text-spooky-cream opacity-80">
              Correct Answers
            </div>
            <div className="text-xs text-spooky-cream opacity-60">
              out of {result.totalQuestions}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            <div className="text-3xl font-bold text-spooky-orange">
              {accuracy}%
            </div>
            <div className="text-sm text-spooky-cream opacity-80">
              Accuracy
            </div>
            <div className="text-xs text-spooky-cream opacity-60">
              questions answered correctly
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-center"
          >
            <div className="text-3xl font-bold text-spooky-orange">
              {formatTime(result.timeSpent)}
            </div>
            <div className="text-sm text-spooky-cream opacity-80">
              Time Spent
            </div>
            <div className="text-xs text-spooky-cream opacity-60">
              total quiz time
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="text-center"
          >
            <div className="text-3xl font-bold text-spooky-orange">
              {Math.round(result.timeSpent / result.totalQuestions)}s
            </div>
            <div className="text-sm text-spooky-cream opacity-80">
              Avg per Question
            </div>
            <div className="text-xs text-spooky-cream opacity-60">
              average response time
            </div>
          </motion.div>
        </div>
      </Card>

      {/* Badges */}
      {result.badges && result.badges.length > 0 && (
        <Card>
          <BadgeDisplay badges={result.badges} />
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="primary"
              size="lg"
              className="flex items-center justify-center space-x-2"
            >
              <span>🔄</span>
              <span>Try Again</span>
            </Button>
          )}

          {onBackToStory && (
            <Button
              onClick={onBackToStory}
              variant="secondary"
              size="lg"
              className="flex items-center justify-center space-x-2"
            >
              <span>📖</span>
              <span>Back to Story</span>
            </Button>
          )}

          {onViewProgress && (
            <Button
              onClick={onViewProgress}
              variant="ghost"
              size="lg"
              className="flex items-center justify-center space-x-2"
            >
              <span>📊</span>
              <span>View Progress</span>
            </Button>
          )}
        </div>
      </Card>

      {/* Celebration Message */}
      {celebrationMessage && (
        <Card className="text-center bg-gradient-to-r from-spooky-orange to-spooky-purple bg-opacity-20 border-spooky-orange border-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2, type: "spring", stiffness: 200 }}
          >
            <h4 className="text-xl font-bold text-spooky-orange mb-3">
              🎉 Celebration Time! 🎉
            </h4>
            <p className="text-lg text-spooky-cream font-medium">
              {celebrationMessage}
            </p>
          </motion.div>
        </Card>
      )}

      {/* Retry Suggestions */}
      {retrySuggestions.length > 0 && (
        <Card className="bg-spooky-navy bg-opacity-30 border-spooky-green border-opacity-30">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5 }}
          >
            <h4 className="text-lg font-bold text-spooky-green mb-4 text-center">
              💡 Tips for Improvement
            </h4>
            <div className="space-y-2">
              {retrySuggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 2.7 + index * 0.1 }}
                  className="flex items-start space-x-3 p-2 rounded bg-spooky-green bg-opacity-10"
                >
                  <span className="text-spooky-green mt-1 flex-shrink-0">•</span>
                  <span className="text-spooky-cream opacity-90">{suggestion}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Card>
      )}

      {/* Encouragement Message */}
      <Card className="text-center bg-spooky-purple bg-opacity-20 border-spooky-purple border-opacity-30">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
        >
          <h4 className="text-lg font-bold text-spooky-orange mb-2">
            🌟 Keep Learning!
          </h4>
          <p className="text-spooky-cream opacity-90">
            {percentage >= 80 
              ? "You're doing amazing! Try another story to keep the learning momentum going!"
              : "Practice makes perfect! Review the story and try the quiz again to improve your score!"
            }
          </p>
        </motion.div>
      </Card>
    </div>
  );
};