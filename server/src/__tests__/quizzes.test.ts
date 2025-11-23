import { describe, it, expect } from 'vitest'
import request from 'supertest'
import express from 'express'
import cors from 'cors'
import { quizzesRouter } from '../routes/quizzes'
import { storiesRouter } from '../routes/stories'
import { errorHandler } from '../middleware/errorHandler'

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/stories', storiesRouter)
app.use('/api/quizzes', quizzesRouter)
app.use(errorHandler)

describe('Quizzes API', () => {
  let testStoryId: string

  beforeAll(async () => {
    // Create a test story first
    const storyResponse = await request(app)
      .post('/api/stories/generate')
      .send({
        content: 'Mathematics is the study of numbers, shapes, and patterns. Algebra uses variables like x and y to represent unknown values.'
      })
    
    testStoryId = storyResponse.body.story.id
  })

  describe('POST /api/quizzes/generate', () => {
    it('generates quiz from story', async () => {
      const response = await request(app)
        .post('/api/quizzes/generate')
        .send({
          storyId: testStoryId,
          difficulty: 'medium'
        })
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('quiz')
      expect(response.body.quiz).toHaveProperty('id')
      expect(response.body.quiz).toHaveProperty('questions')
      expect(response.body.quiz.questions).toBeInstanceOf(Array)
      expect(response.body.quiz.questions.length).toBeGreaterThan(0)
      
      // Check question structure
      const question = response.body.quiz.questions[0]
      expect(question).toHaveProperty('question')
      expect(question).toHaveProperty('options')
      expect(question).toHaveProperty('correctAnswer')
      expect(question).toHaveProperty('explanation')
      expect(question.options).toHaveLength(4)
    })

    it('validates story ID', async () => {
      const response = await request(app)
        .post('/api/quizzes/generate')
        .send({
          difficulty: 'medium'
        })
        .expect(400)

      expect(response.body).toHaveProperty('error', true)
      expect(response.body.message).toContain('Story ID required')
    })

    it('handles invalid story ID', async () => {
      const response = await request(app)
        .post('/api/quizzes/generate')
        .send({
          storyId: 'non-existent-story',
          difficulty: 'medium'
        })
        .expect(404)

      expect(response.body).toHaveProperty('error', true)
      expect(response.body.message).toContain('vanished into thin air')
    })
  })

  describe('POST /api/quizzes/retry', () => {
    it('generates new quiz for retry', async () => {
      const response = await request(app)
        .post('/api/quizzes/retry')
        .send({
          storyId: testStoryId,
          difficulty: 'easy'
        })
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('quiz')
      expect(response.body.quiz.questions).toBeInstanceOf(Array)
    })
  })
})