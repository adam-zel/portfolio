import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/App'
import { ProjectCard } from '@/components/portfolio/ProjectCard'
import { PortfolioPage } from '@/components/portfolio/PortfolioPage'
import { PROJECTS } from '@/data/projects'

const bind = vi.fn()
const play = vi.fn()

vi.mock('cuelume', () => ({
  bind: (...args: unknown[]) => bind(...args),
  play: (...args: unknown[]) => play(...args),
}))

describe('Portfolio Cuelume cues', () => {
  beforeEach(() => {
    bind.mockClear()
    play.mockClear()
    Element.prototype.scrollIntoView = vi.fn()
  })

  it('calls bind once when the app shell mounts', () => {
    render(<App />)
    expect(bind).toHaveBeenCalled()
  })

  it('marks revealed project cards with hover tick and press attributes', () => {
    render(<PortfolioPage forceDesktop forceBendOff />)
    const card = screen.getByTestId('project-card-programa')
    expect(card).toHaveAttribute('data-cuelume-hover', 'tick')
    expect(card).toHaveAttribute('data-cuelume-press')
    expect(card).not.toHaveAttribute('data-cuelume-toggle')
  })

  it('does not play toggle on pointer click while still selecting the project', async () => {
    const user = userEvent.setup()
    render(<PortfolioPage forceDesktop forceBendOff />)
    await user.click(screen.getByTestId('project-card-pennant'))
    expect(play).not.toHaveBeenCalledWith('toggle')
    expect(screen.getByTestId('project-card-pennant')).toHaveAttribute(
      'aria-current',
      'true',
    )
  })

  it('plays toggle once on Enter and activates the project via native click', async () => {
    const user = userEvent.setup()
    render(<PortfolioPage forceDesktop forceBendOff />)
    const card = screen.getByTestId('project-card-pennant')
    card.focus()
    await user.keyboard('{Enter}')
    expect(play).toHaveBeenCalledWith('toggle')
    expect(play.mock.calls.filter((call) => call[0] === 'toggle')).toHaveLength(
      1,
    )
    expect(card).toHaveAttribute('aria-current', 'true')
  })

  it('plays toggle once on Space activation', async () => {
    const user = userEvent.setup()
    render(<PortfolioPage forceDesktop forceBendOff />)
    const card = screen.getByTestId('project-card-pennant')
    card.focus()
    await user.keyboard(' ')
    expect(play).toHaveBeenCalledWith('toggle')
    expect(play.mock.calls.filter((call) => call[0] === 'toggle')).toHaveLength(
      1,
    )
  })

  it('keeps cue attributes and keyboard toggle under reduced motion', async () => {
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

    const user = userEvent.setup()
    render(<PortfolioPage forceDesktop forceBendOff />)
    const card = screen.getByTestId('project-card-pennant')
    expect(card).toHaveAttribute('data-cuelume-hover', 'tick')
    expect(card).toHaveAttribute('data-cuelume-press')
    card.focus()
    await user.keyboard('{Enter}')
    expect(play).toHaveBeenCalledWith('toggle')
  })

  it('does not play toggle on keydown when the card is unrevealed', () => {
    const onSelect = vi.fn()
    render(
      <ProjectCard
        project={PROJECTS[1]!}
        revealed={false}
        onSelect={onSelect}
      />,
    )
    const card = screen.getByTestId('project-card-pennant')
    fireEvent.keyDown(card, { key: 'Enter' })
    expect(play).not.toHaveBeenCalled()
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('ignores repeated Enter keydowns for toggle', () => {
    render(
      <ProjectCard project={PROJECTS[1]!} revealed onSelect={vi.fn()} />,
    )
    const card = screen.getByTestId('project-card-pennant')
    fireEvent.keyDown(card, { key: 'Enter', repeat: true })
    expect(play).not.toHaveBeenCalled()
  })
})
