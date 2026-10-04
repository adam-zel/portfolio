import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as GlimmRootMod from '@/components/portfolio/GlimmRoot'
import { PortfolioPage } from '@/components/portfolio/PortfolioPage'
import { PROJECTS } from '@/data/projects'
import {
  APPEARANCE_STORAGE_KEY,
  DARK_CLASS,
  syncAppearanceFromEnvironment,
} from '@/lib/appearance'
import { mockPrefersColorScheme } from '@/test/matchMedia'

type SweepHandleStub = {
  midpoint: Promise<void>
  done: Promise<void>
  cancel: ReturnType<typeof vi.fn>
  /** Test-only: fire deferred navigate (Glimm midpoint). */
  fireMidpoint: () => void
}

const play = vi.fn()
let activeHandle: SweepHandleStub | null = null
let clearOverlaySpy: ReturnType<typeof vi.spyOn> | undefined

vi.mock('cuelume', () => ({
  bind: vi.fn(),
  play: (...args: unknown[]) => play(...args),
}))

vi.mock('glimm/react', () => ({
  GlimmProvider: ({ children }: { children: unknown }) => children,
  useGlimm: () => ({
    defaults: {},
    sweep: (navigate: () => void | Promise<void>) => {
      let cancelled = false
      let midFired = false
      let resolveDone!: () => void
      const done = new Promise<void>((resolve) => {
        resolveDone = resolve
      })
      const fireMidpoint = () => {
        if (cancelled || midFired) return
        midFired = true
        void navigate()
        resolveDone()
      }
      const cancel = vi.fn(() => {
        cancelled = true
        resolveDone()
      })
      const handle: SweepHandleStub = {
        midpoint: Promise.resolve(),
        done,
        cancel,
        fireMidpoint,
      }
      activeHandle = handle
      return handle
    },
  }),
}))

function flushSweepMidpoint() {
  activeHandle?.fireMidpoint()
}

describe('Portfolio appearance', () => {
  beforeEach(() => {
    sessionStorage.clear()
    document.documentElement.classList.remove(DARK_CLASS)
    mockPrefersColorScheme('light')
    play.mockClear()
    activeHandle = null
    clearOverlaySpy = vi.spyOn(GlimmRootMod, 'clearGlimmOverlay')
  })

  afterEach(() => {
    cleanup()
    sessionStorage.clear()
    document.documentElement.classList.remove(DARK_CLASS)
    mockPrefersColorScheme('light')
    clearOverlaySpy?.mockRestore()
    activeHandle = null
  })

  it('applies dark class when OS prefers dark and no override', () => {
    mockPrefersColorScheme('dark')
    render(<PortfolioPage />)
    expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(true)
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
  })

  it('forces light for the session when toggled from a dark OS', async () => {
    const user = userEvent.setup()
    mockPrefersColorScheme('dark')
    render(<PortfolioPage />)
    expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(true)

    await user.click(screen.getByTestId('theme-toggle'))
    expect(sessionStorage.getItem(APPEARANCE_STORAGE_KEY)).toBe('light')
    // Sweep defers applyAppearance until midpoint.
    expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(true)
    flushSweepMidpoint()
    expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(false)
  })

  it('forces dark for the session when toggled from a light OS', async () => {
    const user = userEvent.setup()
    mockPrefersColorScheme('light')
    render(<PortfolioPage />)
    expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(false)

    await user.click(screen.getByTestId('theme-toggle'))
    expect(sessionStorage.getItem(APPEARANCE_STORAGE_KEY)).toBe('dark')
    expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(false)
    flushSweepMidpoint()
    expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(true)
  })

  it('keeps override after re-sync (reload shape)', async () => {
    const user = userEvent.setup()
    mockPrefersColorScheme('dark')
    const { unmount } = render(<PortfolioPage />)
    await user.click(screen.getByTestId('theme-toggle'))
    flushSweepMidpoint()
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
    await user.click(screen.getByTestId('theme-toggle'))
    flushSweepMidpoint()
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

  it('applies appearance at midpoint for pointer toggle and plays no toggle cue on click', async () => {
    const user = userEvent.setup()
    mockPrefersColorScheme('dark')
    render(<PortfolioPage />)
    await user.click(screen.getByTestId('theme-toggle'))
    expect(play).not.toHaveBeenCalledWith('toggle')
    expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(true)
    flushSweepMidpoint()
    expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(false)
  })

  it('Enter/Space toggle plays cue and sweeps to the opposite appearance', async () => {
    mockPrefersColorScheme('dark')
    render(<PortfolioPage />)
    const toggle = screen.getByTestId('theme-toggle')
    toggle.focus()
    fireEvent.keyDown(toggle, { key: 'Enter' })
    expect(play).toHaveBeenCalledWith('toggle')
    expect(sessionStorage.getItem(APPEARANCE_STORAGE_KEY)).toBe('light')
    expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(true)
    flushSweepMidpoint()
    expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(false)
  })

  it('arrow keys apply instantly, cancel an in-flight sweep, and clear the overlay', async () => {
    const user = userEvent.setup()
    mockPrefersColorScheme('dark')
    render(<PortfolioPage />)
    await user.click(screen.getByTestId('theme-toggle'))
    const inFlight = activeHandle
    expect(inFlight).not.toBeNull()
    expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(true)

    const toggle = screen.getByTestId('theme-toggle')
    fireEvent.keyDown(toggle, { key: 'ArrowRight' })

    expect(inFlight?.cancel).toHaveBeenCalled()
    expect(clearOverlaySpy).toHaveBeenCalled()
    expect(sessionStorage.getItem(APPEARANCE_STORAGE_KEY)).toBe('dark')
    expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(true)

    // Stale midpoint from the cancelled sweep must not flip appearance again.
    inFlight?.fireMidpoint()
    expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(true)
  })

  it('ignores keydown repeat on Enter', () => {
    mockPrefersColorScheme('dark')
    render(<PortfolioPage />)
    const toggle = screen.getByTestId('theme-toggle')
    fireEvent.keyDown(toggle, { key: 'Enter', repeat: true })
    expect(play).not.toHaveBeenCalled()
    expect(sessionStorage.getItem(APPEARANCE_STORAGE_KEY)).toBeNull()
  })
})
