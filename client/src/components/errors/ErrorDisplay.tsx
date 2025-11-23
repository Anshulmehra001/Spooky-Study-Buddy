import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ghost } from '../characters/Ghost';
import { Witch } from '../characters/Witch';
import { Vampire } from '../characters/Vampire';
import { Skeleton } from '../characters/Skeleton';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { createSpookyError, getCharacterMessage, playErrorSound } from '../../utils/errorHandling';

interface ErrorDisplayProps {
  error: string | Error | null;
  context?: 'upload' | 'story' | 'quiz' | 'progress' | 'network';
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  context = 'network',
  onRetry,
  onDismiss,
  className = ''
}) => {
  const spookyError = error ? createSpookyError(error, context) : null;

  useEffect(() => {
    if (error) {
      playErrorSound();
    }
  }, [error]);

  if (!error || !spookyError) return null;

  const CharacterComponent = {
    ghost: Ghost,
    witch: Witch,
    vampire: Vampire,
    skeleton: Skeleton
  }[spookyError.character];

  const characterMessage = getCharacterMessage(spookyError.character, context);

  const severityColors = {
    low: 'border-yellow-500 bg-yellow-900',
    medium: 'border-orange-500 bg-orange-900',
    high: 'border-red-500 bg-red-900'
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={className}
      >
        <Card className={`border-opacity-50 bg-opacity-30 ${severityColors[spookyError.severity]} ${className}`}>
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Character with animation */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, -2, 2, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <CharacterComponent 
                message={characterMessage}
                size="lg"
              />
            </motion.div>

            {/* Error message */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-spooky-orange">
                {spookyError.message}
              </h3>
              <p className="text-spooky-cream opacity-90">
                {spookyError.suggestion}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {onRetry && spookyError.action && (
                <Button
                  onClick={onRetry}
                  variant="primary"
                  className="w-full sm:w-auto"
                >
                  🎃 {spookyError.action}
                </Button>
              )}
              
              {onDismiss && (
                <Button
                  onClick={onDismiss}
                  variant="ghost"
                  className="w-full sm:w-auto"
                >
                  👻 Dismiss
                </Button>
              )}
            </div>

            {/* Additional help for high severity errors */}
            {spookyError.severity === 'high' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-spooky-cream opacity-70 border-t border-spooky-orange border-opacity-30 pt-4 mt-4"
              >
                <p className="mb-2">Still having trouble? Try these spooky solutions:</p>
                <ul className="list-disc list-inside space-y-1 text-left">
                  <li>Refresh your browser (Ctrl+F5 or Cmd+R)</li>
                  <li>Clear your browser cache and cookies</li>
                  <li>Try a different browser or device</li>
                  <li>Check your internet connection</li>
                </ul>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

// Quick error toast component for minor errors
export const ErrorToast: React.FC<{
  message: string;
  onDismiss: () => void;
  duration?: number;
}> = ({ message, onDismiss, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed top-4 right-4 z-50 max-w-sm"
    >
      <div className="bg-red-900 bg-opacity-90 border border-red-500 rounded-lg p-4 text-red-200 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">⚠️</span>
            <span className="text-sm">{message}</span>
          </div>
          <button
            onClick={onDismiss}
            className="text-red-300 hover:text-red-100 ml-2"
          >
            ✕
          </button>
        </div>
      </div>
    </motion.div>
  );
};