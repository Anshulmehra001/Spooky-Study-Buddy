import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { FileUpload } from '../upload/FileUpload'

describe('FileUpload Component', () => {
  const mockOnFileUpload = vi.fn()

  beforeEach(() => {
    mockOnFileUpload.mockClear()
  })

  it('renders upload interface', () => {
    render(<FileUpload onFileUpload={mockOnFileUpload} />)
    
    expect(screen.getByText(/drag.*drop/i)).toBeInTheDocument()
    expect(screen.getByText(/click to browse/i)).toBeInTheDocument()
  })

  it('handles text input', async () => {
    render(<FileUpload onFileUpload={mockOnFileUpload} />)
    
    const textarea = screen.getByPlaceholderText(/paste your study notes/i)
    fireEvent.change(textarea, { target: { value: 'Test study content' } })
    
    const uploadButton = screen.getByText(/generate spooky story/i)
    fireEvent.click(uploadButton)
    
    await waitFor(() => {
      expect(mockOnFileUpload).toHaveBeenCalledWith('Test study content', 'pasted-text.txt')
    })
  })

  it('validates file types', async () => {
    render(<FileUpload onFileUpload={mockOnFileUpload} />)
    
    const file = new File(['content'], 'test.exe', { type: 'application/exe' })
    const input = screen.getByLabelText(/choose file/i)
    
    fireEvent.change(input, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(screen.getByText(/unsupported file type/i)).toBeInTheDocument()
    })
  })

  it('handles file size limits', async () => {
    render(<FileUpload onFileUpload={mockOnFileUpload} />)
    
    // Create a large file (over 10MB)
    const largeContent = 'x'.repeat(11 * 1024 * 1024)
    const file = new File([largeContent], 'large.txt', { type: 'text/plain' })
    const input = screen.getByLabelText(/choose file/i)
    
    fireEvent.change(input, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(screen.getByText(/file too large/i)).toBeInTheDocument()
    })
  })
})