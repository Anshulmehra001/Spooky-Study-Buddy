import { Router, Request, Response, NextFunction } from 'express';
import { uploadSingle } from '../middleware/upload.js';
import { createSpookyError } from '../middleware/errorHandler.js';
import { storyGenerator } from '../services/storyGenerator.js';
import { storyStorage } from '../services/storyStorage.js';
import fs from 'fs/promises';

const router = Router();

// POST /api/stories/generate - Generate a spooky story from uploaded content
router.post('/generate', uploadSingle('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content } = req.body;
    const file = req.file;

    // Validate input
    if (!content && !file) {
      throw createSpookyError(
        'No content provided',
        400,
        'Please upload a file or paste some text to transform into a spooky story!'
      );
    }

    let textContent = content;
    let fileName = 'Direct text input';

    // If file was uploaded, read its content
    if (file) {
      fileName = file.originalname;
      try {
        const fileBuffer = await fs.readFile(file.path);
        textContent = fileBuffer.toString('utf-8');
        
        // Clean up uploaded file
        await fs.unlink(file.path);
      } catch (fileError) {
        console.error('Error reading uploaded file:', fileError);
        throw createSpookyError(
          'File processing failed',
          400,
          'The spirits had trouble reading your file. Please try a different format!'
        );
      }
    }

    // Validate content length
    if (!textContent || textContent.trim().length < 10) {
      throw createSpookyError(
        'Content too short',
        400,
        'Please provide more content for the spirits to work with! (At least 10 characters)'
      );
    }

    if (textContent.length > 10000) {
      throw createSpookyError(
        'Content too long',
        400,
        'That\'s too much content for one spooky story! Please keep it under 10,000 characters.'
      );
    }

    const startTime = Date.now();

    // Generate the spooky story using AI
    const story = await storyGenerator.generateSpookyStory({
      content: textContent,
      fileName,
      difficulty: 'intermediate'
    });

    const processingTime = (Date.now() - startTime) / 1000;

    // Save the story for sharing and future access
    const shareableLink = await storyStorage.saveStory(story);

    res.json({
      success: true,
      story: {
        ...story,
        shareableLink
      },
      processingTime,
      message: '👻 Your spooky story has been conjured by the spirits!'
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/stories/:id - Get a specific story by ID or shareable link
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    let story = null;

    // Try to get by story ID first
    if (id.startsWith('story-')) {
      story = await storyStorage.getStory(id);
    }

    // If not found, try as shareable link
    if (!story) {
      story = await storyStorage.getStoryByShareableLink(id);
    }

    if (!story) {
      throw createSpookyError(
        'Story not found',
        404,
        'This story seems to have vanished into the spirit realm! It may have expired or never existed.'
      );
    }

    res.json({
      success: true,
      data: story
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/stories - Get all stories (for development/testing)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const stories = await storyStorage.getAllStories(limit);

    res.json({
      success: true,
      stories,
      count: stories.length,
      message: stories.length > 0 
        ? `📚 Found ${stories.length} spooky stories in the grimoire!`
        : '📚 No stories in the grimoire yet! Upload some content to get started.'
    });
  } catch (error) {
    next(error);
  }
});

export { router as storiesRouter };