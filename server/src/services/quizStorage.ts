import fs from 'fs/promises';
import path from 'path';
import { Quiz, QuizResult } from '../types.js';

const QUIZ_DATA_DIR = path.join(process.cwd(), 'server', 'data', 'quizzes');
const RESULTS_DATA_DIR = path.join(process.cwd(), 'server', 'data', 'quiz-results');

export class QuizStorageService {
  constructor() {
    this.ensureDirectories();
  }

  /**
   * Ensure data directories exist
   */
  private async ensureDirectories(): Promise<void> {
    try {
      await fs.mkdir(QUIZ_DATA_DIR, { recursive: true });
      await fs.mkdir(RESULTS_DATA_DIR, { recursive: true });
    } catch (error) {
      console.error('Error creating quiz data directories:', error);
    }
  }

  /**
   * Save a quiz to storage
   */
  async saveQuiz(quiz: Quiz): Promise<void> {
    try {
      const filePath = path.join(QUIZ_DATA_DIR, `${quiz.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(quiz, null, 2));
      console.log(`Quiz saved: ${quiz.id}`);
    } catch (error) {
      console.error('Error saving quiz:', error);
      throw new Error('Failed to save quiz');
    }
  }

  /**
   * Get a quiz by ID
   */
  async getQuiz(quizId: string): Promise<Quiz | null> {
    try {
      const filePath = path.join(QUIZ_DATA_DIR, `${quizId}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as Quiz;
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return null; // Quiz not found
      }
      console.error('Error reading quiz:', error);
      throw new Error('Failed to read quiz');
    }
  }

  /**
   * Save quiz results
   */
  async saveQuizResult(result: QuizResult): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${result.quizId}-${timestamp}.json`;
      const filePath = path.join(RESULTS_DATA_DIR, fileName);
      
      await fs.writeFile(filePath, JSON.stringify(result, null, 2));
      console.log(`Quiz result saved: ${fileName}`);
    } catch (error) {
      console.error('Error saving quiz result:', error);
      throw new Error('Failed to save quiz result');
    }
  }

  /**
   * Get quiz results for a specific quiz
   */
  async getQuizResults(quizId: string): Promise<QuizResult[]> {
    try {
      const files = await fs.readdir(RESULTS_DATA_DIR);
      const quizFiles = files.filter(file => file.startsWith(quizId) && file.endsWith('.json'));
      
      const results: QuizResult[] = [];
      for (const file of quizFiles) {
        try {
          const filePath = path.join(RESULTS_DATA_DIR, file);
          const data = await fs.readFile(filePath, 'utf-8');
          results.push(JSON.parse(data) as QuizResult);
        } catch (error) {
          console.error(`Error reading quiz result file ${file}:`, error);
        }
      }
      
      return results.sort((a, b) => 
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
    } catch (error) {
      console.error('Error getting quiz results:', error);
      return [];
    }
  }

  /**
   * Get all quiz results (for progress tracking)
   */
  async getAllQuizResults(limit: number = 100): Promise<QuizResult[]> {
    try {
      const files = await fs.readdir(RESULTS_DATA_DIR);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      const results: QuizResult[] = [];
      for (const file of jsonFiles.slice(0, limit)) {
        try {
          const filePath = path.join(RESULTS_DATA_DIR, file);
          const data = await fs.readFile(filePath, 'utf-8');
          results.push(JSON.parse(data) as QuizResult);
        } catch (error) {
          console.error(`Error reading quiz result file ${file}:`, error);
        }
      }
      
      return results.sort((a, b) => 
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
    } catch (error) {
      console.error('Error getting all quiz results:', error);
      return [];
    }
  }

  /**
   * Calculate user statistics from quiz results
   */
  async getUserStats(): Promise<{
    totalQuizzes: number;
    averageScore: number;
    totalCorrectAnswers: number;
    totalQuestions: number;
    bestScore: number;
    recentScores: number[];
  }> {
    try {
      const results = await this.getAllQuizResults();
      
      if (results.length === 0) {
        return {
          totalQuizzes: 0,
          averageScore: 0,
          totalCorrectAnswers: 0,
          totalQuestions: 0,
          bestScore: 0,
          recentScores: []
        };
      }

      const totalQuizzes = results.length;
      const totalScore = results.reduce((sum, result) => sum + result.score, 0);
      const averageScore = Math.round(totalScore / totalQuizzes);
      const totalCorrectAnswers = results.reduce((sum, result) => sum + result.correctAnswers, 0);
      const totalQuestions = results.reduce((sum, result) => sum + result.totalQuestions, 0);
      const bestScore = Math.max(...results.map(result => result.score));
      const recentScores = results.slice(0, 10).map(result => result.score);

      return {
        totalQuizzes,
        averageScore,
        totalCorrectAnswers,
        totalQuestions,
        bestScore,
        recentScores
      };
    } catch (error) {
      console.error('Error calculating user stats:', error);
      return {
        totalQuizzes: 0,
        averageScore: 0,
        totalCorrectAnswers: 0,
        totalQuestions: 0,
        bestScore: 0,
        recentScores: []
      };
    }
  }

  /**
   * Clean up old quiz data (optional cleanup method)
   */
  async cleanupOldData(daysToKeep: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      // Clean up old quizzes
      const quizFiles = await fs.readdir(QUIZ_DATA_DIR);
      for (const file of quizFiles) {
        const filePath = path.join(QUIZ_DATA_DIR, file);
        const stats = await fs.stat(filePath);
        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath);
          console.log(`Cleaned up old quiz: ${file}`);
        }
      }

      // Clean up old results
      const resultFiles = await fs.readdir(RESULTS_DATA_DIR);
      for (const file of resultFiles) {
        const filePath = path.join(RESULTS_DATA_DIR, file);
        const stats = await fs.stat(filePath);
        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath);
          console.log(`Cleaned up old quiz result: ${file}`);
        }
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

export const quizStorage = new QuizStorageService();