type MediaQueryListStub = {
  matches: boolean
  media: string
  onchange: null
  addListener: () => void
  removeListener: () => void
  addEventListener: (type: string, listener: EventListener) => void
  removeEventListener: (type: string, listener: EventListener) => void
  dispatchEvent: () => boolean
  setMatches: (next: boolean) => void
}

/** Stub window.matchMedia so prefers-reduced-motion queries match. */
export function mockPrefersReducedMotion() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}

/** Stub prefers-color-scheme and allow live change events for appearance tests. */
export function mockPrefersColorScheme(
  scheme: 'light' | 'dark',
): MediaQueryListStub {
  const listeners = new Set<EventListener>()
  let matches = scheme === 'dark'

  const media: MediaQueryListStub = {
    get matches() {
      return matches
    },
    set matches(_value: boolean) {
      // Prefer setMatches so change listeners fire.
    },
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: (type: string, listener: EventListener) => {
      if (type === 'change') listeners.add(listener)
    },
    removeEventListener: (type: string, listener: EventListener) => {
      if (type === 'change') listeners.delete(listener)
    },
    dispatchEvent: () => false,
    setMatches(next: boolean) {
      matches = next
      for (const listener of listeners) {
        listener({ matches: next } as unknown as Event)
      }
    },
  }

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => {
      if (query.includes('prefers-color-scheme: dark')) {
        return media
      }
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }
    },
  })

  return media
}
