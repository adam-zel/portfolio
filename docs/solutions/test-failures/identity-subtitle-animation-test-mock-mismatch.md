---
title: Identity subtitle animation tests silent-pass on holdMs alone
date: 2026-08-09
category: test-failures
module: "Portfolio / Identity Subtitle"
problem_type: test_failure
component: testing_framework
severity: medium
symptoms:
  - "Vitest MaskRevealUp mock advanced on holdMs while TextAnimator mounts the next title only after enter + hold + exit + microDelay"
  - "Identity tests asserted after 3000ms and stayed green without matching production swap timing"
  - "TextAnimator applied Math.random()*400 launch delay in product usage, blanking the first title up to 400ms"
  - "setFailed(true) in loop.catch could run after unmount under StrictMode"
root_cause: test_isolation
resolution_type: test_fix
tags:
  - vitest
  - animation-testing
  - silent-pass
  - text-animator
  - mask-reveal-up
  - identity-subtitle
  - fake-timers
---

# Identity subtitle animation tests silent-pass on holdMs alone

## Problem

After the identity subtitle moved to Animata `MaskRevealUp` / `TextAnimator`, Vitest kept a global mock that advanced titles on `holdMs` alone. Tests claimed a ~3s dwell while production only mounts the next title after enter + hold + exit + microDelay. Separately, product launches still used the demo 0–400ms stagger (blank first paint) and `setFailed` could race after unmount.

## Symptoms

- Advancing fake timers by `IDENTITY_SUBTITLE_DWELL_MS` (3000) expected the next title; production sequential swap needs enter + hold + exit + microDelay first
- First paint could show an empty subtitle for up to ~400ms
- StrictMode could warn when `setFailed(true)` ran after the effect cleaned up

## What Didn't Work

- Treating `holdMs` as the full cycle period in the mock — tests stayed green while the contract under test was the mock’s clock, not `TextAnimator`
- Guarding only `controller.cancelled` in `loop.catch` — cleanup can set cancelled after the check but before `setFailed`
- Reusing demo launch stagger for product tiles — visual variety for demos blanked the live identity line

## Solution

Shared advance constant and mock/tests aligned to the sequential path; product launch delay 0; dual unmount guard.

```49:53:src/data/identityTitles.ts
export const IDENTITY_SUBTITLE_ADVANCE_MS =
  IDENTITY_SUBTITLE_ENTER_MS +
  IDENTITY_SUBTITLE_DWELL_MS +
  IDENTITY_SUBTITLE_EXIT_MS +
  MASK_REVEAL_MICRO_DELAY_MS
```

```33:48:src/test/setup.ts
    // Mirror TextAnimator sequential timing: enter + hold + exit + microDelay.
    const advanceMs =
      holdMs === IDENTITY_SUBTITLE_DWELL_MS
        ? IDENTITY_SUBTITLE_ADVANCE_MS
        : IDENTITY_SUBTITLE_ADVANCE_MS -
          IDENTITY_SUBTITLE_DWELL_MS +
          holdMs

    useEffect(() => {
      if (samples.length <= 1) return
      const id = window.setInterval(() => {
        setIndex((current) => (current + 1) % samples.length)
      }, advanceMs)
```

```28:36:src/test/portfolio-identity-subtitle.test.tsx
  it('advances to Coffee Drinker after enter + dwell + exit', () => {
    render(<PortfolioPage forceBendOff />)
    act(() => {
      vi.advanceTimersByTime(IDENTITY_SUBTITLE_ADVANCE_MS)
    })
    expect(screen.getByTestId('identity-subtitle-morph')).toHaveTextContent(
      IDENTITY_TITLES[1]!,
    )
  })
```

```980:992:src/components/animata/text/text-animator.tsx
      void loop.catch((error) => {
        if (!mounted || controller.cancelled) return;
        console.error(`Failed to run text animation "${spec.id ?? "unknown"}"`, error);
        setFailed(true);
        cleanupLoop(controller);
      });
    };

    schedule(controller, launch, isDemo ? Math.random() * 400 : 0);
```

Related deploy footgun fixed in the same pass: stage `public/project-icons/` and assert each `PROJECTS[].logo` exists on disk (`src/test/portfolio-layout.test.tsx`).

Fix lives on `feat/portfolio-home` / [PR #1](https://github.com/adam-zel/portfolio/pull/1) (unmerged as of this writing).

## Why This Works

`IDENTITY_SUBTITLE_DWELL_MS` is the readable hold after enter, not the time until the next title mounts. Exporting `IDENTITY_SUBTITLE_ADVANCE_MS` from the same BASE_SPEC durations `MaskRevealUp` uses makes the mock’s interval match when sequential mode actually swaps text. Immediate non-demo launch removes the blank window. Checking `mounted` before `setFailed` closes the StrictMode race that `cancelled` alone missed.

## Prevention

- When mocking a multi-phase animator, export the full advance formula (enter + hold + exit + delays), not only the readable hold
- Name tests after the phases they advance (“after enter + dwell + exit”), not a round marketing number alone
- Keep demo-only stagger behind an explicit demo class; product mounts should launch at delay 0
- In async effect catch paths, guard with both a local `mounted` flag and any controller cancel flag
- If UI paths reference `public/` assets, assert those files exist in CI so untracked logos cannot silent-pass layout tests

## Related Issues

- Sibling patterns: [Cuelume card sounds without double-firing](../best-practices/portfolio-cuelume-card-sounds-without-double-firing.md) (mock/attribute contracts); [Spotlight reveal and scroll state](../ui-bugs/portfolio-spotlight-reveal-and-scroll-state.md) (timing/coupling, different surface)
- Spec sources: `mask-reveal-up.tsx` BASE_SPEC enter/exit/microDelay; `text-animator.tsx` sequential `runGenericLoop`
