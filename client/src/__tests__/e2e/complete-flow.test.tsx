import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '../../App'

// Simple end-to-end test that validates the basic app structure
describe('Complete Application Flow', () => {
  it('renders the main application without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    // Check that the main title is present
    expect(screen.getByText(/spooky study buddy/i)).toBeInTheDocument()
  })

  it('shows file upload interface on home page', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    // Check for upload interface elements
    expect(screen.getByText(/drag.*drop/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/paste your study notes/i)).toBeInTheDocument()
  })

  it('validates empty content submission', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    // Try to submit without content
    const generateButton = screen.getByText(/generate spooky story/i)
    fireEvent.click(generateButton)

    // Should show validation message
    await waitFor(() => {
      expect(screen.getByText(/please provide some content/i)).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('shows loading state when generating story', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    // Add some content
    const textarea = screen.getByPlaceholderText(/paste your study notes/i)
    fireEvent.change(textarea, { 
      target: { value: 'Test content for story generation' } 
    })

    // Submit the form
    const generateButton = screen.getByText(/generate spooky story/i)
    fireEvent.click(generateButton)

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/conjuring your spooky story/i)).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('displays feature overview cards', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    // Check for feature cards
    expect(screen.getByText(/upload content/i)).toBeInTheDocument()
    expect(screen.getByText(/get spooky story/i)).toBeInTheDocument()
    expect(screen.getByText(/take quiz/i)).toBeInTheDocument()
  })

  it('has proper navigation structure', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    // Check for navigation elements
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(document.querySelector('nav')).toBeInTheDocument()
  })

  it('includes Halloween-themed background elements', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    // Check for Halloween emojis in the background
    expect(screen.getByText('👻')).toBeInTheDocument()
    expect(screen.getByText('🎃')).toBeInTheDocument()
  })
})