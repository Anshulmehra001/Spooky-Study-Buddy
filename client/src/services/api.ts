import axios from 'axios';
import { SpookyStory, StoryGenerationResponse, ApiResponse } from '../../../shared/src/types';
import { cacheService } from './cacheService';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 60000, // 60 seconds for story generation
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 429) {
      throw new Error('Too many requests. Please wait a moment before trying again.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. The story generation is taking too long.');
    }
    
    throw error;
  }
);

export interface FileUploadData {
  content?: string;
  file?: File;
}

export class StoryApiService {
  /**
   * Generate a spooky story from content
   */
  async generateStory(data: FileUploadData): Promise<StoryGenerationResponse> {
    const formData = new FormData();
    
    if (data.content) {
      formData.append('content', data.content);
    }
    
    if (data.file) {
      formData.append('file', data.file);
    }

    const response = await api.post<StoryGenerationResponse>('/stories/generate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Get a story by ID or shareable link
   */
  async getStory(idOrLink: string): Promise<SpookyStory> {
    // Check cache first
    const cacheKey = `story_${idOrLink}`;
    const cachedStory = cacheService.get<SpookyStory>(cacheKey);
    if (cachedStory) {
      return cachedStory;
    }

    const response = await api.get<ApiResponse<SpookyStory>>(`/stories/${idOrLink}`);
    
    if (!response.data.success || !response.data.data) {
      throw new Error('Story not found or has expired');
    }

    // Cache the story for 30 minutes
    cacheService.set(cacheKey, response.data.data, 30 * 60 * 1000);

    return response.data.data;
  }

  /**
   * Get all stories (for development/testing)
   */
  async getAllStories(limit: number = 20): Promise<SpookyStory[]> {
    const response = await api.get<ApiResponse<SpookyStory[]>>('/stories', {
      params: { limit }
    });

    return response.data.data || [];
  }
}

export const storyApi = new StoryApiService();

export class QuizApiService {
  /**
   * Generate a quiz from a story
   */
  async generateQuiz(storyId: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium', questionCount?: number) {
    const response = await api.post('/quizzes/generate', {
      storyId,
      difficulty,
      questionCount
    });
    return response.data;
  }

  /**
   * Get a quiz by ID
   */
  async getQuiz(quizId: string) {
    const response = await api.get(`/quizzes/${quizId}`);
    return response.data;
  }

  /**
   * Submit quiz answers
   */
  async submitQuiz(quizId: string, answers: Record<string, number>, timeSpent: number) {
    const response = await api.post('/quizzes/submit', {
      quizId,
      answers,
      timeSpent
    });
    return response.data;
  }

  /**
   * Get quiz results
   */
  async getQuizResults(quizId: string) {
    const response = await api.get(`/quizzes/results/${quizId}`);
    return response.data;
  }

  /**
   * Get user quiz statistics
   */
  async getUserStats() {
    const response = await api.get('/quizzes/stats/user');
    return response.data;
  }

  /**
   * Generate a retry quiz with different questions
   */
  async retryQuiz(storyId: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium', questionCount?: number) {
    const response = await api.post(`/quizzes/retry/${storyId}`, {
      difficulty,
      questionCount
    });
    return response.data;
  }
}

export const quizApi = new QuizApiService();

export class ProgressApiService {
  /**
   * Get user progress data
   */
  async getUserProgress(userId: string = 'default') {
    // Check cache first
    const cacheKey = `progress_${userId}`;
    const cachedProgress = cacheService.get(cacheKey);
    if (cachedProgress) {
      return cachedProgress;
    }

    const response = await api.get(`/progress/${userId}`);
    
    // Cache progress for 2 minutes (shorter TTL for frequently changing data)
    cacheService.set(cacheKey, response.data, 2 * 60 * 1000);
    
    return response.data;
  }

  /**
   * Record that a story was read
   */
  async recordStoryRead(story: any, userId: string = 'default') {
    const response = await api.post('/progress/story-read', {
      userId,
      story
    });
    return response.data;
  }

  /**
   * Record quiz completion
   */
  async recordQuizCompleted(quizResult: any, userId: string = 'default') {
    const response = await api.post('/progress/quiz-completed', {
      userId,
      quizResult
    });
    return response.data;
  }

  /**
   * Update favorite character
   */
  async updateFavoriteCharacter(character: string, userId: string = 'default') {
    const response = await api.put('/progress/favorite-character', {
      userId,
      character
    });
    return response.data;
  }

  /**
   * Get leaderboard data
   */
  async getLeaderboard(category: string = 'xp') {
    const response = await api.get(`/progress/leaderboard/${category}`);
    return response.data;
  }
}

export const progressApi = new ProgressApiService();

// Utility functions for error handling
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  } else if (error.message) {
    return error.message;
  } else {
    return 'An unexpected error occurred. Please try again.';
  }
};

export const isSpookyError = (error: any): boolean => {
  return error.response?.data?.error === true && error.response?.data?.character;
};

export const getSpookyErrorMessage = (error: any): { message: string; character?: any } => {
  if (isSpookyError(error)) {
    return {
      message: error.response.data.message,
      character: error.response.data.character
    };
  }
  
  return {
    message: handleApiError(error)
  };
};