import { beforeAll, afterAll, afterEach } from 'vitest'

// Setup test environment
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test'
  process.env.OPENAI_API_KEY = 'test-key'
})

afterAll(() => {
  // Cleanup after all tests
})

afterEach(() => {
  // Cleanup after each test
})