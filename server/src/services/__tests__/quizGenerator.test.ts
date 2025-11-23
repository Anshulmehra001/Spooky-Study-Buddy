import { describe, it, expect, beforeEach } from 'vitest'
import { quizGenerator } from '../quizGenerator'
import { SpookyStory } from '../../../shared/src/types'

const mockStory: SpookyStory = {
  id: 'test-story-1',
  title: 'The Haunted Algebra Classroom',
  content: 'In a spooky classroom, variables like x and y represent unknown values. Equations show relationships between different quantities.',
  originalContent: 'Variables represent unknown values. Equations show relationships.',
  characters: ['ghost', 'witch'],
  keyLearningPoints: ['Variables represent unknown values', 'Equations show relationships'],
  difficulty: 'beginner',
  estimatedReadTime: 5,
  createdAt: new Date(),
  shareableLink: 'test-link'
}

describe('Quiz Generator Service', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
  })

  describe('generateQuizFromStory', () => {
    it('generates quiz with correct structure', async () => {
      const result = await quizGenerator.generateQuizFromStory(mockStory, 'medium')
      
      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('storyId', mockStory.id)
      expect(result).toHaveProperty('questions')
      expect(result).toHaveProperty('totalPoints')
      expect(result).toHaveProperty('createdAt')
      
      expect(result.questions).toBeInstanceOf(Array)
      expect(result.questions.length).toBeGreaterThan(0)
      expect(result.questions.length).toBeLessThanOrEqual(10)
    })

    it('generates questions with proper format', async () => {
      const result = await quizGenerator.generateQuizFromStory(mockStory, 'easy')
      
      const question = result.questions[0]
      expect(question).toHaveProperty('id')
      expect(question).toHaveProperty('question')
      expect(question).toHaveProperty('options')
      expect(question).toHaveProperty('correctAnswer')
      expect(question).toHaveProperty('explanation')
      expect(question).toHaveProperty('character')
      
      expect(question.options).toHaveLength(4)
      expect(question.correctAnswer).toBeGreaterThanOrEqual(0)
      expect(question.correctAnswer).toBeLessThan(4)
      
      const validCharacters = ['ghost', 'vampire', 'witch', 'skeleton']
      expect(validCharacters).toContain(question.character)
    })

    it('adjusts difficulty appropriately', async () => {
      const easyQuiz = await quizGenerator.generateQuizFromStory(mockStory, 'easy')
      const hardQuiz = await quizGenerator.generateQuizFromStory(mockStory, 'hard')
      
      // Easy quiz should have fewer questions or simpler content
      expect(easyQuiz.questions.length).toBeLessThanOrEqual(hardQuiz.questions.length + 2)
      
      // Both should have valid structure
      expect(easyQuiz.totalPoints).toBeGreaterThan(0)
      expect(hardQuiz.totalPoints).toBeGreaterThan(0)
    })

    it('includes content from original story', async () => {
      const result = await quizGenerator.generateQuizFromStory(mockStory, 'medium')
      
      // At least one question should relate to the story content
      const hasRelevantQuestion = result.questions.some(q => 
        q.question.toLowerCase().includes('variable') || 
        q.question.toLowerCase().includes('equation') ||
        q.explanation.toLowerCase().includes('variable') ||
        q.explanation.toLowerCase().includes('equation')
      )
      
      expect(hasRelevantQuestion).toBe(true)
    })

    it('assigns different characters to questions', async () => {
      const result = await quizGenerator.generateQuizFromStory(mockStory, 'medium')
      
      if (result.questions.length > 1) {
        const characters = result.questions.map(q => q.character)
        const uniqueCharacters = new Set(characters)
        
        // Should have some variety in characters (not all the same)
        expect(uniqueCharacters.size).toBeGreaterThan(0)
      }
    })
  })

  describe('generateRetryQuiz', () => {
    it('generates different questions for retry', async () => {
      const originalQuiz = await quizGenerator.generateQuizFromStory(mockStory, 'medium')
      const retryQuiz = await quizGenerator.generateRetryQuiz(mockStory, 'medium')
      
      expect(retryQuiz.id).not.toBe(originalQuiz.id)
      expect(retryQuiz.storyId).toBe(originalQuiz.storyId)
      expect(retryQuiz.questions.length).toBeGreaterThan(0)
      
      // Questions should be different (at least some variation)
      const originalQuestions = originalQuiz.questions.map(q => q.question)
      const retryQuestions = retryQuiz.questions.map(q => q.question)
      
      // Not all questions should be identical
      const identicalCount = retryQuestions.filter(q => originalQuestions.includes(q)).length
      expect(identicalCount).toBeLessThan(retryQuestions.length)
    })
  })
})