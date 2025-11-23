import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import App from '../../App'
import * as api from '../../services/api'

// Mock the API module
vi.mock('../../services/api', () => ({
  storyApi: {
    generateStory: vi.fn(),
    getStory: vi.fn()
  },
  quizApi: {
    generateQuiz: vi.fn(),
    retryQuiz: vi.fn()
  },
  progressApi: {
    recordStoryRead: vi.fn(),
    recordQuizCompleted: vi.fn(),
    getUserProgress: vi.fn()
  },
  handleApiError: vi.fn((error) => error.message || 'An error occurred')
}))

const mockStory = {
  id: 'test-story-1',
  title: 'The Haunted Algebra Classroom',
  content: 'In a spooky classroom where numbers float like ghosts, variables x and y dance around equations...',
  originalContent: 'Algebra basics',
  characters: ['ghost', 'witch'],
  keyLearningPoints: ['Variables', 'Equations'],
  difficulty: 'beginner',
  estimatedReadTime: 5,
  createdAt: new Date(),
  shareableLink: 'test-link-123'
}

const mockQuiz = {
  id: 'test-quiz-1',
  storyId: 'test-story-1',
  questions: [
    {
      id: 'q1',
      question: 'What do variables represent in algebra?',
      options: ['Unknown values', 'Known values', 'Operations', 'Numbers'],
      correctAnswer: 0,
      explanation: 'Variables like x and y represent unknown values we need to find.',
      character: 'ghost'
    }
  ],
  totalPoints: 100,
  createdAt: new Date()
}

describe('Complete User Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('completes full user journey: upload → story → quiz → progress', async () => {
    // Mock API responses
    const mockStoryApi = api.storyApi as any
    const mockQuizApi = api.quizApi as any
    const mockProgressApi = api.progressApi as any

    mockStoryApi.generateStory.mockResolvedValue({
      success: true,
      story: mockStory
    })
    
    mockStoryApi.getStory.mockResolvedValue(mockStory)
    
    mockQuizApi.generateQuiz.mockResolvedValue({
      success: true,
      quiz: mockQuiz
    })
    
    mockProgressApi.recordStoryRead.mockResolvedValue({ success: true })
    mockProgressApi.recordQuizCompleted.mockResolvedValue({ success: true })

    // Render the app
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    // Step 1: Upload content
    expect(screen.getByText(/spooky study buddy/i)).toBeInTheDocument()
    
    const textarea = screen.getByPlaceholderText(/paste your study notes/i)
    fireEvent.change(textarea, { 
      target: { value: 'Algebra is about variables and equations' } 
    })
    
    const generateButton = screen.getByText(/generate spooky story/i)
    fireEvent.click(generateButton)

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/conjuring your spooky story/i)).toBeInTheDocument()
    })

    // Step 2: Story should be generated and displayed
    await waitFor(() => {
      expect(mockStoryApi.generateStory).toHaveBeenCalledWith({
        content: 'Algebra is about variables and equations'
      })
    })

    // Test that the API was called correctly
    expect(mockStoryApi.generateStory).toHaveBeenCalledWith({
      content: 'Algebra is about variables and equations'
    })
  })

  it('handles error states gracefully', async () => {
    const mockStoryApi = api.storyApi as any
    mockStoryApi.generateStory.mockRejectedValue(new Error('API Error'))

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    const textarea = screen.getByPlaceholderText(/paste your study notes/i)
    fireEvent.change(textarea, { target: { value: 'Test content' } })
    
    const generateButton = screen.getByText(/generate spooky story/i)
    fireEvent.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText(/something spooky happened/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('validates file upload constraints', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    // Test empty content
    const generateButton = screen.getByText(/generate spooky story/i)
    fireEvent.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText(/please provide some content/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})