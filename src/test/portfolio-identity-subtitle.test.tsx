import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PortfolioPage } from '@/components/portfolio/PortfolioPage'
import {
  IDENTITY_SUBTITLE_ADVANCE_MS,
  IDENTITY_TITLES,
} from '@/data/identityTitles'
import { mockPrefersReducedMotion } from '@/test/matchMedia'

describe('Portfolio identity subtitle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    Element.prototype.scrollIntoView = vi.fn()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the name and starts on Head of Design', () => {
    render(<PortfolioPage forceBendOff />)
    expect(screen.getByText('Adam Zelinski')).toBeInTheDocument()
    expect(screen.getByTestId('identity-subtitle-morph')).toHaveTextContent(
      IDENTITY_TITLES[0],
    )
  })

  it('advances to Coffee Drinker after enter + dwell + exit', () => {
    render(<PortfolioPage forceBendOff />)
    act(() => {
      vi.advanceTimersByTime(IDENTITY_SUBTITLE_ADVANCE_MS)
    })
    expect(screen.getByTestId('identity-subtitle-morph')).toHaveTextContent(
      IDENTITY_TITLES[1]!,
    )
  })

  it('loops back to Head of Design after the full title list', () => {
    render(<PortfolioPage forceBendOff />)
    act(() => {
      vi.advanceTimersByTime(
        IDENTITY_TITLES.length * IDENTITY_SUBTITLE_ADVANCE_MS,
      )
    })
    expect(screen.getByTestId('identity-subtitle-morph')).toHaveTextContent(
      IDENTITY_TITLES[0],
    )
  })

  it('freezes on Head of Design when reduced motion is preferred', () => {
    mockPrefersReducedMotion()
    render(<PortfolioPage forceBendOff />)

    act(() => {
      vi.advanceTimersByTime(
        IDENTITY_TITLES.length * IDENTITY_SUBTITLE_ADVANCE_MS,
      )
    })

    expect(screen.getByTestId('identity-subtitle')).toHaveTextContent(
      IDENTITY_TITLES[0],
    )
    expect(screen.queryByTestId('identity-subtitle-morph')).toBeNull()
  })
})
