import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingElementProps {
  emoji: string;
  delay?: number;
  duration?: number;
  size?: 'sm' | 'md' | 'lg';
}

const FloatingElement: React.FC<FloatingElementProps> = ({ 
  emoji, 
  delay = 0, 
  duration = 8,
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  return (
    <motion.div
      className={`absolute pointer-events-none select-none ${sizeClasses[size]} opacity-30`}
      initial={{ 
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + 50,
        rotate: 0,
        scale: 0
      }}
      animate={{ 
        y: -100,
        rotate: 360,
        scale: [0, 1, 1, 0],
        x: Math.random() * window.innerWidth
      }}
      transition={{
        duration,
        delay,
        ease: 'linear',
        repeat: Infinity,
        repeatDelay: Math.random() * 5
      }}
    >
      {emoji}
    </motion.div>
  );
};

export const HalloweenParticles: React.FC = () => {
  const [particles] = useState(() => {
    const emojis = ['👻', '🎃', '🦇', '🕷️', '💀', '🧙‍♀️', '🕸️', '🌙'];
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      delay: Math.random() * 10,
      duration: 6 + Math.random() * 4,
      size: ['sm', 'md', 'lg'][Math.floor(Math.random() * 3)] as 'sm' | 'md' | 'lg'
    }));
  });

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map(particle => (
        <FloatingElement
          key={particle.id}
          emoji={particle.emoji}
          delay={particle.delay}
          duration={particle.duration}
          size={particle.size}
        />
      ))}
    </div>
  );
};

export const SpookyGlow: React.FC<{ children: React.ReactNode; color?: string }> = ({ 
  children, 
  color = 'orange' 
}) => {
  return (
    <motion.div
      className="relative"
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <motion.div
        className={`absolute inset-0 rounded-lg blur-lg opacity-0 bg-spooky-${color}`}
        whileHover={{ opacity: 0.3 }}
        transition={{ duration: 0.3 }}
      />
      {children}
    </motion.div>
  );
};

export const PulsingElement: React.FC<{ children: React.ReactNode; intensity?: number }> = ({ 
  children, 
  intensity = 1.1 
}) => {
  return (
    <motion.div
      animate={{ 
        scale: [1, intensity, 1],
        opacity: [0.8, 1, 0.8]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  );
};

export const ShakeOnHover: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      whileHover={{
        x: [0, -2, 2, -2, 2, 0],
        transition: { duration: 0.3 }
      }}
    >
      {children}
    </motion.div>
  );
};

export const SpookyTypewriter: React.FC<{ 
  text: string; 
  speed?: number; 
  onComplete?: () => void;
  className?: string;
}> = ({ text, speed = 50, onComplete, className = '' }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <span className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="inline-block w-0.5 h-6 bg-spooky-orange ml-1"
      />
    </span>
  );
};