import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quiz as QuizType, QuizResult } from '../../../../shared/src/types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Ghost } from '../characters/Ghost';
import { Vampire } from '../characters/Vampire';
import { Witch } from '../characters/Witch';
import { Skeleton } from '../characters/Skeleton';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useBreakpoint, useMobileInteractions } from '../../hooks/useResponsive';

interface QuizProps {
  quiz: QuizType;
  onComplete: (result: QuizResult, celebrationMessage?: string, retrySuggestions?: string[]) => void;
  onRetry?: () => void;
}

interface QuizState {
  currentQuestionIndex: number;
  answers: Record<string, number>;
  timeSpent: number;
  isSubmitting: boolean;
  showFeedback: boolean;
  selectedAnswer: number | null;
  feedbackMessage: string;
  isCorrect: boolean;
}

const CharacterHost: React.FC<{ 
  character: string; 
  message?: string; 
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}> = ({ character, message, isActive = false, size = 'md' }) => {
  const getCharacterComponent = () => {
    const props = { 
      message, 
      size: size === 'lg' ? 'lg' as const : size === 'sm' ? 'sm' as const : 'md' as const
    };
    
    switch (character) {
      case 'ghost':
        return <Ghost {...props} />;
      case 'vampire':
        return <Vampire {...props} />;
      case 'witch':
        return <Witch {...props} />;
      case 'skeleton':
        return <Skeleton {...props} />;
      default:
        return <Ghost {...props} />;
    }
  };

  return (
    <motion.div
      animate={{
        scale: isActive ? 1.1 : 1,
        y: isActive ? -5 : 0,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`transition-all duration-300 ${isActive ? 'drop-shadow-lg' : ''}`}
    >
      {getCharacterComponent()}
    </motion.div>
  );
};

const ProgressBar: React.FC<{ current: number; total: number }> = ({ current, total }) => {
  const progress = (current / total) * 100;
  
  return (
    <div className="w-full bg-spooky-navy bg-opacity-50 rounded-full h-4 mb-6 overflow-hidden border border-spooky-orange border-opacity-30">
      <motion.div
        className="h-full bg-gradient-to-r from-spooky-orange to-spooky-green rounded-full relative"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Pumpkin vine effect */}
        <div className="absolute inset-0 bg-repeat-x opacity-30" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='16' viewBox='0 0 20 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 8c-2 0-3-1-3-3s1-3 3-3 3 1 3 3-1 3-3 3zm0-1c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z' fill='%23ffffff' fill-opacity='0.5'/%3E%3C/svg%3E")`,
               backgroundSize: '20px 16px'
             }}
        />
        {/* Pumpkin at the end */}
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs">
          🎃
        </div>
      </motion.div>
    </div>
  );
};

export const Quiz: React.FC<QuizProps> = ({ quiz, onComplete, onRetry }) => {
  const { isMobile } = useBreakpoint();
  const { getTouchProps } = useMobileInteractions();
  
  const [state, setState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: {},
    timeSpent: 0,
    isSubmitting: false,
    showFeedback: false,
    selectedAnswer: null,
    feedbackMessage: '',
    isCorrect: false
  });

  const [startTime] = useState(Date.now());
  const [_questionStartTime, setQuestionStartTime] = useState(Date.now());

  const currentQuestion = quiz.questions[state.currentQuestionIndex];
  const isLastQuestion = state.currentQuestionIndex === quiz.questions.length - 1;
  const progress = state.currentQuestionIndex + 1;

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setState(prev => ({
        ...prev,
        timeSpent: Math.floor((Date.now() - startTime) / 1000)
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (state.showFeedback) return;

    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    
    // Play sound effect
    if (isCorrect && (window as any).spookySounds?.success) {
      (window as any).spookySounds.success();
    } else if (!isCorrect && (window as any).spookySounds?.error) {
      (window as any).spookySounds.error();
    }
    
    setState(prev => ({
      ...prev,
      selectedAnswer: answerIndex,
      answers: {
        ...prev.answers,
        [currentQuestion.id]: answerIndex
      },
      showFeedback: true,
      isCorrect,
      feedbackMessage: isCorrect 
        ? getCorrectFeedback(currentQuestion.character)
        : currentQuestion.explanation
    }));

    // Auto-advance after showing feedback
    setTimeout(() => {
      if (isLastQuestion) {
        handleQuizComplete();
      } else {
        handleNextQuestion();
      }
    }, 3000);
  };

  const handleNextQuestion = () => {
    setState(prev => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
      showFeedback: false,
      selectedAnswer: null,
      feedbackMessage: '',
      isCorrect: false
    }));
    setQuestionStartTime(Date.now());
  };

  const handleQuizComplete = async () => {
    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Submit quiz and get results
      const { quizApi } = await import('../../services/api');
      const response = await quizApi.submitQuiz(quiz.id, state.answers, state.timeSpent);
      
      if (response.success) {
        onComplete(
          response.results, 
          response.celebrationMessage, 
          response.retrySuggestions
        );
      } else {
        throw new Error('Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      // Still call onComplete with local calculation as fallback
      const correctAnswers = Object.entries(state.answers).reduce((count, [questionId, answer]) => {
        const question = quiz.questions.find(q => q.id === questionId);
        return question && answer === question.correctAnswer ? count + 1 : count;
      }, 0);

      const fallbackResult: QuizResult = {
        quizId: quiz.id,
        score: Math.round((correctAnswers / quiz.questions.length) * 100),
        totalQuestions: quiz.questions.length,
        correctAnswers,
        timeSpent: state.timeSpent,
        feedback: 'Quiz completed! Check your results above.',
        badges: [],
        submittedAt: new Date().toISOString()
      };

      onComplete(fallbackResult, undefined, undefined);
    }
  };

  const getCorrectFeedback = (character: string): string => {
    const feedbacks = {
      ghost: "Boo-tiful! You got it right! 👻",
      vampire: "Excellent! I vant to congratulate you! 🧛‍♂️",
      witch: "Magical! Your knowledge is brewing nicely! 🧙‍♀️",
      skeleton: "That's humerus! You nailed it! 💀"
    };
    return feedbacks[character as keyof typeof feedbacks] || "Correct! Well done! 🎉";
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (state.isSubmitting) {
    return (
      <Card className="text-center max-w-2xl mx-auto">
        <LoadingSpinner size="lg" />
        <h3 className="text-2xl font-bold text-spooky-orange mt-4 mb-2">
          🎃 Calculating Your Spooky Score...
        </h3>
        <p className="text-spooky-cream opacity-80">
          The spirits are tallying your answers!
        </p>
        <div className="flex justify-center space-x-4 mt-6">
          <Ghost message="Almost done!" />
          <Witch message="Brewing results!" />
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Quiz Header */}
      <Card>
        <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'justify-between items-center'} mb-4`}>
          <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-spooky-orange text-center`}>
            🧙‍♀️ Spooky Quiz
          </h2>
          <div className={`${isMobile ? 'text-center' : 'text-right'} text-spooky-cream opacity-80`}>
            <div className="text-sm">Time: {formatTime(state.timeSpent)}</div>
            <div className="text-sm">
              Question {progress} of {quiz.questions.length}
            </div>
          </div>
        </div>
        
        <ProgressBar current={progress} total={quiz.questions.length} />
        
        <div className="text-center text-spooky-cream opacity-80">
          <span className="text-sm">Difficulty: </span>
          <span className="capitalize font-medium text-spooky-orange">
            {quiz.difficulty}
          </span>
        </div>
      </Card>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state.currentQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            {/* Character Host */}
            <div className="flex flex-col items-center mb-6 space-y-3">
              <CharacterHost 
                character={currentQuestion.character}
                isActive={true}
                size="lg"
              />
              <div className="text-sm font-medium text-spooky-orange opacity-80">
                Question {progress} of {quiz.questions.length}
              </div>
            </div>

            {/* Question */}
            <h3 className={`${isMobile ? 'text-base' : 'text-xl'} font-bold text-spooky-cream mb-6 text-center leading-relaxed px-4 break-words`}>
              {currentQuestion.question}
            </h3>

            {/* Answer Options */}
            <div className={`space-y-${isMobile ? '2' : '3'}`}>
              {currentQuestion.options.map((option, index) => {
                const isSelected = state.selectedAnswer === index;
                const isCorrect = index === currentQuestion.correctAnswer;
                const showResult = state.showFeedback;
                
                let buttonVariant: 'primary' | 'secondary' | 'ghost' = 'secondary';
                let buttonClass = '';
                
                if (showResult) {
                  if (isCorrect) {
                    buttonVariant = 'primary';
                    buttonClass = 'bg-green-600 hover:bg-green-700 border-green-500';
                  } else if (isSelected) {
                    buttonClass = 'bg-red-600 hover:bg-red-700 border-red-500';
                  }
                } else if (isSelected) {
                  buttonVariant = 'primary';
                }

                return (
                  <motion.div
                    key={index}
                    whileHover={{ scale: showResult ? 1 : (isMobile ? 1 : 1.02) }}
                    whileTap={{ scale: showResult ? 1 : 0.98 }}
                  >
                    <Button
                      {...getTouchProps(() => handleAnswerSelect(index))}
                      variant={buttonVariant}
                      size={isMobile ? 'md' : 'lg'}
                      disabled={state.showFeedback}
                      className={`w-full text-left justify-start ${isMobile ? 'p-3 text-sm' : 'p-4'} ${buttonClass} touch-manipulation`}
                    >
                      <span className={`font-bold ${isMobile ? 'mr-2' : 'mr-3'} text-spooky-orange`}>
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className="flex-1 leading-relaxed">{option}</span>
                      {showResult && isCorrect && (
                        <span className="ml-auto text-green-300 text-lg">✓</span>
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <span className="ml-auto text-red-300 text-lg">✗</span>
                      )}
                    </Button>
                  </motion.div>
                );
              })}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {state.showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`mt-6 p-4 rounded-lg border ${
                    state.isCorrect 
                      ? 'bg-green-900 bg-opacity-30 border-green-500 border-opacity-50' 
                      : 'bg-orange-900 bg-opacity-30 border-orange-500 border-opacity-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">
                      {state.isCorrect ? '🎉' : '📚'}
                    </div>
                    <div>
                      <p className="font-medium text-spooky-cream mb-1">
                        {state.isCorrect ? 'Correct!' : 'Not quite right...'}
                      </p>
                      <p className="text-spooky-cream opacity-90">
                        {state.feedbackMessage}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <p className="text-sm text-spooky-cream opacity-70">
                      {isLastQuestion 
                        ? 'Calculating final results...' 
                        : 'Moving to next question...'
                      }
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Manual Navigation (if needed) */}
      {!state.showFeedback && (
        <Card>
          <div className="flex justify-between items-center">
            <div className="text-sm text-spooky-cream opacity-70">
              Select an answer to continue
            </div>
            
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="ghost"
                size="sm"
                className="text-spooky-orange hover:text-spooky-cream"
              >
                🔄 Restart Quiz
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};