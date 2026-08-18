import { existsSync } from 'node:fs'
import path from 'node:path'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PROJECTS, projectMediaFrames } from '@/data/projects'
import { PortfolioPage } from '@/components/portfolio/PortfolioPage'

const EXPECTED_MEDIA_FRAME_COUNT = PROJECTS.flatMap(projectMediaFrames).length

describe('Portfolio layout', () => {
  it('ships a public file for every project logo and media path', () => {
    for (const project of PROJECTS) {
      const absolute = path.join(process.cwd(), 'public', project.logo.replace(/^\//, ''))
      expect(existsSync(absolute), `missing ${project.logo}`).toBe(true)
      for (const src of project.media ?? project.images ?? []) {
        const mediaPath = path.join(process.cwd(), 'public', src.replace(/^\//, ''))
        expect(existsSync(mediaPath), `missing ${src}`).toBe(true)
      }
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

  it('renders Programa with its Paper media frames', () => {
    render(<PortfolioPage />)
    expect(screen.getByTestId('media-block-programa')).toBeInTheDocument()
    for (let i = 1; i <= 11; i++) {
      expect(screen.getByTestId(`media-block-programa-${i}`)).toBeInTheDocument()
    }
    const first = screen.getByTestId('media-block-programa').querySelector('img')
    expect(first).toHaveAttribute('src', '/project-media/PRO-01@2x.webp')
    expect(
      screen.getByTestId('right-column').querySelectorAll(
        '[data-testid^="media-block-"]',
      ).length,
    ).toBe(EXPECTED_MEDIA_FRAME_COUNT)
  })

  it('clips Pennant video to the same frame radius as image media', () => {
    render(<PortfolioPage />)
    const video = screen.getByTestId('media-block-pennant').querySelector('video')
    expect(video).toHaveAttribute('src', '/project-media/PEN-01.webm')
    expect(video).toHaveClass(
      'rounded-sm',
      '[clip-path:inset(0_round_var(--radius-sm))]',
    )
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
