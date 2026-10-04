---
title: Portfolio spotlight must couple reveal with active scroll state
date: 2026-08-09
last_updated: 2026-08-20
category: ui-bugs
module: portfolio spotlight
problem_type: ui_bug
component: frontend_stimulus
severity: medium
symptoms:
  - "The active right-column project could have a hidden left card with opacity-0 and aria-hidden."
  - "Click-to-jump scrolling could flicker the active project while IntersectionObserver callbacks raced the programmatic scroll."
  - "All spotlight cards could be hidden on the first paint until useEffect ran."
root_cause: async_timing
resolution_type: code_fix
tags:
  - react
  - portfolio-spotlight
  - intersection-observer
  - smooth-scroll
  - animation-state
  - accessibility
---

# Portfolio spotlight must couple reveal with active scroll state

## Problem

The desktop portfolio spotlight coupled left-column card reveal with right-column media scroll selection. Scroll-driven `IntersectionObserver` updates could mark a project active while its left card was still unrevealed (and non-interactive); click-to-jump `scrollIntoView({ behavior: 'smooth' })` raced the media observer so intermediate sections stole `activeProjectId`; and reveal state mounted empty until a post-paint effect, so first paint showed every card hidden.

## Symptoms

- Scrolling the right media column could activate a project whose left card stayed visually hidden / `aria-hidden` until that card independently intersected the left column.
- Clicking a below-fold project card jumped media with smooth scroll, then an intermediate media block briefly (or lastingly) became `aria-current` before settle.
- On first paint with spotlight reveal enabled, the project list appeared empty or fully unrevealed until a later `useEffect` pass, producing a flash of hidden cards.

## What Didn't Work

- Treating reveal as a pure left-column intersection concern (active project derived only from media IO) left the two columns desynced: media could win the ratio race while the matching card had never been added to `revealedIds`.
- Relying on post-paint `useEffect` for initial visibility measurement deferred the first reveal pass until after paint, so cards mounted as unrevealed even when already in the left viewport.
- Letting the media `IntersectionObserver` keep writing `activeProjectId` during programmatic smooth scroll allowed transient intersection ratios to override the user's click target until scroll settled.

## Solution

Three coordinated code fixes keep reveal, active selection, and programmatic scroll in lockstep. Wiring starts in `PortfolioPage`, which passes the current active id into reveal:

```33:38:src/components/portfolio/PortfolioPage.tsx
  const revealedIds = useCardReveal({
    projects: PROJECTS,
    activeProjectId,
    reducedMotion,
    enabled: true,
  })
```

**Before (reveal / first paint — behavioral):** reveal observed cards in `useEffect` and only grew `revealedIds` from left-column intersections; `activeProjectId` was not an input. First paint therefore started from an empty set whenever motion was enabled.

**After:** `useCardReveal` uses `useLayoutEffect` for the observer + initial geometry pass, accepts optional `activeProjectId`, unions that id into the revealed set, and scrolls an off-screen active card into the left column with `behavior: 'auto'`:

```38:39:src/hooks/useCardReveal.ts
  useLayoutEffect(() => {
    if (!enabled || reducedMotion) {
```

```101:124:src/hooks/useCardReveal.ts
  // Keep the featured project visible and focusable even when it is below the left fold.
  useLayoutEffect(() => {
    if (!enabled || !activeProjectId || reducedMotion) return

    setRevealedIds((current) => revealIds(current, [activeProjectId]))

    const column = document.querySelector('[data-testid="left-column"]')
    if (!(column instanceof HTMLElement)) return

    const card = column.querySelector(
      `[data-testid="project-card-${CSS.escape(activeProjectId)}"]`,
    )
    if (!(card instanceof HTMLElement)) return

    const rootRect = column.getBoundingClientRect()
    const rect = card.getBoundingClientRect()
    const inView = rect.top < rootRect.bottom && rect.bottom > rootRect.top
    if (!inView && typeof card.scrollIntoView === 'function') {
      card.scrollIntoView({
        block: 'nearest',
        behavior: 'auto',
      })
    }
  }, [activeProjectId, enabled, reducedMotion])
```

`LeftColumn` also treats the active project as revealed even if the set lags a frame:

```56:59:src/components/portfolio/LeftColumn.tsx
            revealed={
              staggerReveal
                ? revealedIds.has(project.id) || project.id === activeProjectId
                : true
            }
```

**Before (click-jump — behavioral):** `selectProject` set the active id and called smooth `scrollIntoView` while the media observer continued updating from intermediate intersections.

**After:** `useActiveProject` holds a `programmaticLockRef` for the selected id, keeps updating intersection ratios while locked (but defers `pickBestProject` until unlock), and clears the lock on `scrollend` or a 700ms settle timeout. Rapid re-clicks cancel the prior settle timer / `scrollend` listener before arming the next jump (see the follow-on hardening doc linked below).

```11:11:src/hooks/useActiveProject.ts
const PROGRAMMATIC_SCROLL_SETTLE_MS = 700
```

```72:86:src/hooks/useActiveProject.ts
    const observer = new IntersectionObserver(
      (entries) => {
        if (disposed) return

        for (const entry of entries) {
          ratiosByElement.set(
            entry.target,
            entry.isIntersecting ? entry.intersectionRatio : 0,
          )
        }

        // Keep ratios fresh during programmatic jumps; only defer selection.
        if (!programmaticLockRef.current) {
          pickBestProject()
        }
      },
```

Cleanup sets `disposed = true` before disconnect so late IO callbacks cannot mutate state after teardown.

Regression coverage lives in `src/test/portfolio-spotlight.test.tsx`: media IO marks the featured card active and revealed; card click scrolls the matching media target; IO selection is deferred during an in-flight click-jump; rapid clicks keep the later jump armed.

## Why This Works

Root cause is a coupling of **async_timing** and **logic_error**: two independent scroll/IO pipelines (left reveal vs right active) plus a programmatic smooth scroll that kept feeding the active-selection observer.

- `useLayoutEffect` runs before paint, so the initial left-column geometry pass can populate `revealedIds` (and the active-union effect can run) without a hidden-card flash.
- Unioning `activeProjectId` into reveal and OR-ing it in the render path makes "featured" imply "visible and focusable," even when the card has never intersected the left fold.
- Scrolling the active card into the left column with `behavior: 'auto'` keeps the featured row in the left viewport without introducing another smooth-scroll race.
- The programmatic lock separates user intent (click) from scroll-driven *selection* until `scrollend` or the settle fallback, while ratios keep updating so unlock can reconcile from fresh data.
- The `disposed` flag closes the classic "observer fired after unmount/effect cleanup" window for the same hook.

## Prevention

- Keep spotlight selection and card reveal coupled at the API boundary: any owner of `activeProjectId` should pass it into reveal, and the list UI should treat active as revealed.
- Prefer `useLayoutEffect` for first-paint visibility/geometry that must not flash unrevealed UI; reserve `useEffect` for work that can safely happen after paint.
- Whenever calling smooth `scrollIntoView` that shares a root with an `IntersectionObserver` driving selection state, defer selection until settle (`scrollend` + timeout fallback) but keep ratio maps fresh.
- Always gate IO callbacks with a `disposed` (or equivalent) flag on cleanup when the callback closes over `setState`.
- Preserve the spotlight regression tests in `src/test/portfolio-spotlight.test.tsx` — especially revealed-on-IO, click jump to the correct media target, and selection deferred during an in-flight click-jump.

## Related Issues

- [Portfolio video autoplay and spotlight lock hardening](portfolio-video-autoplay-and-spotlight-lock-hardening.md) — viewport-gates media playback; hardens rapid `selectProject` cleanup and post-unlock ratio reconciliation.
