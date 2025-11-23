import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import express from 'express'
import cors from 'cors'
import { storiesRouter } from '../routes/stories'
import { errorHandler } from '../middleware/errorHandler'

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/stories', storiesRouter)
app.use(errorHandler)

describe('Stories API', () => {
  describe('POST /api/stories/generate', () => {
    it('generates story from content', async () => {
      const response = await request(app)
        .post('/api/stories/generate')
        .send({
          content: 'Algebra is the branch of mathematics that uses variables to represent unknown quantities.'
        })
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('story')
      expect(response.body.story).toHaveProperty('id')
      expect(response.body.story).toHaveProperty('title')
      expect(response.body.story).toHaveProperty('content')
      expect(response.body.story.content).toContain('spooky')
    })

    it('validates required content', async () => {
      const response = await request(app)
        .post('/api/stories/generate')
        .send({})
        .expect(400)

      expect(response.body).toHaveProperty('error', true)
      expect(response.body.message).toContain('No content provided')
    })

    it('handles content length limits', async () => {
      const longContent = 'x'.repeat(10001) // Over 10k characters
      
      const response = await request(app)
        .post('/api/stories/generate')
        .send({ content: longContent })
        .expect(400)

      expect(response.body).toHaveProperty('error', true)
      expect(response.body.message).toContain('too long')
    })
  })

  describe('GET /api/stories/:id', () => {
    it('retrieves existing story', async () => {
      // First create a story
      const createResponse = await request(app)
        .post('/api/stories/generate')
        .send({
          content: 'Test content for retrieval'
        })

      const storyId = createResponse.body.story.id

      // Then retrieve it
      const response = await request(app)
        .get(`/api/stories/${storyId}`)
        .expect(200)

      expect(response.body.story).toHaveProperty('id', storyId)
      expect(response.body.story).toHaveProperty('title')
      expect(response.body.story).toHaveProperty('content')
    })

    it('returns 404 for non-existent story', async () => {
      const response = await request(app)
        .get('/api/stories/non-existent-id')
        .expect(404)

      expect(response.body).toHaveProperty('error', true)
      expect(response.body.message).toContain('vanished into thin air')
    })
  })
})