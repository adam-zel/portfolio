import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PROJECTS } from '@/data/projects'
import { PortfolioPage } from '@/components/portfolio/PortfolioPage'

describe('Portfolio motion', () => {
  it('keeps media and spotlight usable when Bend is forced off', async () => {
    render(<PortfolioPage forceDesktop forceBendOff />)
    expect(screen.getByTestId('right-column')).toHaveAttribute('data-bend', 'off')
    expect(screen.getByTestId('right-scroll-root')).toBeInTheDocument()
    for (const project of PROJECTS) {
      expect(screen.getByTestId(`media-block-${project.id}`)).toBeInTheDocument()
    }
    expect(screen.getByTestId('project-card-programa')).toHaveAttribute(
      'aria-current',
      'true',
    )
  })

  it('does not mount Bend on mobile', () => {
    render(<PortfolioPage forceMobile />)
    expect(screen.getByTestId('right-column')).toHaveAttribute('data-bend', 'off')
    expect(document.querySelector('[data-bend-content]')).toBeNull()
  })

  it('reveals cards when reduced motion is preferred', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
        onchange: null,
      }),
    })

    render(<PortfolioPage forceDesktop />)
    for (const project of PROJECTS) {
      expect(screen.getByTestId(`project-card-${project.id}`)).toHaveClass(
        'opacity-100',
      )
    }
  })
})
