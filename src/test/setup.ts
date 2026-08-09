import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

class MockIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn(() => [])
  constructor(_callback: IntersectionObserverCallback) {}
}

vi.stubGlobal(
  'IntersectionObserver',
  MockIntersectionObserver as unknown as typeof IntersectionObserver,
)

afterEach(() => {
  cleanup()
})
