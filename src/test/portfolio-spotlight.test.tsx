import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mediaElementId } from '@/data/projects'
import { PortfolioPage } from '@/components/portfolio/PortfolioPage'

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = []
  callback: IntersectionObserverCallback
  elements = new Set<Element>()

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    MockIntersectionObserver.instances.push(this)
  }

  observe = (element: Element) => {
    this.elements.add(element)
  }

  unobserve = (element: Element) => {
    this.elements.delete(element)
  }

  disconnect = () => {
    this.elements.clear()
  }

  takeRecords = () => []

  trigger(projectId: string, ratio = 0.8) {
    const target = [...this.elements].find(
      (el) => (el as HTMLElement).dataset.projectId === projectId,
    )
    if (!target) return
    this.callback(
      [
        {
          target,
          isIntersecting: ratio > 0,
          intersectionRatio: ratio,
          time: 0,
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRect: {} as DOMRectReadOnly,
          rootBounds: null,
        },
      ],
      this as unknown as IntersectionObserver,
    )
  }
}

function mediaObserver() {
  return MockIntersectionObserver.instances.find((observer) =>
    [...observer.elements].some((el) =>
      (el as HTMLElement).id.startsWith('project-media-'),
    ),
  )
}

describe('Portfolio spotlight', () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = []
    vi.stubGlobal(
      'IntersectionObserver',
      MockIntersectionObserver as unknown as typeof IntersectionObserver,
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('defaults to the first project as active', () => {
    render(<PortfolioPage forceDesktop />)
    expect(screen.getByTestId('project-card-programa')).toHaveAttribute(
      'aria-current',
      'true',
    )
  })

  it('marks the featured media project active and revealed when intersection updates', async () => {
    render(<PortfolioPage forceDesktop />)
    const observer = mediaObserver()
    expect(observer).toBeTruthy()
    observer!.trigger('pennant', 0.9)
    await waitFor(() => {
      const card = screen.getByTestId('project-card-pennant')
      expect(card).toHaveAttribute('aria-current', 'true')
      expect(card).not.toHaveAttribute('aria-hidden')
      expect(card).toHaveClass('project-card--revealed')
    })
    expect(screen.getByTestId('project-card-programa')).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('jumps to Pocket Casts media on card click', async () => {
    const user = userEvent.setup()
    const scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView

    render(<PortfolioPage forceDesktop />)
    const media = document.getElementById(mediaElementId('pocket-casts'))
    expect(media).toBeTruthy()

    await user.click(screen.getByTestId('project-card-pocket-casts'))

    expect(scrollIntoView).toHaveBeenCalled()
    expect(scrollIntoView.mock.instances).toContain(media)
    expect(screen.getByTestId('project-card-pocket-casts')).toHaveAttribute(
      'aria-current',
      'true',
    )
  })

  it('ignores spotlight IO while a click-jump scroll is in flight', async () => {
    const user = userEvent.setup()
    Element.prototype.scrollIntoView = vi.fn()

    render(<PortfolioPage forceDesktop />)
    const observer = mediaObserver()
    expect(observer).toBeTruthy()

    await user.click(screen.getByTestId('project-card-pocket-casts'))
    expect(screen.getByTestId('project-card-pocket-casts')).toHaveAttribute(
      'aria-current',
      'true',
    )

    // Intermediate media wins the ratio race during smooth scroll; lock must hold.
    observer!.trigger('pennant', 0.95)
    expect(screen.getByTestId('project-card-pocket-casts')).toHaveAttribute(
      'aria-current',
      'true',
    )
    expect(screen.getByTestId('project-card-pennant')).not.toHaveAttribute(
      'aria-current',
    )
  })
})
