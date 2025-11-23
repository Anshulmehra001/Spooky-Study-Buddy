import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { errorHandler } from './middleware/errorHandler.js';
import { storiesRouter } from './routes/stories.js';
import { quizzesRouter } from './routes/quizzes.js';
import { progressRouter } from './routes/progress.js';
import { cleanupService } from './services/cleanup.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create uploads directory if it doesn't exist
import { mkdirSync } from 'fs';
const uploadsDir = join(__dirname, '../uploads');
try {
  mkdirSync(uploadsDir, { recursive: true });
} catch (error) {
  console.log('Uploads directory already exists or could not be created');
}

// Routes
app.use('/api/stories', storiesRouter);
app.use('/api/quizzes', quizzesRouter);
app.use('/api/progress', progressRouter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'OK', 
    message: '🎃 Spooky Study Buddy server is alive!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🎃 Spooky Study Buddy server running on port ${PORT}`);
  console.log(`👻 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Start automatic cleanup of expired stories
  cleanupService.startAutomaticCleanup(6); // Every 6 hours
});