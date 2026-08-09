import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PortfolioPage } from '@/components/portfolio/PortfolioPage'
import { IDENTITY_TITLES } from '@/data/identityTitles'
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
      'Head of Design',
    )
  })

  it('morphs to Coffee Drinker after 3 seconds', () => {
    render(<PortfolioPage forceBendOff />)
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.getByTestId('identity-subtitle-morph')).toHaveTextContent(
      'Coffee Drinker',
    )
  })

  it('loops back to Head of Design after the full title list', () => {
    render(<PortfolioPage forceBendOff />)
    act(() => {
      vi.advanceTimersByTime(IDENTITY_TITLES.length * 3000)
    })
    expect(screen.getByTestId('identity-subtitle-morph')).toHaveTextContent(
      'Head of Design',
    )
  })

  it('freezes on Head of Design when reduced motion is preferred', () => {
    mockPrefersReducedMotion()
    render(<PortfolioPage forceBendOff />)

    act(() => {
      vi.advanceTimersByTime(IDENTITY_TITLES.length * 3000)
    })

    const morph = screen.getByTestId('identity-subtitle-morph')
    expect(morph).toHaveTextContent('Head of Design')
    expect(morph).toHaveAttribute('disabled')
  })
})
