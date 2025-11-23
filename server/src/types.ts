// Halloween character types
export type HalloweenCharacterType = 'ghost' | 'vampire' | 'witch' | 'skeleton' | 'pumpkin';

export interface HalloweenCharacter {
  name: string;
  type: HalloweenCharacterType;
  personality: string;
  catchphrase: string;
}

// Story-related types
export interface SpookyStory {
  id: string;
  title: string;
  content: string;
  originalContent?: string;
  originalTopic: string;
  characters: string[];
  keyLearningPoints?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime?: number;
  createdAt: string;
  shareableLink?: string;
}

// Quiz-related types
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  character: HalloweenCharacterType;
}

export interface Quiz {
  id: string;
  storyId: string;
  questions: QuizQuestion[];
  totalPoints: number;
  timeLimit?: number;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: string;
}

export interface QuizResult {
  quizId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  feedback: string;
  badges?: string[];
  submittedAt: string;
}

// Progress and gamification types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'legendary';
}

export interface UserProgress {
  userId: string;
  level: number;
  experiencePoints: number;
  storiesRead: SpookyStory[];
  quizzesTaken: QuizResult[];
  badges: Badge[];
  currentStreak: number;
  longestStreak: number;
  favoriteCharacter?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: boolean;
}

export interface ErrorResponse {
  error: true;
  message: string;
  character: {
    name: string;
    personality: string;
    catchphrase: string;
  };
  suggestedAction?: string;
  errorCode: string;
  timestamp: string;
}

// File upload types
export interface FileUploadRequest {
  content?: string;
  fileName?: string;
}

export interface StoryGenerationResponse extends ApiResponse {
  story: SpookyStory;
  processingTime: number;
}

export interface QuizGenerationResponse extends ApiResponse {
  quiz: Quiz;
  estimatedTime: number;
}