import '@testing-library/jest-dom/vitest'
import {
  createElement,
  useEffect,
  useState,
} from 'react'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import {
  IDENTITY_SUBTITLE_ADVANCE_MS,
  IDENTITY_SUBTITLE_DWELL_MS,
} from '@/data/identityTitles'

vi.mock('@/components/animata/text/mask-reveal-up', () => ({
  default: function MockMaskRevealUp({
    text,
    holdMs = IDENTITY_SUBTITLE_DWELL_MS,
  }: {
    text?: string | string[]
    holdMs?: number
    className?: string
    titleClassName?: string
    enter?: unknown
    exit?: unknown
    speed?: number
    gapMs?: number
    yTravel?: number
  }) {
    const samples = Array.isArray(text) ? text : text != null ? [text] : ['']
    const [index, setIndex] = useState(0)

    // Mirror TextAnimator sequential timing: enter + hold + exit + microDelay.
    // When holdMs matches the identity dwell, use the shared ADVANCE constant;
    // otherwise scale proportionally from the documented identity phases.
    const advanceMs =
      holdMs === IDENTITY_SUBTITLE_DWELL_MS
        ? IDENTITY_SUBTITLE_ADVANCE_MS
        : IDENTITY_SUBTITLE_ADVANCE_MS -
          IDENTITY_SUBTITLE_DWELL_MS +
          holdMs

    useEffect(() => {
      if (samples.length <= 1) return
      const id = window.setInterval(() => {
        setIndex((current) => (current + 1) % samples.length)
      }, advanceMs)
      return () => window.clearInterval(id)
    }, [advanceMs, samples.length])

    return createElement(
      'span',
      { 'data-testid': 'identity-subtitle-morph' },
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
