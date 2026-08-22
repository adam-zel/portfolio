import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  APPEARANCE_STORAGE_KEY,
  DARK_CLASS,
  applyAppearance,
  readOverride,
  resolveAppearance,
  syncAppearanceFromEnvironment,
  systemPrefersDark,
  writeOverride,
} from '@/lib/appearance'

describe('appearance resolve helpers', () => {
  beforeEach(() => {
    sessionStorage.clear()
    document.documentElement.classList.remove(DARK_CLASS)
  })

  afterEach(() => {
    sessionStorage.clear()
    document.documentElement.classList.remove(DARK_CLASS)
  })

  it('resolves dark from OS when no override', () => {
    expect(resolveAppearance(null, true)).toBe('dark')
    expect(resolveAppearance(null, false)).toBe('light')
  })

  it('prefers explicit override over OS', () => {
    expect(resolveAppearance('light', true)).toBe('light')
    expect(resolveAppearance('dark', false)).toBe('dark')
  })

  it('persists override in sessionStorage and ignores corrupt values', () => {
    writeOverride('dark')
    expect(sessionStorage.getItem(APPEARANCE_STORAGE_KEY)).toBe('dark')
    expect(readOverride()).toBe('dark')

    sessionStorage.setItem(APPEARANCE_STORAGE_KEY, 'nope')
    expect(readOverride()).toBeNull()

    writeOverride(null)
    expect(sessionStorage.getItem(APPEARANCE_STORAGE_KEY)).toBeNull()
  })

  it('applies and clears the dark class on html', () => {
    applyAppearance('dark')
    expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(true)
    applyAppearance('light')
    expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(false)
  })

  it('syncAppearanceFromEnvironment uses override then OS', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: (query: string) => ({
        matches: query.includes('prefers-color-scheme: dark'),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    })

    expect(systemPrefersDark()).toBe(true)
    expect(syncAppearanceFromEnvironment()).toBe('dark')
    expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(true)

    writeOverride('light')
    expect(syncAppearanceFromEnvironment()).toBe('light')
    expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(false)
  })
})

describe('appearance storage failures', () => {
  it('survives sessionStorage throwing on read/write', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    expect(readOverride()).toBeNull()
    expect(() => writeOverride('dark')).not.toThrow()
    expect(resolveAppearance(null, true)).toBe('dark')

    getItem.mockRestore()
    setItem.mockRestore()
  })
})
