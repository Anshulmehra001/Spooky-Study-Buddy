import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { Navigation, FileUpload, Card, Ghost, Witch, LoadingSpinner } from './components';
import { quizApi, progressApi, handleApiError } from './services/api';
import { SpookyStory, Quiz as QuizType, QuizResult } from '../../shared/src/types';
import { localStoryGenerator } from './services/localStoryGenerator';
import { SpookyErrorBoundary } from './components/errors/SpookyErrorBoundary';
import { HalloweenParticles } from './components/effects/HalloweenEffects';
import { SpookyAudio } from './components/audio/SpookyAudio';
import { PageTransition } from './components/transitions/PageTransition';

// Lazy load heavy components for better performance
const StoryDisplay = lazy(() => import('./components/story/StoryDisplay').then(module => ({ default: module.StoryDisplay })));
const Quiz = lazy(() => import('./components/quiz/Quiz').then(module => ({ default: module.Quiz })));
const QuizResults = lazy(() => import('./components/quiz/QuizResults').then(module => ({ default: module.QuizResults })));
const ProgressDashboard = lazy(() => import('./components/progress/ProgressDashboard').then(module => ({ default: module.ProgressDashboard })));

function App() {
  return (
    <SpookyErrorBoundary>
      <Router>
        <div className="min-h-screen bg-spooky-navy">
          {/* Enhanced Halloween Background with Particles */}
          <HalloweenParticles />

          {/* Navigation */}
          <Navigation />

          {/* Spooky Audio Controls */}
          <SpookyAudio enabled={true} volume={0.2} />

          {/* Main content with page transitions */}
          <div className="relative z-10">
            <main id="main-content" className="container mx-auto px-4 py-8" role="main">
              <Suspense fallback={
                <PageTransition>
                  <Card className="max-w-4xl mx-auto text-center">
                    <LoadingSpinner size="lg" />
                    <h3 className="text-xl font-bold text-spooky-orange mt-4">
                      🎃 Loading Spooky Content...
                    </h3>
                  </Card>
                </PageTransition>
              }>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/story/:id" element={<StoryPage />} />
                  <Route path="/quiz/:id" element={<QuizPage />} />
                  <Route path="/progress" element={<ProgressPage />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </div>
      </Router>
    </SpookyErrorBoundary>
  );
}

// Placeholder components for routes
function HomePage() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (content: string, fileName: string) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      console.log('Generating story for:', fileName);
      
      // Use local story generator
      const story = await localStoryGenerator.generateStory(content, fileName);
      
      // Add generation mode info
      const provider = localStorage.getItem('ai_provider') || 'none';
      (story as any).generatedBy = provider === 'none' ? 'Template Mode' : provider === 'openai' ? 'OpenAI' : 'Google Gemini';
      
      // Store in localStorage
      const stories = JSON.parse(localStorage.getItem('spooky_stories') || '[]');
      stories.push(story);
      localStorage.setItem('spooky_stories', JSON.stringify(stories));
      
      // Navigate to the story page
      navigate(`/story/${story.id}`);
    } catch (err) {
      console.error('Story generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate story');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <PageTransition>
      <div className="text-center">
        {/* Hero Section */}
        <header className="text-center py-12 mb-8">
          <h1 className="font-creepster text-6xl md:text-8xl spooky-text-gradient mb-4">
            Spooky Study Buddy
          </h1>
          <p className="text-xl md:text-2xl text-spooky-cream opacity-90 max-w-2xl mx-auto px-4">
            Transform your boring study materials into engaging Halloween-themed stories and quizzes! 🎃👻
          </p>
        </header>

      {/* Loading State */}
      {isGenerating && (
        <Card className="text-center max-w-md mx-auto mb-8">
          <LoadingSpinner size="lg" />
          <h3 className="text-xl font-bold text-spooky-orange mt-4 mb-2">
            🎃 Conjuring Your Spooky Story...
          </h3>
          <p className="text-spooky-cream opacity-80">
            The spirits are working their magic! This may take up to 30 seconds.
          </p>
          <div className="flex justify-center space-x-4 mt-4">
            <Ghost message="Almost ready!" />
            <Witch message="Brewing knowledge!" />
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="text-center max-w-md mx-auto mb-8 border-red-500 border-opacity-50">
          <div className="text-6xl mb-4">😱</div>
          <h3 className="text-xl font-bold text-red-400 mb-2">
            Oops! Something Spooky Happened
          </h3>
          <p className="text-spooky-cream opacity-80 mb-4">
            {error}
          </p>
          <button
            onClick={() => setError(null)}
            className="text-spooky-orange hover:text-spooky-cream transition-colors"
          >
            Try Again 🎃
          </button>
        </Card>
      )}

      {/* File Upload Component */}
      {!isGenerating && (
        <FileUpload onFileUpload={handleFileUpload} />
      )}

      {/* Feature Overview */}
      <div className="max-w-4xl mx-auto mt-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-spooky-orange mb-2">Upload Content</h3>
            <p className="text-spooky-cream opacity-80">
              Share your study materials - text files, PDFs, or paste directly
            </p>
          </Card>
          <Card className="text-center">
            <div className="text-6xl mb-4">👻</div>
            <h3 className="text-xl font-bold text-spooky-orange mb-2">Get Spooky Story</h3>
            <p className="text-spooky-cream opacity-80">
              AI transforms your content into engaging Halloween narratives
            </p>
          </Card>
          <Card className="text-center">
            <div className="text-6xl mb-4">🧙‍♀️</div>
            <h3 className="text-xl font-bold text-spooky-orange mb-2">Take Quiz</h3>
            <p className="text-spooky-cream opacity-80">
              Test your knowledge with interactive spooky character quizzes
            </p>
          </Card>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}

function StoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [story, setStory] = useState<SpookyStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const loadStory = async () => {
      if (!id) {
        setError('No story ID provided');
        setLoading(false);
        return;
      }

      try {
        // Get story from localStorage
        const stories = JSON.parse(localStorage.getItem('spooky_stories') || '[]');
        const storyData = stories.find((s: SpookyStory) => s.id === id);
        
        if (!storyData) {
          throw new Error('Story not found');
        }
        
        setStory(storyData);
        
        // Record that the story was read for progress tracking
        try {
          await progressApi.recordStoryRead(storyData);
        } catch (progressErr) {
          console.warn('Failed to record story read progress:', progressErr);
          // Don't fail the whole operation if progress tracking fails
        }
      } catch (err) {
        console.error('Error loading story:', err);
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    loadStory();
  }, [id]);

  const handleStartQuiz = () => {
    if (story) {
      navigate(`/quiz/${story.id}`);
    }
  };

  if (loading) {
    return (
      <Card className="max-w-4xl mx-auto text-center">
        <LoadingSpinner size="lg" />
        <h3 className="text-xl font-bold text-spooky-orange mt-4">
          📖 Loading Your Spooky Story...
        </h3>
        <div className="flex justify-center space-x-4 mt-4">
          <Ghost message="Fetching from the spirit realm!" />
        </div>
      </Card>
    );
  }

  if (error || !story) {
    return (
      <Card className="max-w-4xl mx-auto text-center border-red-500 border-opacity-50">
        <div className="text-6xl mb-4">👻</div>
        <h3 className="text-xl font-bold text-red-400 mb-2">
          Story Not Found
        </h3>
        <p className="text-spooky-cream opacity-80 mb-4">
          {error || 'This story seems to have vanished into the spirit realm!'}
        </p>
        <button
          onClick={() => navigate('/')}
          className="text-spooky-orange hover:text-spooky-cream transition-colors"
        >
          🏠 Return Home
        </button>
      </Card>
    );
  }

  return (
    <StoryDisplay 
      story={story}
      onStartQuiz={handleStartQuiz}
      showTypewriter={true}
    />
  );
}

function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<QuizType | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [celebrationMessage, setCelebrationMessage] = useState<string>('');
  const [retrySuggestions, setRetrySuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  React.useEffect(() => {
    const loadOrGenerateQuiz = async () => {
      if (!id) {
        setError('No story ID provided');
        setLoading(false);
        return;
      }

      try {
        setIsGenerating(true);
        
        // Get story from localStorage
        const stories = JSON.parse(localStorage.getItem('spooky_stories') || '[]');
        const story = stories.find((s: SpookyStory) => s.id === id);
        
        if (!story) {
          throw new Error('Story not found');
        }
        
        // Generate quiz locally
        const quiz = localStoryGenerator.generateQuiz(story);
        setQuiz(quiz);
      } catch (err) {
        console.error('Error generating quiz:', err);
        setError(handleApiError(err));
      } finally {
        setLoading(false);
        setIsGenerating(false);
      }
    };

    loadOrGenerateQuiz();
  }, [id]);

  const handleQuizComplete = async (result: QuizResult, celebration?: string, suggestions?: string[]) => {
    setQuizResult(result);
    setCelebrationMessage(celebration || '');
    setRetrySuggestions(suggestions || []);
    
    // Record quiz completion for progress tracking
    try {
      await progressApi.recordQuizCompleted(result);
    } catch (progressErr) {
      console.warn('Failed to record quiz completion progress:', progressErr);
      // Don't fail the whole operation if progress tracking fails
    }
  };

  const handleRetry = async () => {
    try {
      setLoading(true);
      setQuizResult(null);
      setCelebrationMessage('');
      setRetrySuggestions([]);
      
      // Generate a new quiz with different questions
      const response = await quizApi.retryQuiz(id!, 'medium');
      
      if (response.success && response.quiz) {
        setQuiz(response.quiz);
      } else {
        throw new Error('Failed to generate retry quiz');
      }
    } catch (err) {
      console.error('Error generating retry quiz:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleBackToStory = () => {
    navigate(`/story/${id}`);
  };

  const handleViewProgress = () => {
    navigate('/progress');
  };

  if (loading || isGenerating) {
    return (
      <Card className="max-w-4xl mx-auto text-center">
        <LoadingSpinner size="lg" />
        <h3 className="text-2xl font-bold text-spooky-orange mt-4 mb-2">
          🧙‍♀️ Brewing Your Spooky Quiz...
        </h3>
        <p className="text-spooky-cream opacity-80 mb-4">
          The spirits are crafting questions from your story!
        </p>
        <div className="flex justify-center space-x-4">
          <Ghost message="Preparing questions!" />
          <Witch message="Adding spooky magic!" />
        </div>
      </Card>
    );
  }

  if (error || !quiz) {
    return (
      <Card className="max-w-4xl mx-auto text-center border-red-500 border-opacity-50">
        <div className="text-6xl mb-4">🎃</div>
        <h3 className="text-xl font-bold text-red-400 mb-2">
          Quiz Generation Failed
        </h3>
        <p className="text-spooky-cream opacity-80 mb-4">
          {error || 'Unable to create quiz from this story!'}
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate(`/story/${id}`)}
            className="text-spooky-orange hover:text-spooky-cream transition-colors"
          >
            📖 Back to Story
          </button>
          <button
            onClick={() => navigate('/')}
            className="text-spooky-orange hover:text-spooky-cream transition-colors"
          >
            🏠 Return Home
          </button>
        </div>
      </Card>
    );
  }

  // Show quiz results if completed
  if (quizResult) {
    return (
      <QuizResults
        result={quizResult}
        celebrationMessage={celebrationMessage}
        retrySuggestions={retrySuggestions}
        onRetry={handleRetry}
        onBackToStory={handleBackToStory}
        onViewProgress={handleViewProgress}
      />
    );
  }

  // Show the quiz
  return (
    <Quiz
      quiz={quiz}
      onComplete={handleQuizComplete}
      onRetry={handleRetry}
    />
  );
}

function ProgressPage() {
  return <ProgressDashboard />;
}

export default App;