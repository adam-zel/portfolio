import MaskRevealUp from '@/components/animata/text/mask-reveal-up'
import {
  IDENTITY_TITLES,
  LONGEST_IDENTITY_TITLE,
} from '@/data/identityTitles'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const DWELL_MS = 3000

const subtitleClassName =
  'text-[26px] leading-[125%] tracking-[-0.325px] font-normal text-[color:var(--color-ink-muted)]'

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
      className="inline-grid place-items-center"
    >
      <span
        aria-hidden
        className={`${subtitleClassName} invisible col-start-1 row-start-1 whitespace-nowrap`}
      >
        {LONGEST_IDENTITY_TITLE}
      </span>
      <div className="relative col-start-1 row-start-1 h-[1.25em] w-full overflow-hidden">
        <MaskRevealUp
          text={[...IDENTITY_TITLES]}
          holdMs={DWELL_MS}
          className="h-full w-full"
          titleClassName={subtitleClassName}
        />
      </div>
    </div>
  )
}
