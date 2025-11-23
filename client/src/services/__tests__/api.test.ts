import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { storyApi, quizApi, progressApi, handleApiError } from '../api'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('storyApi', () => {
    it('generates story successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          story: {
            id: 'test-story-1',
            title: 'Test Story',
            content: 'Spooky content...'
          }
        }
      }

      mockedAxios.post.mockResolvedValue(mockResponse)

      const result = await storyApi.generateStory({ content: 'Test content' })

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/stories/generate', {
        content: 'Test content'
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('retrieves story by ID', async () => {
      const mockStory = {
        id: 'test-story-1',
        title: 'Test Story',
        content: 'Spooky content...'
      }

      mockedAxios.get.mockResolvedValue({ data: mockStory })

      const result = await storyApi.getStory('test-story-1')

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/stories/test-story-1')
      expect(result).toEqual(mockStory)
    })
  })

  describe('quizApi', () => {
    it('generates quiz from story', async () => {
      const mockResponse = {
        data: {
          success: true,
          quiz: {
            id: 'test-quiz-1',
            questions: [
              {
                question: 'Test question?',
                options: ['A', 'B', 'C', 'D'],
                correctAnswer: 0
              }
            ]
          }
        }
      }

      mockedAxios.post.mockResolvedValue(mockResponse)

      const result = await quizApi.generateQuiz('story-1', 'medium')

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/quizzes/generate', {
        storyId: 'story-1',
        difficulty: 'medium'
      })
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('progressApi', () => {
    it('records story read progress', async () => {
      const mockStory = {
        id: 'story-1',
        title: 'Test Story'
      }

      const mockResponse = {
        data: {
          success: true,
          progress: { storiesRead: [mockStory] }
        }
      }

      mockedAxios.post.mockResolvedValue(mockResponse)

      const result = await progressApi.recordStoryRead(mockStory)

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/progress/story-read', {
        userId: 'default',
        story: mockStory
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('records quiz completion', async () => {
      const mockQuizResult = {
        quizId: 'quiz-1',
        score: 85,
        totalQuestions: 5
      }

      const mockResponse = {
        data: {
          success: true,
          progress: { quizzesTaken: [mockQuizResult] }
        }
      }

      mockedAxios.post.mockResolvedValue(mockResponse)

      const result = await progressApi.recordQuizCompleted(mockQuizResult)

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/progress/quiz-completed', {
        userId: 'default',
        quizResult: mockQuizResult
      })
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('handleApiError', () => {
    it('handles axios error with response', () => {
      const error = {
        response: {
          data: {
            message: 'API Error'
          }
        }
      }

      const result = handleApiError(error)
      expect(result).toBe('API Error')
    })

    it('handles axios error without response', () => {
      const error = {
        message: 'Network Error'
      }

      const result = handleApiError(error)
      expect(result).toBe('Network Error')
    })

    it('handles unknown error', () => {
      const error = 'Unknown error'

      const result = handleApiError(error)
      expect(result).toBe('An unexpected error occurred')
    })
  })
})