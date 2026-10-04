/** Keep in sync with the blocking script in index.html (cannot import ESM before paint). */
export const APPEARANCE_STORAGE_KEY = 'portfolio-appearance-override'
export const DARK_CLASS = 'dark'
export const PREFERS_DARK_QUERY = '(prefers-color-scheme: dark)'

export type Appearance = 'light' | 'dark'

function isAppearance(value: string | null): value is Appearance {
  return value === 'light' || value === 'dark'
}

export function readOverride(): Appearance | null {
  try {
    if (typeof sessionStorage === 'undefined') return null
    const raw = sessionStorage.getItem(APPEARANCE_STORAGE_KEY)
    return isAppearance(raw) ? raw : null
  } catch {
    return null
  }
}

export function writeOverride(value: Appearance | null): void {
  try {
    if (typeof sessionStorage === 'undefined') return
    if (value == null) {
      sessionStorage.removeItem(APPEARANCE_STORAGE_KEY)
      return
    }
    sessionStorage.setItem(APPEARANCE_STORAGE_KEY, value)
  } catch {
    // Restricted storage — appearance still applies for this document lifetime.
  }
}

export function systemPrefersDark(): boolean {
  try {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false
    }
    return window.matchMedia(PREFERS_DARK_QUERY).matches
  } catch {
    return false
  }
}

export function resolveAppearance(
  override: Appearance | null = readOverride(),
  prefersDark: boolean = systemPrefersDark(),
): Appearance {
  if (override) return override
  return prefersDark ? 'dark' : 'light'
}

export function applyAppearance(mode: Appearance): void {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle(DARK_CLASS, mode === 'dark')
}

/** Resolve from storage + OS and apply to <html>. Safe for head bootstrap and React. */
export function syncAppearanceFromEnvironment(): Appearance {
  const mode = resolveAppearance()
  applyAppearance(mode)
  return mode
}
