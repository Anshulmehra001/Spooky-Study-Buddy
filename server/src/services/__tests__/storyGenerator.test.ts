import { describe, it, expect, beforeEach } from 'vitest'
import { storyGenerator } from '../storyGenerator'

describe('Story Generator Service', () => {
  beforeEach(() => {
    // Set test environment
    process.env.NODE_ENV = 'test'
  })

  describe('generateSpookyStory', () => {
    it('generates story with fallback when no API key', async () => {
      const content = 'Algebra is about variables and equations'
      
      const result = await storyGenerator.generateSpookyStory(content)
      
      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('title')
      expect(result).toHaveProperty('content')
      expect(result).toHaveProperty('characters')
      expect(result).toHaveProperty('keyLearningPoints')
      expect(result.title).toContain('Spooky')
      expect(result.content).toContain('spooky')
      expect(result.characters).toBeInstanceOf(Array)
      expect(result.keyLearningPoints).toBeInstanceOf(Array)
    })

    it('handles empty content gracefully', async () => {
      const content = ''
      
      const result = await storyGenerator.generateSpookyStory(content)
      
      expect(result).toHaveProperty('title')
      expect(result).toHaveProperty('content')
      expect(result.title).toBeTruthy()
      expect(result.content).toBeTruthy()
    })

    it('generates appropriate difficulty level', async () => {
      const content = 'Basic addition: 2 + 2 = 4'
      
      const result = await storyGenerator.generateSpookyStory(content)
      
      expect(result.difficulty).toMatch(/beginner|intermediate|advanced/)
    })

    it('includes Halloween characters', async () => {
      const content = 'Mathematics is fun'
      
      const result = await storyGenerator.generateSpookyStory(content)
      
      expect(result.characters.length).toBeGreaterThan(0)
      const validCharacters = ['ghost', 'vampire', 'witch', 'skeleton', 'pumpkin']
      result.characters.forEach(character => {
        expect(validCharacters).toContain(character)
      })
    })

    it('estimates read time correctly', async () => {
      const content = 'Short content'
      
      const result = await storyGenerator.generateSpookyStory(content)
      
      expect(result.estimatedReadTime).toBeGreaterThan(0)
      expect(typeof result.estimatedReadTime).toBe('number')
    })
  })

  describe('extractKeyLearningPoints', () => {
    it('extracts learning points from educational content', () => {
      const content = 'Variables in algebra represent unknown values. Equations show relationships between quantities.'
      
      const points = storyGenerator.extractKeyLearningPoints(content)
      
      expect(points).toBeInstanceOf(Array)
      expect(points.length).toBeGreaterThan(0)
      expect(points.some(point => point.toLowerCase().includes('variable'))).toBe(true)
    })

    it('handles content without clear learning points', () => {
      const content = 'This is just random text without educational value.'
      
      const points = storyGenerator.extractKeyLearningPoints(content)
      
      expect(points).toBeInstanceOf(Array)
      // Should still return some points, even if generic
      expect(points.length).toBeGreaterThan(0)
    })
  })
})