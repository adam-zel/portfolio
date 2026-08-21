---
title: Glimm cancel leaves overlay; instant theme path must clear
date: 2026-08-21
category: ui-bugs
module: portfolio appearance
problem_type: ui_bug
component: frontend_stimulus
severity: medium
symptoms:
  - "Arrow-key theme change during an in-flight pointer sweep left a frozen prism band on screen."
  - "html.dark flipped instantly while the Glimm shader band stayed at non-zero alpha/progress."
  - "Appearance Vitest cases asserted immediate class flips after click and never exercised deferred midpoint apply."
root_cause: async_timing
resolution_type: code_fix
related_components:
  - testing_framework
tags:
  - react
  - glimm
  - theme-toggle
  - appearance
  - shader-overlay
  - animation-cancel
  - vitest
  - jsdom
---

# Glimm cancel leaves overlay; instant theme path must clear

## Problem

Keyboard theme toggles cancel an in-flight Glimm sweep and apply Resolved appearance immediately, but Glimm's `cancel()` intentionally leaves shader alpha/progress so a follow-up sweep can continue. Without an explicit overlay clear, a stuck prism band remains on screen after the instant path.

## Symptoms

- Pointer click starts a deferred midpoint sweep; arrow keys then flip Session override and `html.dark` instantly while a frozen band stays visible.
- `SweepHandle.cancel()` stops the animation loop without zeroing shader uniforms (documented Glimm contract).
- Vitest appearance tests passed on immediate class assertions because jsdom takes Glimm's no-WebGL instant path, masking deferred midpoint and cancel/clear races.

## What Didn't Work

Relying on `cancel()` alone for keyboard interrupt. Glimm documents that cancel leaves alpha/progress untouched for continuation sweeps (`node_modules/glimm/dist/react.d.ts:89-94`), and the cancel implementation only sets a cancelled flag and cancels rAF — it does not call `setAlpha(0)` / `setProgress(0)`.

Relying on jsdom's missing WebGL to "cover" theme toggles. Production uses deferred `onMidpoint` navigation; tests that only assert the post-click DOM class never exercise that contract.

## Solution

On the ThemeToggle `animate: false` path, cancel the active handle, clear the overlay, then apply appearance:

```46:52:src/components/portfolio/ThemeToggle.tsx
    if (!animate) {
      activeSweepRef.current?.cancel()
      activeSweepRef.current = null
      // cancel() leaves shader alpha/progress — clear so the band does not stick.
      clearGlimmOverlay()
      applyAppearance(mode)
      return
    }
```

`clearGlimmOverlay` zeros the live controller held by `GlimmRoot`:

```20:23:src/components/portfolio/GlimmRoot.tsx
export function clearGlimmOverlay() {
  glimmController?.setAlpha(0)
  glimmController?.setProgress(0)
}
```

Appearance tests mock `glimm/react` with a deferred `fireMidpoint()` handle (pending `done` until midpoint or cancel) and assert arrow-key interrupt calls `cancel` + `clearGlimmOverlay`, applies instantly, and ignores a stale midpoint from the cancelled sweep (`src/test/portfolio-appearance.test.tsx`).

Also stage `GlimmRoot.tsx` whenever `PortfolioPage` imports it — an untracked provider breaks clean checkouts.

_Fix pending on branch `feat/portfolio-home` (unmerged as of this writing)._

## Why This Works

Pointer → pointer cancellation wants continuation: leave the band so the next sweep can pick up. Keyboard Instant theme path wants no motion: cancel the loop **and** clear uniforms so nothing remains. Separating those two outcomes matches Glimm's API instead of fighting it.

Deferred midpoint mocks force tests through the same `sweep` / `cancel` / navigate contract production uses, instead of the silent no-WebGL shortcut.

## Prevention

- After any Instant theme path that calls `cancel()`, also call `clearGlimmOverlay()` (or equivalent `setAlpha(0)` / `setProgress(0)`).
- Mock Glimm with controllable deferred midpoint in appearance tests; never treat jsdom WebGL failure as coverage of midpoint timing.
- Keep `GlimmRoot` tracked with any `PortfolioPage` / ThemeToggle change that imports it.
- Regression fence: `portfolio-appearance.test.tsx` arrow-key case asserting cancel + clear + inert cancelled midpoint.

## Related Issues

- [Identity subtitle animation tests silent-pass on holdMs alone](../test-failures/identity-subtitle-animation-test-mock-mismatch.md) — same class of false-green when tests advance only part of a multi-phase async contract.
- [Wire Cuelume cues on ProjectCard without double-firing toggle](../best-practices/portfolio-cuelume-card-sounds-without-double-firing.md) — ThemeToggle keyboard uses imperative `play('toggle')` for Enter/Space; unrelated overlay lifecycle but shared control surface.
