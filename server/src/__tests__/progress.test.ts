import { describe, it, expect } from 'vitest'
import request from 'supertest'
import express from 'express'
import cors from 'cors'
import { progressRouter } from '../routes/progress'
import { errorHandler } from '../middleware/errorHandler'

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/progress', progressRouter)
app.use(errorHandler)

describe('Progress API', () => {
  const testUserId = 'test-user-123'

  describe('GET /api/progress/:userId', () => {
    it('returns user progress', async () => {
      const response = await request(app)
        .get(`/api/progress/${testUserId}`)
        .expect(200)

      expect(response.body.progress).toHaveProperty('userId', testUserId)
      expect(response.body.progress).toHaveProperty('level')
      expect(response.body.progress).toHaveProperty('experiencePoints')
      expect(response.body.progress).toHaveProperty('storiesRead')
      expect(response.body.progress).toHaveProperty('quizzesTaken')
      expect(response.body.progress).toHaveProperty('badges')
      expect(response.body.progress).toHaveProperty('currentStreak')
    })
  })

  describe('POST /api/progress/story-read', () => {
    it('records story read progress', async () => {
      const storyData = {
        id: 'test-story-1',
        title: 'Test Story',
        difficulty: 'beginner',
        estimatedReadTime: 5
      }

      const response = await request(app)
        .post('/api/progress/story-read')
        .send({
          userId: testUserId,
          story: storyData
        })
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('progress')
      expect(response.body.progress.storiesRead).toContainEqual(
        expect.objectContaining({ id: storyData.id })
      )
    })
  })

  describe('POST /api/progress/quiz-completed', () => {
    it('records quiz completion', async () => {
      const quizResult = {
        quizId: 'test-quiz-1',
        storyId: 'test-story-1',
        score: 85,
        totalQuestions: 5,
        correctAnswers: 4,
        timeSpent: 120,
        completedAt: new Date().toISOString()
      }

      const response = await request(app)
        .post('/api/progress/quiz-completed')
        .send({
          userId: testUserId,
          quizResult: quizResult
        })
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('progress')
      expect(response.body.progress.quizzesTaken).toContainEqual(
        expect.objectContaining({ quizId: quizResult.quizId })
      )
    })

    it('awards badges for achievements', async () => {
      const quizResult = {
        quizId: 'perfect-quiz',
        storyId: 'test-story-1',
        score: 100,
        totalQuestions: 5,
        correctAnswers: 5,
        timeSpent: 60,
        completedAt: new Date().toISOString()
      }

      const response = await request(app)
        .post('/api/progress/quiz-completed')
        .send({
          userId: testUserId,
          quizResult: quizResult
        })
        .expect(200)

      expect(response.body).toHaveProperty('newBadges')
      if (response.body.newBadges && response.body.newBadges.length > 0) {
        expect(response.body.newBadges[0]).toHaveProperty('name')
        expect(response.body.newBadges[0]).toHaveProperty('description')
      }
    })
  })
})