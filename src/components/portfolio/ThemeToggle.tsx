import { useEffect, useState, type KeyboardEvent } from 'react'
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

const SEGMENTS: { value: Appearance; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

/**
 * Paper-style binary appearance control.
 * Selected segment tracks Resolved appearance; pressing a segment writes a session override.
 */
export function ThemeToggle() {
  const prefersDark = useMediaQuery(PREFERS_DARK_QUERY)
  const [override, setOverride] = useState<Appearance | null>(() => readOverride())
  const resolved = resolveAppearance(override, prefersDark)

  useEffect(() => {
    syncAppearanceFromEnvironment()
  }, [])

  useEffect(() => {
    if (override != null) return
    applyAppearance(prefersDark ? 'dark' : 'light')
  }, [override, prefersDark])

  function select(mode: Appearance) {
    writeOverride(mode)
    setOverride(mode)
    applyAppearance(mode)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const index = SEGMENTS.findIndex((segment) => segment.value === resolved)
    const next =
      event.key === 'ArrowRight'
        ? SEGMENTS[(index + 1) % SEGMENTS.length]
        : SEGMENTS[(index - 1 + SEGMENTS.length) % SEGMENTS.length]
    select(next.value)
  }

  return (
    <div
      role="group"
      aria-label="Color theme"
      data-testid="theme-toggle"
      onKeyDown={onKeyDown}
      className={cn(
        'flex h-8 w-14 shrink-0 rounded-full p-0.5',
        resolved === 'dark' ? 'bg-[#26241E]' : 'bg-[#E6E5E0]',
      )}
    >
      {SEGMENTS.map(({ value, label }) => {
        const selected = resolved === value
        return (
          <button
            key={value}
            type="button"
            aria-label={label}
            aria-pressed={selected}
            data-testid={`theme-toggle-${value}`}
            onClick={() => select(value)}
            className={cn(
              'flex h-7 flex-1 items-center justify-center rounded-full outline-none',
              'focus-visible:ring-2 focus-visible:ring-[color:var(--color-ink)]/40',
              selected &&
                (resolved === 'dark'
                  ? 'bg-[#EDECEC1A]'
                  : 'bg-[#26251E1A]'),
            )}
          />
        )
      })}
    </div>
  )
}
