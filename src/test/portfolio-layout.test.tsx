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

  it('clips Pennant video and image frames to the shared media radius', () => {
    render(<PortfolioPage />)
    const videoBlock = screen.getByTestId('media-block-pennant')
    const video = videoBlock.querySelector('video') as HTMLVideoElement
    expect(videoBlock).toHaveClass(
      'media-frame',
      'isolate',
      'rounded-sm',
      'overflow-hidden',
    )
    expect(video).toHaveAttribute('src', '/project-media/PEN-01.webm')
    expect(video).toHaveAttribute('loop')
    expect(video.muted).toBe(true)
    expect(video).toHaveAttribute('playsinline')
    expect(video).toHaveAttribute('preload', 'metadata')
    expect(video).not.toHaveAttribute('autoplay')
    expect(video).toHaveClass('object-cover')
    expect(video.parentElement).toHaveClass(
      'media-clip',
      'overflow-hidden',
      'rounded-sm',
      '[clip-path:inset(0_round_0.375rem)]',
    )

    const imageBlock = screen.getByTestId('media-block-pennant-1')
    const image = imageBlock.querySelector('img') as HTMLImageElement
    expect(imageBlock).toHaveClass(
      'media-frame',
      'isolate',
      'rounded-sm',
      'overflow-hidden',
    )
    expect(image).toHaveAttribute('src', '/project-media/PEN-02.webp')
    expect(image).toHaveClass('object-cover')

    const stack = screen.getByTestId('right-media-stack')

    // Every Pennant video frame gets the same clip — not only the first.
    const pennantVideos = stack.querySelectorAll('video[src*="PEN-"]')
    expect(pennantVideos.length).toBeGreaterThan(1)
    pennantVideos.forEach((el) => {
      expect(el.closest('.media-clip')).toHaveClass(
        'overflow-hidden',
        'rounded-sm',
        '[clip-path:inset(0_round_0.375rem)]',
      )
      expect(el.closest('.media-frame')).toHaveClass('isolate', 'overflow-hidden')
    })

    // iOS ignores overflow/radius on <img> the same way it does on <video>.
    // Clip must live on a wrapping non-replaced element — every still, not only PEN-02.
    const pennantImages = stack.querySelectorAll('img[src*="PEN-"]')
    expect(pennantImages.length).toBeGreaterThan(1)
    pennantImages.forEach((el) => {
      const clip = el.parentElement
      expect(clip?.tagName).toBe('DIV')
      expect(clip).toHaveClass(
        'media-clip',
        'overflow-hidden',
        'rounded-sm',
        '[clip-path:inset(0_round_0.375rem)]',
      )
      expect(el.closest('.media-frame')).toHaveClass('isolate', 'overflow-hidden')
    })
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
