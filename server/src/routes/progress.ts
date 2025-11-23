import { Router, Request, Response, NextFunction } from 'express';
import { createSpookyError } from '../middleware/errorHandler.js';
import { progressService } from '../services/progressService.js';

const router = Router();

// GET /api/progress/:userId - Get user progress data
router.get('/:userId?', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId || 'default';
    const progress = await progressService.getUserProgress(userId);
    const halloweenMetrics = progressService.getHalloweenMetrics(progress);
    const learningStats = progressService.getLearningStats(progress);

    res.json({
      success: true,
      progress,
      halloweenMetrics,
      learningStats,
      message: '📊 Progress data retrieved from the spirit realm!'
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/progress/story-read - Record that a story was read
router.post('/story-read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId = 'default', story } = req.body;

    if (!story || !story.id) {
      throw createSpookyError(
        'Story data required',
        400,
        'Please provide story information to record progress!'
      );
    }

    const updatedProgress = await progressService.recordStoryRead(userId, story);
    const halloweenMetrics = progressService.getHalloweenMetrics(updatedProgress);

    res.json({
      success: true,
      progress: updatedProgress,
      halloweenMetrics,
      message: '📚 Story reading progress recorded!'
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/progress/quiz-completed - Record quiz completion
router.post('/quiz-completed', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId = 'default', quizResult } = req.body;

    if (!quizResult || !quizResult.quizId) {
      throw createSpookyError(
        'Quiz result data required',
        400,
        'Please provide quiz result information to record progress!'
      );
    }

    const updatedProgress = await progressService.recordQuizCompleted(userId, quizResult);
    const halloweenMetrics = progressService.getHalloweenMetrics(updatedProgress);
    const learningStats = progressService.getLearningStats(updatedProgress);

    // Check for new badges earned (within last 10 seconds)
    const newBadges = updatedProgress.badges.filter(badge => {
      const badgeTime = new Date(badge.unlockedAt).getTime();
      const tenSecondsAgo = Date.now() - 10000;
      return badgeTime > tenSecondsAgo;
    });

    // Check if level increased
    const previousProgress = await progressService.getUserProgress(userId);
    const leveledUp = updatedProgress.level > (previousProgress?.level || 1);

    res.json({
      success: true,
      progress: updatedProgress,
      halloweenMetrics,
      learningStats,
      newBadges,
      leveledUp,
      message: leveledUp 
        ? `🎉 Level up! You're now level ${updatedProgress.level}!`
        : newBadges.length > 0 
        ? `🏆 Quiz completed! You earned ${newBadges.length} new badge${newBadges.length > 1 ? 's' : ''}!`
        : '🧙‍♀️ Quiz completion recorded!'
    });

  } catch (error) {
    next(error);
  }
});

// PUT /api/progress/favorite-character - Update favorite character
router.put('/favorite-character', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId = 'default', character } = req.body;

    if (!character) {
      throw createSpookyError(
        'Character required',
        400,
        'Please specify which spooky character is your favorite!'
      );
    }

    const validCharacters = ['ghost', 'vampire', 'witch', 'skeleton', 'pumpkin'];
    if (!validCharacters.includes(character)) {
      throw createSpookyError(
        'Invalid character',
        400,
        'Please choose from: ghost, vampire, witch, skeleton, or pumpkin!'
      );
    }

    const progress = await progressService.getUserProgress(userId);
    progress.favoriteCharacter = character;
    await progressService.saveUserProgress(progress);

    res.json({
      success: true,
      progress,
      message: `👻 ${character} is now your favorite spooky companion!`
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/progress/leaderboard - Get top performers (for future use)
router.get('/leaderboard/:category?', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = req.params.category || 'xp';
    
    // For now, return placeholder data since we only have one user
    // In a real app, this would aggregate data from all users
    const leaderboard = [
      {
        userId: 'default',
        rank: 1,
        score: 0,
        category
      }
    ];

    res.json({
      success: true,
      leaderboard,
      category,
      message: '🏆 Leaderboard summoned from the spirit realm!'
    });

  } catch (error) {
    next(error);
  }
});

export { router as progressRouter };