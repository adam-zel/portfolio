import '@testing-library/jest-dom/vitest'
import {
  createElement,
  useEffect,
  useState,
  type ComponentPropsWithoutRef,
} from 'react'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

vi.mock('@/components/animata/text/mask-reveal-up', () => ({
  default: ({
    text,
    holdMs = 3000,
    ...props
  }: {
    text?: string | string[]
    holdMs?: number
    className?: string
    titleClassName?: string
  } & ComponentPropsWithoutRef<'span'>) => {
    const samples = Array.isArray(text) ? text : text != null ? [text] : ['']
    const [index, setIndex] = useState(0)

    useEffect(() => {
      if (samples.length <= 1) return
      const id = window.setInterval(() => {
        setIndex((current) => (current + 1) % samples.length)
      }, holdMs)
      return () => window.clearInterval(id)
    }, [holdMs, samples.length])

    return createElement(
      'span',
      { 'data-testid': 'identity-subtitle-morph', ...props },
      samples[index] ?? '',
    )
  },
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
