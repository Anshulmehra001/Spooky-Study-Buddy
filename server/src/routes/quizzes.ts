import { Router, Request, Response, NextFunction } from 'express';
import { createSpookyError } from '../middleware/errorHandler.js';
import { quizGenerator } from '../services/quizGenerator.js';
import { storyStorage } from '../services/storyStorage.js';
import { quizStorage } from '../services/quizStorage.js';
import { scoringService } from '../services/scoringService.js';

const router = Router();

// POST /api/quizzes/generate - Generate a quiz from a story
router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { storyId, difficulty = 'medium', questionCount } = req.body;

    if (!storyId) {
      throw createSpookyError(
        'Story ID required',
        400,
        'Please provide a story ID to generate a quiz from!'
      );
    }

    // Validate difficulty level
    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(difficulty)) {
      throw createSpookyError(
        'Invalid difficulty level',
        400,
        'Difficulty must be easy, medium, or hard'
      );
    }

    // Get the story content for quiz generation
    const story = await storyStorage.getStory(storyId);
    if (!story) {
      throw createSpookyError(
        'Story not found',
        404,
        'The story has vanished into the shadow realm! Cannot generate quiz.'
      );
    }

    // Generate quiz using AI service
    const quiz = await quizGenerator.generateQuiz(story.content, storyId, {
      difficulty,
      questionCount
    });

    // Save the quiz for later retrieval
    await quizStorage.saveQuiz(quiz);

    res.json({
      success: true,
      quiz,
      estimatedTime: Math.ceil(quiz.timeLimit! / 60), // Convert to minutes
      message: '🧙‍♀️ Your spooky quiz has been brewed!'
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/quizzes/submit - Submit quiz answers and get results
router.post('/submit', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { quizId, answers, timeSpent = 0 } = req.body;

    if (!quizId || !answers || typeof answers !== 'object') {
      throw createSpookyError(
        'Missing quiz data',
        400,
        'Please provide quiz ID and answers to submit!'
      );
    }

    // Get the quiz to check correct answers
    const quiz = await quizStorage.getQuiz(quizId);
    if (!quiz) {
      throw createSpookyError(
        'Quiz not found',
        404,
        'This quiz has disappeared into the shadow realm!'
      );
    }

    // Use comprehensive scoring service
    const result = scoringService.calculateScore(quiz, answers, timeSpent, {
      timeBonus: true,
      difficultyMultiplier: true,
      streakBonus: false // Could be implemented with user history
    });

    // Save the result
    await quizStorage.saveQuizResult(result);

    // Generate celebration message
    const celebrationMessage = scoringService.generateCelebrationMessage(result.score, result.badges || []);
    
    // Generate retry suggestions if score could be improved
    const retrySuggestions = result.score < 90 
      ? scoringService.generateRetrySuggestions(result.score, quiz.difficulty)
      : [];

    res.json({
      success: true,
      results: result,
      celebrationMessage,
      retrySuggestions,
      message: '👻 Quiz submitted successfully!'
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/quizzes/:id - Get a specific quiz by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const quiz = await quizStorage.getQuiz(id);
    if (!quiz) {
      throw createSpookyError(
        'Quiz not found',
        404,
        'This quiz has disappeared into the shadow realm!'
      );
    }

    res.json({
      success: true,
      quiz
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/quizzes/results/:quizId - Get results for a specific quiz
router.get('/results/:quizId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { quizId } = req.params;
    const results = await quizStorage.getQuizResults(quizId);

    res.json({
      success: true,
      results
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/quizzes/stats/user - Get user quiz statistics
router.get('/stats/user', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await quizStorage.getUserStats();

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/quizzes/retry/:storyId - Generate a new quiz for retry
router.post('/retry/:storyId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { storyId } = req.params;
    const { difficulty = 'medium', questionCount } = req.body;

    // Get the story content
    const story = await storyStorage.getStory(storyId);
    if (!story) {
      throw createSpookyError(
        'Story not found',
        404,
        'The story has vanished! Cannot generate retry quiz.'
      );
    }

    // Generate a new quiz with potentially different questions
    const quiz = await quizGenerator.generateQuiz(story.content, storyId, {
      difficulty,
      questionCount
    });

    // Save the new quiz
    await quizStorage.saveQuiz(quiz);

    res.json({
      success: true,
      quiz,
      estimatedTime: Math.ceil(quiz.timeLimit! / 60),
      message: '🔄 New spooky quiz brewed for your retry!'
    });

  } catch (error) {
    next(error);
  }
});

export { router as quizzesRouter };