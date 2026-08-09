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
  })

  it('defaults to the first project as active', () => {
    render(<PortfolioPage forceDesktop forceBendOff />)
    expect(screen.getByTestId('project-card-programa')).toHaveAttribute(
      'aria-current',
      'true',
    )
  })

  it('marks the featured media project active when intersection updates', async () => {
    render(<PortfolioPage forceDesktop forceBendOff />)
    const observer = MockIntersectionObserver.instances.at(-1)
    expect(observer).toBeTruthy()
    observer!.trigger('pennant', 0.9)
    await waitFor(() => {
      expect(screen.getByTestId('project-card-pennant')).toHaveAttribute(
        'aria-current',
        'true',
      )
    })
    expect(screen.getByTestId('project-card-programa')).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('jumps to Pocket Casts media on card click', async () => {
    const user = userEvent.setup()
    const scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView

    render(<PortfolioPage forceDesktop forceBendOff />)
    await user.click(screen.getByTestId('project-card-pocket-casts'))

    expect(scrollIntoView).toHaveBeenCalled()
    expect(screen.getByTestId('project-card-pocket-casts')).toHaveAttribute(
      'aria-current',
      'true',
    )
    expect(
      document.getElementById(mediaElementId('pocket-casts')),
    ).toBeTruthy()
  })
})
