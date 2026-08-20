import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { PortfolioPage } from '@/components/portfolio/PortfolioPage'
import { PROJECTS } from '@/data/projects'
import {
  APPEARANCE_STORAGE_KEY,
  DARK_CLASS,
  syncAppearanceFromEnvironment,
} from '@/lib/appearance'
import { mockPrefersColorScheme } from '@/test/matchMedia'

describe('Portfolio appearance', () => {
  beforeEach(() => {
    sessionStorage.clear()
    document.documentElement.classList.remove(DARK_CLASS)
    mockPrefersColorScheme('light')
  })

  afterEach(() => {
    cleanup()
    sessionStorage.clear()
    document.documentElement.classList.remove(DARK_CLASS)
    mockPrefersColorScheme('light')
  })

  it('applies dark class when OS prefers dark and no override', () => {
    mockPrefersColorScheme('dark')
    render(<PortfolioPage />)
    expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(true)
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
  })

  it('forces light for the session when the light segment is pressed', async () => {
    const user = userEvent.setup()
    mockPrefersColorScheme('dark')
    render(<PortfolioPage />)
    expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(true)

    await user.click(screen.getByTestId('theme-toggle-light'))
    expect(sessionStorage.getItem(APPEARANCE_STORAGE_KEY)).toBe('light')
    expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(false)
  })

  it('keeps override after re-sync (reload shape)', async () => {
    const user = userEvent.setup()
    mockPrefersColorScheme('dark')
    const { unmount } = render(<PortfolioPage />)
    await user.click(screen.getByTestId('theme-toggle-light'))
    unmount()

    mockPrefersColorScheme('dark')
    expect(syncAppearanceFromEnvironment()).toBe('light')
    render(<PortfolioPage />)
    expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(false)
    expect(sessionStorage.getItem(APPEARANCE_STORAGE_KEY)).toBe('light')
  })

  it('returns to OS after session storage is cleared (new session shape)', () => {
    sessionStorage.setItem(APPEARANCE_STORAGE_KEY, 'light')
    mockPrefersColorScheme('dark')
    expect(syncAppearanceFromEnvironment()).toBe('light')

    sessionStorage.clear()
    expect(syncAppearanceFromEnvironment()).toBe('dark')
    render(<PortfolioPage />)
    expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(true)
  })

  it('follows live OS changes when there is no override', async () => {
    const media = mockPrefersColorScheme('light')
    render(<PortfolioPage />)
    expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(false)

    media.setMatches(true)
    await waitFor(() => {
      expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(true)
    })
  })

  it('ignores OS changes while a session override is set', async () => {
    const user = userEvent.setup()
    const media = mockPrefersColorScheme('dark')
    render(<PortfolioPage />)
    await user.click(screen.getByTestId('theme-toggle-light'))
    expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(false)

    media.setMatches(true)
    await waitFor(() => {
      expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(false)
    })
  })

  it('does not recolor project logos under dark appearance', () => {
    mockPrefersColorScheme('dark')
    render(<PortfolioPage />)
    for (const project of PROJECTS) {
      expect(screen.getByTestId(`project-logo-${project.id}`)).toHaveAttribute(
        'src',
        project.logo,
      )
    }
  })
})
