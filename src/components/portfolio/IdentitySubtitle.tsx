import MaskRevealUp from '@/components/animata/text/mask-reveal-up'
import {
  IDENTITY_SUBTITLE_DWELL_MS,
  IDENTITY_SUBTITLE_SPEED,
  IDENTITY_TITLE_SAMPLES,
  IDENTITY_TITLES,
  IDENTITY_TYPE_CLASS,
  LONGEST_IDENTITY_TITLE,
} from '@/data/identityTitles'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

const subtitleClassName = cn(
  IDENTITY_TYPE_CLASS,
  'font-normal text-[color:var(--color-ink-muted)]',
)

/** Stable phase overrides — inline objects would restart TextAnimator on every parent render. */
const IDENTITY_ENTER = {
  from: { opacity: 0, yPx: 16, blurPx: 4 },
  to: { opacity: 1, yPx: 0, blurPx: 0 },
}

const IDENTITY_EXIT = {
  from: { opacity: 1, yPx: 0, blurPx: 0 },
  to: { opacity: 0, yPx: -12, blurPx: 4 },
}

export function IdentitySubtitle() {
  const reducedMotion = usePrefersReducedMotion()

  if (reducedMotion) {
    return (
      <p
        data-testid="identity-subtitle"
        className={subtitleClassName}
      >
        {IDENTITY_TITLES[0]}
      </p>
    )
  }

  return (
    <div
      data-testid="identity-subtitle"
      className={cn(
        subtitleClassName,
        'relative -mt-1 inline-block max-w-full',
      )}
    >
      {/*
        Slight horizontal pad so overflow:hidden on the animator doesn't shear
        the last glyph; height stays one line so name→subtitle gap stays tight.
      */}
      <span
        aria-hidden
        className="invisible block whitespace-nowrap px-1"
      >
        {LONGEST_IDENTITY_TITLE}
      </span>
      <div className="absolute inset-0 overflow-hidden">
        <MaskRevealUp
          text={IDENTITY_TITLE_SAMPLES}
          holdMs={IDENTITY_SUBTITLE_DWELL_MS}
          speed={IDENTITY_SUBTITLE_SPEED}
          yTravel={0.32}
          enter={IDENTITY_ENTER}
          exit={IDENTITY_EXIT}
          className="h-full w-full"
          titleClassName={cn(
            subtitleClassName,
            'whitespace-nowrap text-center',
          )}
        />
      </div>
    </div>
  )
}
