import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { play } from 'cuelume'
import { useGlimm, type SweepHandle } from 'glimm/react'
import { clearGlimmOverlay } from '@/components/portfolio/GlimmRoot'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import {
  applyAppearance,
  PREFERS_DARK_QUERY,
  readOverride,
  resolveAppearance,
  syncAppearanceFromEnvironment,
  writeOverride,
  type Appearance,
} from '@/lib/appearance'
import { cn } from '@/lib/utils'

/**
 * Paper HWF-0 / HW9-0 binary appearance control (56×32 visual).
 * Hit target is taller/wider than the pill; press scale is on the pill only.
 */
export function ThemeToggle() {
  const { sweep } = useGlimm()
  const prefersDark = useMediaQuery(PREFERS_DARK_QUERY)
  const [override, setOverride] = useState<Appearance | null>(() => readOverride())
  const [pressed, setPressed] = useState(false)
  const activeSweepRef = useRef<SweepHandle | null>(null)
  const resolved = resolveAppearance(override, prefersDark)

  useEffect(() => {
    syncAppearanceFromEnvironment()
  }, [])

  // Live OS sync only while no session override — animated toggles apply at Glimm midpoint.
  useEffect(() => {
    if (override != null) return
    applyAppearance(prefersDark ? 'dark' : 'light')
  }, [override, prefersDark])

  function select(mode: Appearance, options: { animate?: boolean } = {}) {
    const animate = options.animate !== false
    if (mode === resolved) return

    writeOverride(mode)
    setOverride(mode)

    if (!animate) {
      activeSweepRef.current?.cancel()
      activeSweepRef.current = null
      // cancel() leaves shader alpha/progress — clear so the band does not stick.
      clearGlimmOverlay()
      applyAppearance(mode)
      return
    }

    activeSweepRef.current?.cancel()
    // Provider defaults match glimm.dev; only sweep direction follows the toggle.
    const handle = sweep(() => applyAppearance(mode), {
      direction: mode === 'dark' ? 'ltr' : 'rtl',
    })
    activeSweepRef.current = handle
    void handle.done.finally(() => {
      if (activeSweepRef.current === handle) activeSweepRef.current = null
    })
  }

  function toggle(options: { animate?: boolean } = {}) {
    select(resolved === 'dark' ? 'light' : 'dark', options)
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      if (event.repeat) return
      event.preventDefault()
      play('toggle')
      toggle()
      return
    }
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    // Keyboard actions stay instant — no sweep (Emil: never animate keyboard).
    toggle({ animate: false })
  }

  const dark = resolved === 'dark'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Color theme"
      data-testid="theme-toggle"
      data-appearance={resolved}
      data-cuelume-hover="tick"
      data-cuelume-press=""
      onClick={() => toggle()}
      onKeyDown={onKeyDown}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture?.(event.pointerId)
        setPressed(true)
      }}
      onPointerUp={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      onLostPointerCapture={() => setPressed(false)}
      className={cn(
        'theme-toggle relative flex h-11 w-16 shrink-0 touch-manipulation items-center justify-center',
        'rounded-full outline-none',
        'focus-visible:ring-2 focus-visible:ring-[color:var(--color-ink)]/35',
      )}
    >
      <span
        aria-hidden
        data-testid="theme-toggle-track"
        className={cn(
          'theme-toggle-track pointer-events-none relative box-border h-8 w-14 overflow-hidden rounded-full p-0.5',
          'transition-[transform,background-color,filter] duration-[160ms]',
          'ease-[cubic-bezier(0.23,1,0.32,1)]',
          dark ? 'bg-[#26241E]' : 'bg-[#E6E5E0]',
          pressed && 'scale-[0.97]',
        )}
      >
        <span
          data-testid="theme-toggle-thumb"
          className={cn(
            'absolute top-0.5 left-0.5 h-[28px] w-[26px] rounded-full',
            'transition-transform duration-[220ms] ease-[cubic-bezier(0.23,1,0.32,1)]',
            'will-change-transform',
            dark ? 'bg-[#EDECEC1A]' : 'bg-[#26251E1A]',
          )}
          style={{
            transform: dark ? 'translateX(26px)' : 'translateX(0)',
          }}
        />
      </span>
    </button>
  )
}
