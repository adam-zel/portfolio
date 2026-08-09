import { existsSync } from 'node:fs'
import path from 'node:path'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PROJECTS } from '@/data/projects'
import { PortfolioPage } from '@/components/portfolio/PortfolioPage'

describe('Portfolio layout', () => {
  it('ships a public file for every project logo path', () => {
    for (const project of PROJECTS) {
      const absolute = path.join(process.cwd(), 'public', project.logo.replace(/^\//, ''))
      expect(existsSync(absolute), `missing ${project.logo}`).toBe(true)
    }
  })

  it('shows identity and all project titles', () => {
    render(<PortfolioPage />)
    expect(screen.getByText('Adam Zelinski')).toBeInTheDocument()
    expect(screen.getByText('Head of Design')).toBeInTheDocument()
    for (const project of PROJECTS) {
      expect(screen.getByText(project.title)).toBeInTheDocument()
      expect(screen.getByText(project.blurb)).toBeInTheDocument()
      const logo = screen.getByTestId(`project-logo-${project.id}`)
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveAttribute('src', project.logo)
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

  it('makes the whole left column the scroll container on desktop', () => {
    render(<PortfolioPage forceDesktop />)
    const left = screen.getByTestId('left-column')
    const list = screen.getByTestId('project-list')
    expect(left.className).toMatch(/md:overflow-y-auto/)
    expect(list.className).not.toMatch(/overflow-y-auto/)
    expect(left.contains(screen.getByText('Adam Zelinski'))).toBe(true)
    expect(left.contains(list)).toBe(true)
  })
})
