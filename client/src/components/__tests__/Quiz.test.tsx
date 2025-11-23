import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Quiz } from '../quiz/Quiz'
import { Quiz as QuizType } from '../../../../shared/src/types'

const mockQuiz: QuizType = {
  id: 'test-quiz-1',
  storyId: 'test-story-1',
  questions: [
    {
      id: 'q1',
      question: 'What represents unknown values in algebra?',
      options: ['Variables', 'Constants', 'Operators', 'Functions'],
      correctAnswer: 0,
      explanation: 'Variables like x and y represent unknown values that we solve for.',
      character: 'ghost'
    },
    {
      id: 'q2',
      question: 'What shows relationships between quantities?',
      options: ['Variables', 'Numbers', 'Equations', 'Letters'],
      correctAnswer: 2,
      explanation: 'Equations show how different quantities relate to each other.',
      character: 'witch'
    }
  ],
  totalPoints: 100,
  createdAt: new Date('2023-10-31')
}

describe('Quiz Component', () => {
  const mockOnComplete = vi.fn()
  const mockOnRetry = vi.fn()

  beforeEach(() => {
    mockOnComplete.mockClear()
    mockOnRetry.mockClear()
  })

  it('renders quiz questions', () => {
    render(<Quiz quiz={mockQuiz} onComplete={mockOnComplete} onRetry={mockOnRetry} />)
    
    expect(screen.getByText(/what represents unknown values/i)).toBeInTheDocument()
    expect(screen.getByText('Variables')).toBeInTheDocument()
    expect(screen.getByText('Constants')).toBeInTheDocument()
  })

  it('handles answer selection', async () => {
    render(<Quiz quiz={mockQuiz} onComplete={mockOnComplete} onRetry={mockOnRetry} />)
    
    const variablesOption = screen.getByText('Variables')
    fireEvent.click(variablesOption)
    
    const nextButton = screen.getByText(/next question/i)
    fireEvent.click(nextButton)
    
    await waitFor(() => {
      expect(screen.getByText(/what shows relationships/i)).toBeInTheDocument()
    })
  })

  it('shows progress indicator', () => {
    render(<Quiz quiz={mockQuiz} onComplete={mockOnComplete} onRetry={mockOnRetry} />)
    
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
  })

  it('completes quiz and calls onComplete', async () => {
    render(<Quiz quiz={mockQuiz} onComplete={mockOnComplete} onRetry={mockOnRetry} />)
    
    // Answer first question correctly
    fireEvent.click(screen.getByText('Variables'))
    fireEvent.click(screen.getByText(/next question/i))
    
    // Answer second question correctly
    await waitFor(() => {
      fireEvent.click(screen.getByText('Equations'))
    })
    
    fireEvent.click(screen.getByText(/finish quiz/i))
    
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          score: 100,
          totalQuestions: 2,
          correctAnswers: 2
        })
      )
    })
  })
})