import { Quiz, QuizResult } from '../types.js';

interface ScoringOptions {
  timeBonus?: boolean;
  difficultyMultiplier?: boolean;
  streakBonus?: boolean;
}

interface DetailedFeedback {
  overallMessage: string;
  encouragement: string;
  improvements: string[];
  strengths: string[];
  nextSteps: string[];
}

export class ScoringService {
  /**
   * Calculate comprehensive quiz score with detailed feedback
   */
  calculateScore(
    quiz: Quiz,
    answers: Record<string, number>,
    timeSpent: number,
    options: ScoringOptions = {}
  ): QuizResult {
    const { timeBonus = true, difficultyMultiplier = true } = options;

    // Basic scoring
    let correctAnswers = 0;
    const questionFeedback: Array<{
      questionId: string;
      isCorrect: boolean;
      userAnswer: number;
      correctAnswer: number;
      explanation: string;
    }> = [];

    quiz.questions.forEach((question) => {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        correctAnswers++;
      }

      questionFeedback.push({
        questionId: question.id,
        isCorrect,
        userAnswer: userAnswer ?? -1,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation
      });
    });

    // Calculate base score
    let baseScore = Math.round((correctAnswers / quiz.questions.length) * 100);

    // Apply difficulty multiplier
    if (difficultyMultiplier) {
      const multipliers = { easy: 1.0, medium: 1.1, hard: 1.2 };
      baseScore = Math.round(baseScore * multipliers[quiz.difficulty]);
    }

    // Apply time bonus (if completed quickly with good accuracy)
    let finalScore = baseScore;
    if (timeBonus && baseScore >= 70) {
      const averageTimePerQuestion = timeSpent / quiz.questions.length;
      const expectedTime = this.getExpectedTimePerQuestion(quiz.difficulty);
      
      if (averageTimePerQuestion < expectedTime * 0.8) {
        finalScore = Math.min(100, Math.round(baseScore * 1.1)); // 10% bonus
      }
    }

    // Generate detailed feedback
    const detailedFeedback = this.generateDetailedFeedback(
      finalScore,
      correctAnswers,
      quiz.questions.length,
      timeSpent,
      quiz.difficulty,
      questionFeedback
    );

    // Determine badges
    const badges = this.determineBadges(
      finalScore,
      correctAnswers,
      quiz.questions.length,
      timeSpent,
      quiz.difficulty
    );

    return {
      quizId: quiz.id,
      score: finalScore,
      totalQuestions: quiz.questions.length,
      correctAnswers,
      timeSpent,
      feedback: detailedFeedback.overallMessage,
      badges,
      submittedAt: new Date().toISOString()
    };
  }

  /**
   * Generate detailed feedback based on performance
   */
  private generateDetailedFeedback(
    score: number,
    correct: number,
    total: number,
    timeSpent: number,
    difficulty: string,
    _questionFeedback: any[]
  ): DetailedFeedback {
    // const accuracy = (correct / total) * 100; // For future use
    const averageTime = timeSpent / total;

    // Overall performance message
    let overallMessage = '';
    let encouragement = '';
    const improvements: string[] = [];
    const strengths: string[] = [];
    const nextSteps: string[] = [];

    // Performance-based messages
    if (score >= 95) {
      overallMessage = `🎉 Absolutely phenomenal! You scored ${score}% (${correct}/${total} correct)! You've mastered this material with spook-tacular precision!`;
      encouragement = "You're a true Halloween scholar! Your knowledge shines brighter than a jack-o'-lantern! 🎃✨";
      strengths.push("Perfect or near-perfect accuracy");
      strengths.push("Excellent understanding of key concepts");
      nextSteps.push("Try a harder difficulty level to challenge yourself further");
      nextSteps.push("Share your knowledge by helping other students");
    } else if (score >= 85) {
      overallMessage = `👻 Excellent work! You scored ${score}% (${correct}/${total} correct)! The spirits are thoroughly impressed with your performance!`;
      encouragement = "You're well on your way to becoming a master of spooky studies! Keep up the fantastic work! 🧙‍♀️";
      strengths.push("Strong grasp of most concepts");
      strengths.push("Consistent performance across questions");
      if (score < 95) {
        improvements.push("Review the questions you missed for even better results");
      }
      nextSteps.push("Try the next difficulty level when you're ready");
    } else if (score >= 70) {
      overallMessage = `🎃 Good job! You scored ${score}% (${correct}/${total} correct)! You're getting the hang of this spooky learning adventure!`;
      encouragement = "You're making solid progress! Every ghost was once a beginner, and you're well on your way! 💀";
      strengths.push("Good understanding of basic concepts");
      improvements.push("Focus on the areas where you missed questions");
      improvements.push("Take your time to read questions carefully");
      nextSteps.push("Review the story content for better understanding");
      nextSteps.push("Try the quiz again to improve your score");
    } else if (score >= 50) {
      overallMessage = `🧙‍♀️ You're learning! You scored ${score}% (${correct}/${total} correct). Don't worry - even the wisest witches had to start somewhere!`;
      encouragement = "Keep practicing! Your spooky study journey is just beginning, and every attempt makes you stronger! 🌟";
      improvements.push("Spend more time reviewing the story content");
      improvements.push("Focus on understanding key concepts rather than memorizing");
      improvements.push("Take your time with each question");
      nextSteps.push("Re-read the story and try the quiz again");
      nextSteps.push("Break down complex concepts into smaller parts");
    } else {
      overallMessage = `💀 Keep trying! You scored ${score}% (${correct}/${total} correct). Remember, even skeletons need to study their bones! Don't give up!`;
      encouragement = "Every expert was once a beginner! This is just the start of your learning adventure! 🎭";
      improvements.push("Review the story content thoroughly before retaking");
      improvements.push("Focus on understanding rather than speed");
      improvements.push("Take notes while reading the story");
      nextSteps.push("Read the story again more carefully");
      nextSteps.push("Try an easier difficulty level first");
      nextSteps.push("Ask for help if you need it");
    }

    // Time-based feedback
    const expectedTime = this.getExpectedTimePerQuestion(difficulty);
    if (averageTime < expectedTime * 0.7) {
      strengths.push("Quick thinking and fast responses");
    } else if (averageTime > expectedTime * 1.5) {
      improvements.push("Try to work a bit faster while maintaining accuracy");
    }

    // Difficulty-based encouragement
    if (difficulty === 'hard' && score >= 60) {
      encouragement += " Tackling hard questions shows real courage! 🦇";
    } else if (difficulty === 'easy' && score >= 80) {
      nextSteps.push("You're ready to try medium difficulty!");
    }

    return {
      overallMessage,
      encouragement,
      improvements,
      strengths,
      nextSteps
    };
  }

  /**
   * Determine badges based on comprehensive performance metrics
   */
  private determineBadges(
    score: number,
    correct: number,
    total: number,
    timeSpent: number,
    difficulty: string
  ): string[] {
    const badges: string[] = [];
    const averageTimePerQuestion = timeSpent / total;
    const expectedTime = this.getExpectedTimePerQuestion(difficulty);

    // Perfect score badges
    if (score === 100) {
      badges.push('Perfect Score Phantom');
      if (difficulty === 'hard') {
        badges.push('Hard Mode Hero');
      }
    }

    // High performance badges
    if (score >= 95) {
      badges.push('Spooky Scholar Supreme');
    } else if (score >= 90) {
      badges.push('Spooky Scholar');
    } else if (score >= 85) {
      badges.push('Ghostly Graduate');
    } else if (score >= 80) {
      badges.push('Haunted Honor Roll');
    }

    // Speed badges
    if (averageTimePerQuestion < expectedTime * 0.6 && score >= 80) {
      badges.push('Lightning Learner');
    } else if (averageTimePerQuestion < expectedTime * 0.8 && score >= 70) {
      badges.push('Quick Thinker');
    }

    // Difficulty badges
    if (difficulty === 'hard' && score >= 70) {
      badges.push('Brave Soul');
    } else if (difficulty === 'medium' && score >= 85) {
      badges.push('Rising Star');
    }

    // Accuracy badges
    const accuracy = (correct / total) * 100;
    if (accuracy === 100) {
      badges.push('Precision Phantom');
    } else if (accuracy >= 90) {
      badges.push('Sharp Shooter');
    }

    // Participation badges
    badges.push('Quiz Conqueror');
    
    // First-time badges (would need to check user history in real implementation)
    if (badges.length === 1) { // Only has participation badge
      badges.push('First Steps');
    }

    // Improvement badges (would need previous scores in real implementation)
    // This is a placeholder for future implementation
    if (score >= 70) {
      badges.push('Knowledge Seeker');
    }

    return badges;
  }

  /**
   * Get expected time per question based on difficulty
   */
  private getExpectedTimePerQuestion(difficulty: string): number {
    const baseTimes = {
      easy: 45,    // 45 seconds per question
      medium: 60,  // 60 seconds per question
      hard: 90     // 90 seconds per question
    };
    return baseTimes[difficulty as keyof typeof baseTimes] || 60;
  }

  /**
   * Generate celebration message based on score
   */
  generateCelebrationMessage(score: number, badges: string[]): string {
    const celebrations = {
      perfect: [
        "🎉 PERFECT SCORE! You're absolutely spook-tacular!",
        "👻 FLAWLESS VICTORY! The spirits bow to your knowledge!",
        "🎃 PERFECT! You've achieved Halloween learning mastery!"
      ],
      excellent: [
        "🌟 EXCELLENT! You're a true spooky scholar!",
        "🧙‍♀️ OUTSTANDING! Your knowledge is magical!",
        "👻 SUPERB! The ghosts are cheering for you!"
      ],
      good: [
        "🎃 WELL DONE! You're making great progress!",
        "💀 GOOD JOB! You're getting the hang of this!",
        "🧙‍♀️ NICE WORK! Keep up the spooky studies!"
      ],
      okay: [
        "🌟 KEEP GOING! You're on the right track!",
        "👻 GOOD EFFORT! Practice makes perfect!",
        "🎭 NICE TRY! Every attempt makes you stronger!"
      ],
      needsWork: [
        "💪 DON'T GIVE UP! You're learning and growing!",
        "🌟 KEEP TRYING! Every expert was once a beginner!",
        "🎃 STAY STRONG! Your next attempt will be better!"
      ]
    };

    let category: keyof typeof celebrations;
    if (score === 100) category = 'perfect';
    else if (score >= 85) category = 'excellent';
    else if (score >= 70) category = 'good';
    else if (score >= 50) category = 'okay';
    else category = 'needsWork';

    const messages = celebrations[category];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    // Add badge celebration if any special badges earned
    const specialBadges = badges.filter(badge => 
      !['Quiz Conqueror', 'First Steps', 'Knowledge Seeker'].includes(badge)
    );

    if (specialBadges.length > 0) {
      return `${randomMessage} You've earned ${specialBadges.length} special badge${specialBadges.length > 1 ? 's' : ''}! 🏆`;
    }

    return randomMessage;
  }

  /**
   * Generate retry suggestions based on performance
   */
  generateRetrySuggestions(score: number, difficulty: string): string[] {
    const suggestions: string[] = [];

    if (score < 70) {
      suggestions.push("📖 Review the story content more carefully");
      suggestions.push("📝 Take notes while reading to remember key points");
      suggestions.push("🐌 Take your time - there's no rush to answer");
    }

    if (score < 50) {
      suggestions.push("📚 Try reading the story multiple times");
      suggestions.push("🎯 Focus on understanding main concepts first");
      if (difficulty !== 'easy') {
        suggestions.push("⬇️ Consider trying an easier difficulty level");
      }
    }

    if (score >= 70 && score < 90) {
      suggestions.push("🔍 Pay closer attention to question details");
      suggestions.push("💭 Think through each answer choice carefully");
      suggestions.push("📊 Review the explanations for missed questions");
    }

    if (score >= 90 && difficulty !== 'hard') {
      suggestions.push("⬆️ Try a harder difficulty for more challenge");
      suggestions.push("🎯 Aim for that perfect 100% score");
    }

    return suggestions;
  }
}

export const scoringService = new ScoringService();