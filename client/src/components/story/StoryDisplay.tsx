import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpookyStory } from '../../../../shared/src/types';
import { Button, Card, Ghost, Vampire, Witch, Skeleton } from '../index';

interface StoryDisplayProps {
  story: SpookyStory;
  onStartQuiz?: () => void;
  onShare?: () => void;
  showTypewriter?: boolean;
}

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({ 
  text, 
  speed = 30, 
  onComplete 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <div className="relative">
      {displayedText}
      {currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block w-0.5 h-6 bg-spooky-orange ml-1"
        />
      )}
    </div>
  );
};

const CharacterAvatar: React.FC<{ characterName: string; message?: string }> = ({ 
  characterName, 
  message 
}) => {
  const getCharacterComponent = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('ghost') || lowerName.includes('ghostly')) {
      return <Ghost message={message} />;
    } else if (lowerName.includes('vampire') || lowerName.includes('count')) {
      return <Vampire message={message} />;
    } else if (lowerName.includes('witch') || lowerName.includes('mystique')) {
      return <Witch message={message} />;
    } else if (lowerName.includes('skeleton') || lowerName.includes('bones')) {
      return <Skeleton message={message} />;
    } else {
      return <Ghost message={message} />; // Default to ghost
    }
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="inline-block"
    >
      {getCharacterComponent(characterName)}
    </motion.div>
  );
};

export const StoryDisplay: React.FC<StoryDisplayProps> = ({
  story,
  onStartQuiz,
  onShare,
  showTypewriter = true
}) => {
  const [typewriterComplete, setTypewriterComplete] = useState(!showTypewriter);
  const [showActions, setShowActions] = useState(!showTypewriter);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const handleTypewriterComplete = () => {
    setTypewriterComplete(true);
    setTimeout(() => setShowActions(true), 500);
  };

  const handleCopyToClipboard = async () => {
    try {
      const shareUrl = `${window.location.origin}/story/${story.shareableLink || story.id}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleShare = (platform: string) => {
    const shareUrl = `${window.location.origin}/story/${story.shareableLink || story.id}`;
    const shareText = `Check out this spooky story: ${story.title}`;
    
    let url = '';
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'reddit':
        url = `https://reddit.com/submit?title=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      default:
        return;
    }
    
    window.open(url, '_blank', 'width=600,height=400');
    if (onShare) onShare();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Story Header */}
      <Card className="text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-creepster text-spooky-orange mb-4"
        >
          {story.title}
        </motion.h1>
        
        <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-spooky-cream opacity-80">
          <span>📚 {story.originalTopic}</span>
          {story.estimatedReadTime && (
            <span>⏱️ {story.estimatedReadTime} min read</span>
          )}
          {(story as any).generatedBy && (
            <span className="px-3 py-1 bg-spooky-purple bg-opacity-30 border border-spooky-purple border-opacity-50 rounded-full text-xs font-medium">
              ✨ Generated by: {(story as any).generatedBy}
            </span>
          )}
          <span>📅 {new Date(story.createdAt).toLocaleDateString()}</span>
        </div>
      </Card>

      {/* Characters Introduction */}
      <Card>
        <h3 className="text-xl font-bold text-spooky-orange mb-4 text-center">
          🎭 Meet Your Spooky Study Guides
        </h3>
        <div className="flex justify-center space-x-6">
          {story.characters.map((character, index) => (
            <motion.div
              key={character}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="text-center"
            >
              <CharacterAvatar characterName={character} />
              <p className="text-sm text-spooky-cream mt-2 font-medium">
                {character}
              </p>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Main Story Content */}
      <Card>
        <div className="prose prose-lg prose-invert max-w-none">
          <div className="text-lg leading-relaxed text-spooky-cream">
            {showTypewriter ? (
              <TypewriterText 
                text={story.content}
                speed={20}
                onComplete={handleTypewriterComplete}
              />
            ) : (
              <div>{story.content}</div>
            )}
          </div>
        </div>

        {/* Key Learning Points */}
        {typewriterComplete && story.keyLearningPoints && story.keyLearningPoints.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-4 bg-spooky-purple bg-opacity-20 rounded-lg border border-spooky-purple border-opacity-30"
          >
            <h4 className="text-lg font-bold text-spooky-orange mb-3 flex items-center">
              🔮 Key Learning Points
            </h4>
            <ul className="space-y-2">
              {story.keyLearningPoints.map((point, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-start space-x-2 text-spooky-cream"
                >
                  <span className="text-spooky-orange mt-1">•</span>
                  <span>{point}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </Card>

      {/* Action Buttons */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Primary Actions */}
            <Card className="text-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {onStartQuiz && (
                  <Button
                    onClick={onStartQuiz}
                    variant="primary"
                    size="lg"
                    className="flex items-center justify-center space-x-2"
                  >
                    <span>🧙‍♀️</span>
                    <span>Take the Spooky Quiz</span>
                  </Button>
                )}
                
                <Button
                  onClick={handleCopyToClipboard}
                  variant="secondary"
                  size="lg"
                  className="flex items-center justify-center space-x-2"
                >
                  <span>{copiedToClipboard ? '✅' : '📋'}</span>
                  <span>{copiedToClipboard ? 'Copied!' : 'Copy Link'}</span>
                </Button>
              </div>
            </Card>

            {/* Social Sharing */}
            <Card>
              <h4 className="text-lg font-bold text-spooky-orange mb-4 text-center">
                👻 Share Your Spooky Story
              </h4>
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={() => handleShare('twitter')}
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                >
                  <span>🐦</span>
                  <span>Twitter</span>
                </Button>
                
                <Button
                  onClick={() => handleShare('facebook')}
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 bg-blue-800 hover:bg-blue-900"
                >
                  <span>📘</span>
                  <span>Facebook</span>
                </Button>
                
                <Button
                  onClick={() => handleShare('reddit')}
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700"
                >
                  <span>🤖</span>
                  <span>Reddit</span>
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip Typewriter Button */}
      {showTypewriter && !typewriterComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-6 right-6"
        >
          <Button
            onClick={() => {
              setTypewriterComplete(true);
              setShowActions(true);
            }}
            variant="ghost"
            size="sm"
            className="bg-spooky-purple bg-opacity-80 hover:bg-opacity-100"
          >
            ⏭️ Skip Animation
          </Button>
        </motion.div>
      )}
    </div>
  );
};