import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/App'
import { ProjectCard } from '@/components/portfolio/ProjectCard'
import { PortfolioPage } from '@/components/portfolio/PortfolioPage'
import { PROJECTS } from '@/data/projects'
import { mockPrefersReducedMotion } from '@/test/matchMedia'

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

  it('calls bind when the app shell mounts', () => {
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

  it.each([
    ['Enter', '{Enter}'],
    ['Space', ' '],
  ] as const)(
    'plays toggle once on %s and activates the project via native click',
    async (_label, key) => {
      const user = userEvent.setup()
      render(<PortfolioPage forceDesktop forceBendOff />)
      const card = screen.getByTestId('project-card-pennant')
      card.focus()
      await user.keyboard(key)
      expect(play).toHaveBeenCalledTimes(1)
      expect(play).toHaveBeenCalledWith('toggle')
      expect(card).toHaveAttribute('aria-current', 'true')
    },
  )

  it('keeps cue attributes and keyboard toggle under reduced motion', async () => {
    mockPrefersReducedMotion()

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

  it.each(['a', 'Tab'] as const)(
    'does not play toggle on non-activation keydown (%s)',
    (key) => {
      const onSelect = vi.fn()
      render(
        <ProjectCard project={PROJECTS[1]!} revealed onSelect={onSelect} />,
      )
      const card = screen.getByTestId('project-card-pennant')
      fireEvent.keyDown(card, { key })
      expect(play).not.toHaveBeenCalled()
      expect(onSelect).not.toHaveBeenCalled()
    },
  )
})
