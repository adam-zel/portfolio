import '@testing-library/jest-dom/vitest'
import { createElement } from 'react'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

vi.mock('torph/react', () => ({
  TextMorph: ({
    children,
    ...props
  }: {
    children?: string
    disabled?: boolean
    as?: string
    className?: string
  }) =>
    createElement(
      'span',
      { 'data-testid': 'identity-subtitle-morph', ...props },
      children,
    ),
}))

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

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

afterEach(() => {
  cleanup()
})
