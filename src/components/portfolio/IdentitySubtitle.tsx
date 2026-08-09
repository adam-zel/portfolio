import { useEffect, useState } from 'react'
import { TextMorph } from 'torph/react'
import {
  IDENTITY_TITLES,
  LONGEST_IDENTITY_TITLE,
} from '@/data/identityTitles'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const DWELL_MS = 3000

const subtitleClassName =
  'text-[26px] leading-[125%] tracking-[-0.325px] text-[color:var(--color-ink-muted)]'

export function IdentitySubtitle() {
  const reducedMotion = usePrefersReducedMotion()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reducedMotion) {
      setIndex(0)
      return
    }

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % IDENTITY_TITLES.length)
    }, DWELL_MS)

    return () => window.clearInterval(id)
  }, [reducedMotion])

  const title = IDENTITY_TITLES[reducedMotion ? 0 : index]

  return (
    <p className={`${subtitleClassName} inline-grid place-items-center`}>
      <span
        aria-hidden
        className="invisible col-start-1 row-start-1 whitespace-nowrap"
      >
        {LONGEST_IDENTITY_TITLE}
      </span>
      <TextMorph
        as="span"
        className="col-start-1 row-start-1"
        disabled={reducedMotion}
      >
        {title}
      </TextMorph>
    </p>
  )
}
