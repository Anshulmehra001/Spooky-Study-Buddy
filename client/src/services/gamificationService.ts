import { Badge, UserProgress } from '../../../shared/src/types';

export interface LevelInfo {
  level: number;
  title: string;
  description: string;
  requiredXP: number;
  nextLevelXP: number;
  icon: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'legendary';
  condition: (progress: UserProgress) => boolean;
  xpReward: number;
}

class GamificationService {
  private readonly levelTitles = [
    { level: 1, title: 'Novice Apprentice', icon: '🎭' },
    { level: 2, title: 'Curious Student', icon: '📚' },
    { level: 3, title: 'Eager Learner', icon: '✨' },
    { level: 4, title: 'Spell Weaver', icon: '🪄' },
    { level: 5, title: 'Knowledge Seeker', icon: '🔮' },
    { level: 6, title: 'Wisdom Gatherer', icon: '📜' },
    { level: 7, title: 'Mystic Scholar', icon: '🧙‍♀️' },
    { level: 8, title: 'Arcane Master', icon: '⚡' },
    { level: 9, title: 'Grand Sorcerer', icon: '👑' },
    { level: 10, title: 'Legendary Sage', icon: '🌟' }
  ];

  private readonly achievements: Achievement[] = [
    // Story reading achievements
    {
      id: 'first-story',
      name: 'Story Seeker',
      description: 'Read your first spooky story!',
      icon: '👻',
      rarity: 'common',
      condition: (progress) => progress.storiesRead.length >= 1,
      xpReward: 10
    },
    {
      id: 'story-collector',
      name: 'Story Collector',
      description: 'Read 5 spooky stories!',
      icon: '📖',
      rarity: 'rare',
      condition: (progress) => progress.storiesRead.length >= 5,
      xpReward: 25
    },
    {
      id: 'story-master',
      name: 'Story Master',
      description: 'Read 10 spooky stories!',
      icon: '📚',
      rarity: 'legendary',
      condition: (progress) => progress.storiesRead.length >= 10,
      xpReward: 50
    },

    // Quiz achievements
    {
      id: 'first-quiz',
      name: 'First Quiz Master',
      description: 'Completed your first spooky quiz!',
      icon: '🧙‍♀️',
      rarity: 'common',
      condition: (progress) => progress.quizzesTaken.length >= 1,
      xpReward: 15
    },
    {
      id: 'quiz-apprentice',
      name: 'Quiz Apprentice',
      description: 'Completed 5 spooky quizzes!',
      icon: '🎃',
      rarity: 'common',
      condition: (progress) => progress.quizzesTaken.length >= 5,
      xpReward: 30
    },
    {
      id: 'quiz-scholar',
      name: 'Quiz Scholar',
      description: 'Completed 10 spooky quizzes!',
      icon: '📚',
      rarity: 'rare',
      condition: (progress) => progress.quizzesTaken.length >= 10,
      xpReward: 50
    },

    // Perfect score achievements
    {
      id: 'perfect-first',
      name: 'Perfect Spell',
      description: 'Got your first perfect score!',
      icon: '⭐',
      rarity: 'rare',
      condition: (progress) => progress.quizzesTaken.some(q => q.score === 100),
      xpReward: 25
    },
    {
      id: 'perfect-trio',
      name: 'Triple Perfect',
      description: 'Three perfect scores!',
      icon: '🌟',
      rarity: 'legendary',
      condition: (progress) => progress.quizzesTaken.filter(q => q.score === 100).length >= 3,
      xpReward: 75
    },

    // Streak achievements
    {
      id: 'streak-3',
      name: 'Three Day Streak',
      description: 'Studied for 3 days in a row!',
      icon: '🔥',
      rarity: 'common',
      condition: (progress) => progress.currentStreak >= 3,
      xpReward: 20
    },
    {
      id: 'streak-7',
      name: 'Weekly Warrior',
      description: 'Studied for 7 days in a row!',
      icon: '👑',
      rarity: 'rare',
      condition: (progress) => progress.currentStreak >= 7,
      xpReward: 50
    },
    {
      id: 'streak-30',
      name: 'Monthly Master',
      description: 'Studied for 30 days in a row!',
      icon: '💎',
      rarity: 'legendary',
      condition: (progress) => progress.currentStreak >= 30,
      xpReward: 150
    },

    // Score-based achievements
    {
      id: 'high-scorer',
      name: 'High Scorer',
      description: 'Maintain an 80% average score!',
      icon: '🎯',
      rarity: 'rare',
      condition: (progress) => {
        if (progress.quizzesTaken.length < 3) return false;
        const avg = progress.quizzesTaken.reduce((sum, q) => sum + q.score, 0) / progress.quizzesTaken.length;
        return avg >= 80;
      },
      xpReward: 40
    },
    {
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Maintain a 95% average score!',
      icon: '💯',
      rarity: 'legendary',
      condition: (progress) => {
        if (progress.quizzesTaken.length < 5) return false;
        const avg = progress.quizzesTaken.reduce((sum, q) => sum + q.score, 0) / progress.quizzesTaken.length;
        return avg >= 95;
      },
      xpReward: 100
    },

    // Special achievements
    {
      id: 'speed-demon',
      name: 'Speed Demon',
      description: 'Complete a quiz in under 30 seconds!',
      icon: '⚡',
      rarity: 'rare',
      condition: (progress) => progress.quizzesTaken.some(q => q.timeSpent < 30),
      xpReward: 30
    },
    {
      id: 'night-owl',
      name: 'Night Owl',
      description: 'Complete a quiz after midnight!',
      icon: '🦉',
      rarity: 'common',
      condition: (progress) => progress.quizzesTaken.some(q => {
        const hour = new Date(q.submittedAt).getHours();
        return hour >= 0 && hour < 6;
      }),
      xpReward: 15
    }
  ];

  /**
   * Calculate level from experience points
   */
  calculateLevel(xp: number): number {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  /**
   * Calculate XP required for a specific level
   */
  getXPForLevel(level: number): number {
    return Math.pow(level - 1, 2) * 100;
  }

  /**
   * Get level information including title and progress
   */
  getLevelInfo(progress: UserProgress): LevelInfo {
    const currentLevel = progress.level;
    const currentXP = progress.experiencePoints;
    const currentLevelXP = this.getXPForLevel(currentLevel);
    const nextLevelXP = this.getXPForLevel(currentLevel + 1);
    
    const levelData = this.levelTitles.find(l => l.level === currentLevel) || 
                     this.levelTitles[this.levelTitles.length - 1];

    return {
      level: currentLevel,
      title: levelData.title,
      description: `You are a ${levelData.title} with ${currentXP} experience points!`,
      requiredXP: currentLevelXP,
      nextLevelXP: nextLevelXP,
      icon: levelData.icon
    };
  }

  /**
   * Get progress to next level as percentage
   */
  getLevelProgress(progress: UserProgress): number {
    const currentLevel = progress.level;
    const currentXP = progress.experiencePoints;
    const currentLevelXP = this.getXPForLevel(currentLevel);
    const nextLevelXP = this.getXPForLevel(currentLevel + 1);
    
    const progressXP = currentXP - currentLevelXP;
    const requiredXP = nextLevelXP - currentLevelXP;
    
    return Math.min(100, (progressXP / requiredXP) * 100);
  }

  /**
   * Check for newly earned achievements
   */
  checkNewAchievements(progress: UserProgress): Achievement[] {
    const existingBadgeIds = new Set(progress.badges.map(b => b.id));
    
    return this.achievements.filter(achievement => 
      !existingBadgeIds.has(achievement.id) && 
      achievement.condition(progress)
    );
  }

  /**
   * Convert achievement to badge
   */
  achievementToBadge(achievement: Achievement): Badge {
    return {
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      rarity: achievement.rarity,
      unlockedAt: new Date().toISOString()
    };
  }

  /**
   * Get motivational message based on progress
   */
  getMotivationalMessage(progress: UserProgress): string {
    const messages = [
      "Keep up the spooky learning! 👻",
      "Your magical knowledge grows stronger! 🔮",
      "The spirits are impressed with your progress! ⚡",
      "You're becoming a true scholar of the supernatural! 📚",
      "Your dedication to learning is bewitching! 🧙‍♀️",
      "The Halloween spirits guide your studies! 🎃"
    ];

    // Choose message based on level and achievements
    if (progress.level >= 5) {
      return "You've mastered the arcane arts of learning! 🌟";
    } else if (progress.currentStreak >= 7) {
      return "Your learning streak is absolutely spellbinding! 🔥";
    } else if (progress.badges.length >= 5) {
      return "Your badge collection is growing magnificently! 🏆";
    }

    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Get streak bonus multiplier
   */
  getStreakBonus(streak: number): number {
    if (streak >= 30) return 2.0;
    if (streak >= 14) return 1.5;
    if (streak >= 7) return 1.3;
    if (streak >= 3) return 1.2;
    return 1.0;
  }

  /**
   * Calculate XP reward with bonuses
   */
  calculateXPReward(baseXP: number, progress: UserProgress, bonuses: {
    perfectScore?: boolean;
    fastCompletion?: boolean;
    streak?: boolean;
  } = {}): number {
    let totalXP = baseXP;

    // Perfect score bonus
    if (bonuses.perfectScore) {
      totalXP *= 1.5;
    }

    // Fast completion bonus
    if (bonuses.fastCompletion) {
      totalXP *= 1.2;
    }

    // Streak bonus
    if (bonuses.streak) {
      totalXP *= this.getStreakBonus(progress.currentStreak);
    }

    return Math.round(totalXP);
  }

  /**
   * Get character personality traits based on favorite
   */
  getCharacterTraits(character: string): {
    personality: string;
    learningStyle: string;
    encouragement: string;
  } {
    const traits = {
      ghost: {
        personality: "Friendly and mysterious",
        learningStyle: "Prefers gentle guidance and ethereal wisdom",
        encouragement: "Boo-tiful work! Keep floating through your studies! 👻"
      },
      vampire: {
        personality: "Wise and sophisticated",
        learningStyle: "Enjoys deep knowledge and centuries of wisdom",
        encouragement: "Excellent! Your thirst for knowledge is eternal! 🧛‍♂️"
      },
      witch: {
        personality: "Clever and magical",
        learningStyle: "Loves brewing knowledge and casting learning spells",
        encouragement: "Spellbinding progress! Your magical studies are brewing perfectly! 🧙‍♀️"
      },
      skeleton: {
        personality: "Scholarly and methodical",
        learningStyle: "Appreciates structured learning and bone-deep understanding",
        encouragement: "Bone-afide excellent work! Your studies have real backbone! 💀"
      },
      pumpkin: {
        personality: "Cheerful and festive",
        learningStyle: "Enjoys seasonal learning and harvest wisdom",
        encouragement: "Gourd-geous progress! You're the pick of the patch! 🎃"
      }
    };

    return traits[character as keyof typeof traits] || traits.ghost;
  }
}

export const gamificationService = new GamificationService();