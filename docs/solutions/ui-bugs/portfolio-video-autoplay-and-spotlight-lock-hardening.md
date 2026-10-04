---
title: Portfolio video autoplay, rapid spotlight clicks, and stale ratio reconciliation
date: 2026-08-20
category: ui-bugs
module: portfolio spotlight
problem_type: ui_bug
component: frontend_stimulus
severity: high
symptoms:
  - "Multiple portfolio videos autoplayed simultaneously, overwhelming the browser and burning CPU."
  - "Rapid project card clicks left orphaned settle timers that disrupted later jumps' cleanup path."
  - "IntersectionObserver callbacks during a programmatic jump skipped ratio updates, so unlock picked stale data."
root_cause: async_timing
resolution_type: code_fix
tags:
  - react
  - portfolio-spotlight
  - intersection-observer
  - video-autoplay
  - smooth-scroll
  - async-race
  - resource-management
---

# Portfolio video autoplay, rapid spotlight clicks, and stale ratio reconciliation

## Problem

After adding the full Pennant media set (multiple muted `.webm` frames), three compounding bugs surfaced: (A) every video autoplayed on mount without viewport gating; (B) rapidly clicking project cards left orphaned settle timers and `scrollend` listeners that cleared later jumps' programmatic locks too early; (C) the media `IntersectionObserver` callback returned early while the lock was set, skipping ratio-map updates so unlock reconciliation used stale data.

## Symptoms

- Scrolling the portfolio revealed several autoplaying videos at once, degrading performance and battery on mobile.
- Clicking a distant project card, then immediately clicking another before settle, could disrupt the second jump’s settle timer / `scrollend` listener via shared refs, so the later jump never got a clean unlock+reconcile path.
- After a programmatic jump settled, the active project could still be wrong because ratios were not refreshed during the lock window.

## What Didn't Work

- **Video autoplay (A):** The `autoPlay` attribute treated every video as eager-play. Browser throttling helped but did not prevent concurrent decode when many frames mounted together.
- **Timer/listener cleanup (B):** Storing timers in refs worked for a single jump, but a second `selectProject` overwrote the shared refs and left the first jump’s settle timer / `scrollend` handler alive. Those orphaned callbacks could cancel the newer jump’s timer or leave duplicate listeners. (The lock id itself was already gated by `projectId`, so the failure was disrupted cleanup—not clearing a different lock id.)
- **IO ratio updates (C):** `if (disposed || programmaticLockRef.current) return` stopped selection flicker but also skipped `ratiosByElement` updates, leaving pre-jump data for post-unlock `pickBestProject`.

## Solution

Three coordinated fixes. Verified on branch `feat/portfolio-home` in the change that gated videos and hardened jump-lock cleanup (as of 2026-08-20; not yet on `main`).

### A) Gate video playback with IntersectionObserver

`MediaBlock` controls video lifecycle with an IntersectionObserver that plays when visible and pauses when not:

```25:54:src/components/portfolio/MediaBlock.tsx
  useEffect(() => {
    const video = videoRef.current
    if (!video || !isVideo) return

    const syncPlayback = (shouldPlay: boolean) => {
      if (shouldPlay) {
        void video.play().catch(() => {})
      } else {
        video.pause()
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        syncPlayback(
          Boolean(entry?.isIntersecting && entry.intersectionRatio > 0),
        )
      },
      {
        threshold: [0, 0.01, 0.25],
        rootMargin: '200px 0px',
      },
    )
    observer.observe(video)

    return () => {
      observer.disconnect()
      video.pause()
    }
  }, [isVideo, mediaSrc])
```

**Before:** `<video autoPlay loop muted playsInline />` started decode on mount.

**After:** removed `autoPlay`, added `preload="metadata"`, and play only when `isIntersecting && intersectionRatio > 0` (with a `200px` root margin). Cleanup pauses on unmount.

### B) Clear previous timers/listeners before arming a new jump

```107:115:src/hooks/useActiveProject.ts
  const selectProject = (projectId: string) => {
    if (settleTimerRef.current !== null) {
      clearTimeout(settleTimerRef.current)
      settleTimerRef.current = null
    }
    if (scrollEndListenerRef.current && scrollRoot) {
      scrollRoot.removeEventListener('scrollend', scrollEndListenerRef.current)
      scrollEndListenerRef.current = null
    }

    programmaticLockRef.current = projectId
```

`clearLock` also identity-checks the local `settleTimer` / `onScrollEnd` so an orphaned callback is a no-op, then reconciles selection via `pickBestProjectRef.current()` when this jump unlocks.

### C) Update ratios during lock; defer only selection

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

**Before:** the whole callback bailed while locked.

**After:** ratios always update; only `pickBestProject()` is deferred. Unlock calls `pickBestProjectRef.current()` once with the fresh map.

## Why This Works

Root cause is **async_timing** across three axes:

- **A)** `autoPlay` had no scroll concept; tying play/pause to intersection limits concurrent video decode to frames near the viewport (including a `200px` root-margin prefetch band—tall clips can still overlap that band).
- **B)** Cancelling prior cleanup before arming the next jump, plus identity checks in `clearLock`, stops an older timer/listener from tearing down the newer jump’s settle path.
- **C)** Decoupling ratio updates from selection deferral keeps the map accurate during smooth scroll so unlock reconciliation matches the settled viewport.

The three bugs compound: adding many autoplay videos (A) made rapid jumps more common, which exposed orphaned cleanup (B) and widened the window for stale ratio reconciliation (C).

## Prevention

- Do not use `autoPlay` when many videos can mount at once; gate with IntersectionObserver and pause on unmount. Treat concurrent decode as the bottleneck: watch how many `<video>` elements are playing at once (and mobile CPU) when media count or frame height grows.
- `rootMargin` trades play-ahead readiness for a wider concurrent-play window—re-check margin if portfolio media density increases.
- When a user action arms async cleanup (timers, listeners), cancel the previous action's cleanup first; make orphaned cleanup identity-safe.
- When locking selection during programmatic scroll, keep updating the observer's data map; only defer the selection write.
- Keep regression tests in `src/test/portfolio-spotlight.test.tsx`: rapid successive card clicks keep the later jump armed; unlock reconciles from ratios collected during the lock.
- Keep layout coverage that Pennant videos use `preload="metadata"` and are not `autoplay`.

## Related Issues

- [Portfolio spotlight reveal and scroll state](portfolio-spotlight-reveal-and-scroll-state.md) — introduced the programmatic lock; this learning hardens that lock under many media frames and adds viewport-gated video playback.
