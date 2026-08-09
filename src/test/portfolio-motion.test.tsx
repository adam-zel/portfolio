import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PROJECTS } from '@/data/projects'
import { PortfolioPage } from '@/components/portfolio/PortfolioPage'
import { mockPrefersReducedMotion } from '@/test/matchMedia'

describe('Portfolio motion', () => {
  it('keeps media and spotlight usable with a plain right scroll root', async () => {
    render(<PortfolioPage forceDesktop />)
    expect(screen.getByTestId('right-scroll-root')).toBeInTheDocument()
    for (const project of PROJECTS) {
      expect(screen.getByTestId(`media-block-${project.id}`)).toBeInTheDocument()
    }
    expect(screen.getByTestId('project-card-programa')).toHaveAttribute(
      'aria-current',
      'true',
    )
  })

  it('scrolls media in a plain overflow root on mobile', () => {
    render(<PortfolioPage forceMobile />)
    expect(screen.getByTestId('right-scroll-root')).toBeInTheDocument()
    expect(screen.getByTestId('right-media-stack')).toBeInTheDocument()
  })

  it('renders one media stack for the whole right column on desktop', () => {
    render(<PortfolioPage forceDesktop />)
    expect(screen.getByTestId('right-media-stack')).toBeInTheDocument()
    expect(
      screen.getByTestId('right-column').querySelectorAll(
        '[data-testid^="media-block-"]',
      ).length,
    ).toBe(PROJECTS.length)
  })

  it('reveals cards when reduced motion is preferred', () => {
    mockPrefersReducedMotion()

    render(<PortfolioPage forceDesktop />)
    for (const project of PROJECTS) {
      expect(screen.getByTestId(`project-card-${project.id}`)).toHaveClass(
        'project-card--revealed',
      )
    }
  })
})
