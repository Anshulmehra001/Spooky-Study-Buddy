import OpenAI from 'openai';
import { Quiz, QuizQuestion, HalloweenCharacterType } from '../types.js';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

interface QuizGenerationOptions {
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount?: number;
}

const HALLOWEEN_CHARACTERS: HalloweenCharacterType[] = ['ghost', 'vampire', 'witch', 'skeleton'];

// Character personalities for future use
// const CHARACTER_PERSONALITIES = {
//   ghost: {
//     name: 'Friendly Ghost',
//     personality: 'Helpful and encouraging, loves to float around and guide students',
//     catchphrase: 'Boo-tiful learning ahead!'
//   },
//   vampire: {
//     name: 'Count Knowledge',
//     personality: 'Sophisticated and dramatic, speaks with authority about learning',
//     catchphrase: 'I vant to help you learn!'
//   },
//   witch: {
//     name: 'Professor Mystique',
//     personality: 'Wise and magical, brews knowledge potions and casts learning spells',
//     catchphrase: 'Let me brew some wisdom for you!'
//   },
//   skeleton: {
//     name: 'Bones McGraw',
//     personality: 'Laid-back and funny, makes learning fun with bone-related puns',
//     catchphrase: 'I find this humerus!'
//   }
// };

export class QuizGeneratorService {
  /**
   * Generate a quiz from story content using AI
   */
  async generateQuiz(
    storyContent: string,
    storyId: string,
    options: QuizGenerationOptions
  ): Promise<Quiz> {
    try {
      const { difficulty, questionCount = this.getQuestionCount(difficulty) } = options;

      // Check if OpenAI is available
      if (!openai) {
        console.log('OpenAI API key not available, using fallback quiz generation');
        return this.generateFallbackQuiz(storyContent, storyId, options);
      }

      // Create the AI prompt for quiz generation
      const prompt = this.createQuizPrompt(storyContent, difficulty, questionCount);

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a Halloween-themed educational quiz generator. Create engaging multiple-choice questions that test comprehension of the provided story content. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI service');
      }

      // Parse the AI response
      const aiQuestions = this.parseAIResponse(response);
      
      // Process and enhance questions with Halloween characters
      const questions = this.enhanceQuestionsWithCharacters(aiQuestions, questionCount);

      // Create the quiz object
      const quiz: Quiz = {
        id: `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        storyId,
        questions,
        totalPoints: questions.length * 10,
        difficulty,
        timeLimit: this.calculateTimeLimit(questions.length, difficulty),
        createdAt: new Date().toISOString()
      };

      return quiz;

    } catch (error) {
      console.error('Quiz generation error:', error);
      
      // Fallback to template-based quiz generation
      return this.generateFallbackQuiz(storyContent, storyId, options);
    }
  }

  /**
   * Create AI prompt for quiz generation
   */
  private createQuizPrompt(storyContent: string, difficulty: string, questionCount: number): string {
    const difficultyInstructions = {
      easy: 'Focus on basic comprehension and main concepts. Use simple language.',
      medium: 'Include some analysis and application questions. Mix recall and understanding.',
      hard: 'Include complex analysis, synthesis, and evaluation questions. Challenge critical thinking.'
    };

    return `
Generate ${questionCount} multiple-choice questions based on this educational story content:

${storyContent}

Requirements:
- Difficulty level: ${difficulty} (${difficultyInstructions[difficulty as keyof typeof difficultyInstructions]})
- Each question should have 4 options (A, B, C, D)
- Include detailed explanations for correct answers
- Focus on educational content, not Halloween elements
- Questions should test understanding of key concepts

Respond with ONLY a JSON array in this exact format:
[
  {
    "question": "What is the main concept explained in the story?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Detailed explanation of why this answer is correct and what concept it relates to."
  }
]
`;
  }

  /**
   * Parse AI response and validate structure
   */
  private parseAIResponse(response: string): any[] {
    try {
      // Clean up the response - remove any markdown formatting
      const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(cleanResponse);
      
      if (!Array.isArray(parsed)) {
        throw new Error('Response is not an array');
      }

      // Validate each question has required fields
      parsed.forEach((q, index) => {
        if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || 
            typeof q.correctAnswer !== 'number' || !q.explanation) {
          throw new Error(`Invalid question structure at index ${index}`);
        }
      });

      return parsed;
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw new Error('Invalid AI response format');
    }
  }

  /**
   * Enhance questions with Halloween characters and IDs
   */
  private enhanceQuestionsWithCharacters(aiQuestions: any[], targetCount: number): QuizQuestion[] {
    const questions: QuizQuestion[] = [];
    
    // Take only the number of questions we need
    const questionsToUse = aiQuestions.slice(0, targetCount);
    
    questionsToUse.forEach((q, index) => {
      const character = HALLOWEEN_CHARACTERS[index % HALLOWEEN_CHARACTERS.length];
      
      questions.push({
        id: `q${index + 1}-${Date.now()}`,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        character
      });
    });

    return questions;
  }

  /**
   * Generate fallback quiz when AI fails
   */
  private generateFallbackQuiz(
    storyContent: string,
    storyId: string,
    options: QuizGenerationOptions
  ): Quiz {
    const { difficulty, questionCount = 5 } = options;
    
    // Extract educational content from the story (remove Halloween narrative)
    const contentMatch = storyContent.match(/📚.*?📚\n\n([\s\S]*?)\n\n✨/);
    const educationalContent = contentMatch ? contentMatch[1] : storyContent;
    
    // Extract key sentences for question generation
    const sentences = educationalContent
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 30 && s.length < 200);
    
    const questions: QuizQuestion[] = [];
    const usedSentences = new Set<number>();
    
    // Generate content-based questions
    for (let i = 0; i < Math.min(questionCount, sentences.length); i++) {
      let sentenceIndex;
      do {
        sentenceIndex = Math.floor(Math.random() * sentences.length);
      } while (usedSentences.has(sentenceIndex) && usedSentences.size < sentences.length);
      
      usedSentences.add(sentenceIndex);
      const sentence = sentences[sentenceIndex];
      
      // Extract key terms from the sentence
      const words = sentence.split(' ').filter(w => w.length > 4);
      const keyTerm = words[Math.floor(Math.random() * Math.min(3, words.length))];
      
      // Create a fill-in-the-blank style question
      const questionText = sentence.replace(keyTerm, '______');
      
      // Generate plausible wrong answers
      const wrongAnswers = this.generateWrongAnswers(keyTerm, words);
      const allOptions = [keyTerm, ...wrongAnswers].slice(0, 4);
      
      // Shuffle options
      const shuffled = allOptions.sort(() => Math.random() - 0.5);
      const correctIndex = shuffled.indexOf(keyTerm);
      
      questions.push({
        id: `q${i + 1}-${Date.now()}`,
        question: `Complete the statement: "${questionText}"`,
        options: shuffled,
        correctAnswer: correctIndex,
        explanation: `The correct answer is "${keyTerm}". This comes directly from your study material: "${sentence}"`,
        character: HALLOWEEN_CHARACTERS[i % HALLOWEEN_CHARACTERS.length].type
      });
    }
    
    // Add a comprehension question
    if (questions.length < questionCount) {
      questions.push({
        id: `comprehension-${Date.now()}`,
        question: 'What was the main topic covered in this lesson?',
        options: [
          'Halloween traditions and customs',
          'The educational content from your study material',
          'Ghost stories and folklore',
          'Spooky character biographies'
        ],
        correctAnswer: 1,
        explanation: 'The story was designed to help you learn your study material by wrapping it in an engaging Halloween theme!',
        character: 'ghost'
      });
    }

    return {
      id: `quiz-${Date.now()}`,
      storyId,
      questions: questions.slice(0, questionCount),
      totalPoints: Math.min(questionCount, questions.length) * 10,
      difficulty,
      timeLimit: this.calculateTimeLimit(questionCount, difficulty),
      createdAt: new Date().toISOString()
    };
  }
  
  /**
   * Generate plausible wrong answers for multiple choice
   */
  private generateWrongAnswers(correctAnswer: string, contextWords: string[]): string[] {
    const wrongAnswers: string[] = [];
    
    // Try to use words from the same context
    const candidates = contextWords.filter(w => 
      w !== correctAnswer && 
      w.length > 3 &&
      !w.match(/^(the|and|or|but|in|on|at|to|for|of|with|from)$/i)
    );
    
    // Add some context words as wrong answers
    wrongAnswers.push(...candidates.slice(0, 2));
    
    // Add generic wrong answers if needed
    const genericWrong = [
      'Halloween',
      'Spooky',
      'Mystery',
      'Magic',
      'Phantom',
      'Shadow',
      'Midnight',
      'Enchanted'
    ];
    
    while (wrongAnswers.length < 3) {
      const random = genericWrong[Math.floor(Math.random() * genericWrong.length)];
      if (!wrongAnswers.includes(random) && random !== correctAnswer) {
        wrongAnswers.push(random);
      }
    }
    
    return wrongAnswers.slice(0, 3);
  }

  /**
   * Get default question count based on difficulty
   */
  private getQuestionCount(difficulty: string): number {
    switch (difficulty) {
      case 'easy': return 3;
      case 'medium': return 5;
      case 'hard': return 7;
      default: return 5;
    }
  }

  /**
   * Calculate time limit based on questions and difficulty
   */
  private calculateTimeLimit(questionCount: number, difficulty: string): number {
    const baseTimePerQuestion = {
      easy: 60,    // 1 minute per question
      medium: 90,  // 1.5 minutes per question
      hard: 120    // 2 minutes per question
    };

    const timePerQuestion = baseTimePerQuestion[difficulty as keyof typeof baseTimePerQuestion] || 90;
    return questionCount * timePerQuestion; // Return time in seconds
  }
}

export const quizGenerator = new QuizGeneratorService();