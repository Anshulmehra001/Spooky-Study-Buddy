import { UserProgress, Badge, QuizResult, SpookyStory } from '../types.js';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ProgressService {
  private dataDir: string;
  private progressFile: string;

  constructor() {
    this.dataDir = join(__dirname, '../../data/progress');
    this.progressFile = join(this.dataDir, 'user_progress.json');
    this.ensureDataDirectory();
  }

  private async ensureDataDirectory(): Promise<void> {
    try {
      if (!existsSync(this.dataDir)) {
        await mkdir(this.dataDir, { recursive: true });
      }
    } catch (error) {
      console.error('Error creating progress data directory:', error);
    }
  }

  /**
   * Get user progress data
   */
  async getUserProgress(userId: string = 'default'): Promise<UserProgress> {
    try {
      const data = await readFile(this.progressFile, 'utf-8');
      const allProgress: Record<string, UserProgress> = JSON.parse(data);
      
      if (allProgress[userId]) {
        return allProgress[userId];
      }
    } catch (error) {
      // File doesn't exist or is invalid, return default progress
    }

    // Return default progress for new user
    return this.createDefaultProgress(userId);
  }

  /**
   * Save user progress data
   */
  async saveUserProgress(progress: UserProgress): Promise<void> {
    try {
      let allProgress: Record<string, UserProgress> = {};
      
      // Try to read existing data
      try {
        const data = await readFile(this.progressFile, 'utf-8');
        allProgress = JSON.parse(data);
      } catch (error) {
        // File doesn't exist, start with empty object
      }

      // Update the specific user's progress
      allProgress[progress.userId] = progress;

      await writeFile(this.progressFile, JSON.stringify(allProgress, null, 2));
    } catch (error) {
      console.error('Error saving user progress:', error);
      throw new Error('Failed to save progress data');
    }
  }

  /**
   * Update progress when a story is read
   */
  async recordStoryRead(userId: string, story: SpookyStory): Promise<UserProgress> {
    const progress = await this.getUserProgress(userId);
    
    // Check if story already exists in read stories
    const existingStoryIndex = progress.storiesRead.findIndex(s => s.id === story.id);
    
    if (existingStoryIndex === -1) {
      // New story, add to read list
      progress.storiesRead.push(story);
      progress.experiencePoints += 10; // Base XP for reading a story
      
      // Check for level up
      const newLevel = this.calculateLevel(progress.experiencePoints);
      if (newLevel > progress.level) {
        progress.level = newLevel;
        // Award level up badge
        const levelBadge = this.createLevelBadge(newLevel);
        progress.badges.push(levelBadge);
      }
    }

    await this.saveUserProgress(progress);
    return progress;
  }

  /**
   * Update progress when a quiz is completed
   */
  async recordQuizCompleted(userId: string, quizResult: QuizResult): Promise<UserProgress> {
    const progress = await this.getUserProgress(userId);
    
    // Add quiz result to history
    progress.quizzesTaken.push(quizResult);
    
    // Calculate XP with bonuses
    let baseXP = 15;
    let xpMultiplier = 1.0;
    
    // Score-based XP
    const scoreMultiplier = quizResult.score / 100;
    baseXP = Math.round(baseXP * scoreMultiplier);
    
    // Perfect score bonus
    if (quizResult.score === 100) {
      xpMultiplier += 0.5;
    }
    
    // Fast completion bonus (under 60 seconds)
    if (quizResult.timeSpent < 60) {
      xpMultiplier += 0.2;
    }
    
    // Streak bonus
    if (progress.currentStreak >= 7) {
      xpMultiplier += 0.3;
    } else if (progress.currentStreak >= 3) {
      xpMultiplier += 0.2;
    }
    
    const earnedXP = Math.round(baseXP * xpMultiplier);
    progress.experiencePoints += earnedXP;
    
    // Update streak
    this.updateStreak(progress, quizResult.submittedAt);
    
    // Check for achievements
    const newBadges = this.checkForNewBadges(progress);
    progress.badges.push(...newBadges);
    
    // Check for level up
    const newLevel = this.calculateLevel(progress.experiencePoints);
    if (newLevel > progress.level) {
      progress.level = newLevel;
      const levelBadge = this.createLevelBadge(newLevel);
      progress.badges.push(levelBadge);
    }

    await this.saveUserProgress(progress);
    return progress;
  }

  /**
   * Get Halloween-themed metrics
   */
  getHalloweenMetrics(progress: UserProgress): {
    pumpkinsCollected: number;
    ghostsBefriended: number;
    spellsCast: number;
    candyEarned: number;
  } {
    return {
      pumpkinsCollected: progress.storiesRead.length,
      ghostsBefriended: progress.quizzesTaken.filter(q => q.score >= 80).length,
      spellsCast: progress.quizzesTaken.length,
      candyEarned: Math.floor(progress.experiencePoints / 10)
    };
  }

  /**
   * Get learning statistics
   */
  getLearningStats(progress: UserProgress): {
    averageScore: number;
    totalTimeSpent: number;
    improvementTrend: number;
    favoriteTopics: string[];
  } {
    const quizzes = progress.quizzesTaken;
    
    if (quizzes.length === 0) {
      return {
        averageScore: 0,
        totalTimeSpent: 0,
        improvementTrend: 0,
        favoriteTopics: []
      };
    }

    const averageScore = quizzes.reduce((sum, q) => sum + q.score, 0) / quizzes.length;
    const totalTimeSpent = quizzes.reduce((sum, q) => sum + q.timeSpent, 0);
    
    // Calculate improvement trend (last 5 vs first 5 quizzes)
    let improvementTrend = 0;
    if (quizzes.length >= 5) {
      const firstFive = quizzes.slice(0, 5);
      const lastFive = quizzes.slice(-5);
      const firstAvg = firstFive.reduce((sum, q) => sum + q.score, 0) / 5;
      const lastAvg = lastFive.reduce((sum, q) => sum + q.score, 0) / 5;
      improvementTrend = lastAvg - firstAvg;
    }

    // Extract favorite topics from stories
    const topicCounts = new Map<string, number>();
    progress.storiesRead.forEach(story => {
      const topic = story.originalTopic || 'General';
      topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
    });
    
    const favoriteTopics = Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic);

    return {
      averageScore: Math.round(averageScore * 10) / 10,
      totalTimeSpent,
      improvementTrend: Math.round(improvementTrend * 10) / 10,
      favoriteTopics
    };
  }

  private createDefaultProgress(userId: string): UserProgress {
    return {
      userId,
      level: 1,
      experiencePoints: 0,
      storiesRead: [],
      quizzesTaken: [],
      badges: [this.createWelcomeBadge()],
      currentStreak: 0,
      longestStreak: 0,
      favoriteCharacter: undefined
    };
  }

  private calculateLevel(xp: number): number {
    // Level formula: level = floor(sqrt(xp / 100)) + 1
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  private updateStreak(progress: UserProgress, submittedAt: string): void {
    const today = new Date().toDateString();
    const submittedDate = new Date(submittedAt).toDateString();
    
    if (submittedDate === today) {
      // Quiz taken today, increment streak
      progress.currentStreak += 1;
      if (progress.currentStreak > progress.longestStreak) {
        progress.longestStreak = progress.currentStreak;
      }
    } else {
      // Reset streak if not consecutive
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (submittedDate !== yesterday.toDateString()) {
        progress.currentStreak = 1; // Start new streak
      }
    }
  }

  private checkForNewBadges(progress: UserProgress): Badge[] {
    const badges: Badge[] = [];
    const existingBadgeIds = new Set(progress.badges.map(b => b.id));

    // Quiz completion badges
    const quizCount = progress.quizzesTaken.length;
    if (quizCount === 1 && !existingBadgeIds.has('first-quiz')) {
      badges.push(this.createBadge('first-quiz', 'First Quiz Master', 'Completed your first spooky quiz!', '🧙‍♀️', 'common'));
    }
    if (quizCount === 5 && !existingBadgeIds.has('quiz-apprentice')) {
      badges.push(this.createBadge('quiz-apprentice', 'Quiz Apprentice', 'Completed 5 spooky quizzes!', '🎃', 'common'));
    }
    if (quizCount === 10 && !existingBadgeIds.has('quiz-scholar')) {
      badges.push(this.createBadge('quiz-scholar', 'Quiz Scholar', 'Completed 10 spooky quizzes!', '📚', 'rare'));
    }

    // Perfect score badges
    const perfectScores = progress.quizzesTaken.filter(q => q.score === 100).length;
    if (perfectScores === 1 && !existingBadgeIds.has('perfect-first')) {
      badges.push(this.createBadge('perfect-first', 'Perfect Spell', 'Got your first perfect score!', '⭐', 'rare'));
    }
    if (perfectScores === 3 && !existingBadgeIds.has('perfect-trio')) {
      badges.push(this.createBadge('perfect-trio', 'Triple Perfect', 'Three perfect scores!', '🌟', 'legendary'));
    }

    // Streak badges
    if (progress.currentStreak === 3 && !existingBadgeIds.has('streak-3')) {
      badges.push(this.createBadge('streak-3', 'Three Day Streak', 'Studied for 3 days in a row!', '🔥', 'common'));
    }
    if (progress.currentStreak === 7 && !existingBadgeIds.has('streak-7')) {
      badges.push(this.createBadge('streak-7', 'Weekly Warrior', 'Studied for 7 days in a row!', '👑', 'rare'));
    }

    // Story reading badges
    const storyCount = progress.storiesRead.length;
    if (storyCount === 1 && !existingBadgeIds.has('first-story')) {
      badges.push(this.createBadge('first-story', 'Story Seeker', 'Read your first spooky story!', '👻', 'common'));
    }
    if (storyCount === 5 && !existingBadgeIds.has('story-collector')) {
      badges.push(this.createBadge('story-collector', 'Story Collector', 'Read 5 spooky stories!', '📖', 'rare'));
    }

    return badges;
  }

  private createBadge(id: string, name: string, description: string, icon: string, rarity: 'common' | 'rare' | 'legendary'): Badge {
    return {
      id,
      name,
      description,
      icon,
      unlockedAt: new Date().toISOString(),
      rarity
    };
  }

  private createWelcomeBadge(): Badge {
    return this.createBadge('welcome', 'Welcome to the Coven', 'Joined the Spooky Study Buddy family!', '🎭', 'common');
  }

  private createLevelBadge(level: number): Badge {
    return this.createBadge(
      `level-${level}`,
      `Level ${level} Sorcerer`,
      `Reached level ${level} in your magical studies!`,
      '🔮',
      level >= 10 ? 'legendary' : level >= 5 ? 'rare' : 'common'
    );
  }
}

export const progressService = new ProgressService();