import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PROJECTS } from '@/data/projects'
import { PortfolioPage } from '@/components/portfolio/PortfolioPage'

describe('Portfolio layout', () => {
  it('shows identity and all project titles', () => {
    render(<PortfolioPage />)
    expect(screen.getByText('Adam Zelinski')).toBeInTheDocument()
    expect(screen.getByText('Head of Design')).toBeInTheDocument()
    for (const project of PROJECTS) {
      expect(screen.getByText(project.title)).toBeInTheDocument()
      expect(screen.getByTestId(`project-logo-${project.id}`)).toBeInTheDocument()
      expect(screen.getByTestId(`media-block-${project.id}`)).toBeInTheDocument()
    }
  })

  it('places the project list before media in document order', () => {
    render(<PortfolioPage />)
    const left = screen.getByTestId('left-column')
    const right = screen.getByTestId('right-column')
    expect(
      left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })
})
