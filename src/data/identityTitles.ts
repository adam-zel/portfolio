/** MaskRevealUp BASE_SPEC enter.durationMs — keep in sync with mask-reveal-up.tsx. */
const MASK_REVEAL_ENTER_MS = 760

/** MaskRevealUp BASE_SPEC exit.durationMs — keep in sync with mask-reveal-up.tsx. */
const MASK_REVEAL_EXIT_MS = 520

/** Default TextAnimator speed when IdentitySubtitle omits `speed`. */
export const IDENTITY_SUBTITLE_SPEED = 0.72

/** MaskRevealUp BASE_SPEC swap.microDelayMs for sequential swaps. */
const MASK_REVEAL_MICRO_DELAY_MS = 35

export const IDENTITY_TITLES = [
  'Head of Design',
  'Coffee Drinker',
  'Baseball Watcher',
  'App Developer',
  'Record Collector',
  'Carlton Supporter',
] as const

/** Shared with MaskRevealUp so the samples array identity stays stable across renders. */
export const IDENTITY_TITLE_SAMPLES: string[] = [...IDENTITY_TITLES]

/**
 * Readable hold after the enter phase finishes (product dwell ~3s).
 * Production waits `enterDuration + holdMs` before starting exit.
 */
export const IDENTITY_SUBTITLE_DWELL_MS = 3000

/** Enter phase duration for a single-line title at identity speed. */
export const IDENTITY_SUBTITLE_ENTER_MS = Math.max(
  140,
  Math.round(MASK_REVEAL_ENTER_MS * IDENTITY_SUBTITLE_SPEED),
)

/** Exit phase duration for a single-line title at identity speed. */
export const IDENTITY_SUBTITLE_EXIT_MS = Math.max(
  140,
  Math.round(MASK_REVEAL_EXIT_MS * IDENTITY_SUBTITLE_SPEED),
)

/**
 * Time from first title mount until the next title mounts in production
 * (enter + readable hold + exit + microDelay). Used by the Vitest mock so
 * advance timing matches TextAnimator's sequential swap path, not holdMs alone.
 */
export const IDENTITY_SUBTITLE_ADVANCE_MS =
  IDENTITY_SUBTITLE_ENTER_MS +
  IDENTITY_SUBTITLE_DWELL_MS +
  IDENTITY_SUBTITLE_EXIT_MS +
  MASK_REVEAL_MICRO_DELAY_MS

/** Display metrics shared by the name and rotating subtitle. */
export const IDENTITY_TYPE_CLASS =
  'text-[26px] leading-[125%] tracking-[-0.325px]'

/** Longest title by character length — used to reserve stable subtitle width. */
export const LONGEST_IDENTITY_TITLE = IDENTITY_TITLES.reduce((longest, title) =>
  title.length > longest.length ? title : longest,
)
