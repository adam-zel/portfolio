---
title: Media frame video corners square on iOS after Glimm refactor
date: 2026-08-21
category: ui-bugs
module: portfolio media / MediaBlock
problem_type: ui_bug
component: frontend_stimulus
symptoms:
  - "Pennant WebM videos on mobile lacked rounded corners that other media frames still showed"
  - "Parent .media-frame CSS clipping alone did not clip some video layers after the Glimm refactor"
  - "User reported a couple of Pennant videos in mobile view without corner radius applied"
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags:
  - ios
  - safari
  - video
  - clip-path
  - media-frame
  - pennant
  - mobile
  - regression
related_components:
  - testing_framework
---

# Media frame video corners square on iOS after Glimm refactor

## Problem

Portfolio `MediaBlock` videos (notably Pennant WebMs) lost rounded corner clipping on mobile Safari/WebKit after the Glimm theme-sweep refactor moved clipping to the parent frame only. Users saw square corners on a couple of Pennant videos in mobile view even though the frame still declared `overflow-hidden` and `rounded-sm`.

## Symptoms

- On mobile WebKit, some Pennant project WebMs (`PEN-*.webm`) rendered with square corners instead of the shared media-frame radius.
- Other frames / still images could still look clipped while video layers ignored the parent clip.
- Regression appeared after `53ec3e2` (Glimm): shared `mediaFillClassName` used only `rounded-[inherit]`, parent `.media-frame` carried `clip-path: inset(0 round 0.375rem)`, and the section no longer used `isolate` or a video-level clip-path.
- Earlier iOS clip work (`8bd3b3e`) had already established that parent overflow alone is unreliable for `<video>` on iOS/Safari.

## What Didn't Work

- Relying on parent `overflow-hidden` + `rounded-sm` alone — mobile WebKit often ignores overflow/radius for replaced content, especially `<video>`.
- Relying on parent-only `.media-frame { clip-path: … }` after Glimm (`53ec3e2`) — clipping the frame without also clipping the media element left some WebMs with square corners.
- Using CSS variables inside `clip-path` (e.g. `inset(0 round var(--radius-sm))` as in `8bd3b3e`) — known unreliable on mobile WebKit; comments in the current tree require a literal rem value instead.
- Prior Pennant/MediaBlock sessions already stressed clip-path on this surface; weakening it during an unrelated visual refactor reopened the same WebKit failure mode. (session history)

## Solution

Shipped on `feat/portfolio-home` as `9f1fb45` (regression introduced in `53ec3e2`; original iOS clip approach in `8bd3b3e`). Those SHAs live on the feature branch until squash/rebase into git `main`. The same commit was also uploaded with `npm run deploy` to the Cloudflare Pages project `adam-zel-portfolio` production environment (custom domains). Restore stacking isolation on the frame, put explicit overflow + radius + literal clip-path back on every fill media element, and belt-and-suspenders clip in CSS for `.media-frame > img, video`. Layout tests assert every Pennant video carries the clip classes.

**Before** (post-Glimm `53ec3e2` — parent clip only):

```tsx
const mediaFillClassName =
  'absolute inset-0 block h-full w-full rounded-[inherit] object-cover'

// section classes (no isolate):
'media-frame relative w-full shrink-0 overflow-hidden rounded-sm'
```

```css
.media-frame {
  transform: translateZ(0);
  -webkit-mask-image: -webkit-radial-gradient(white, black);
  clip-path: inset(0 round 0.375rem);
}
.media-frame > img,
.media-frame > video {
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}
```

**After** (current tree / `9f1fb45`):

`mediaFillClassName` again clips the replaced element itself with literal `0.375rem` (matches `--radius-sm`; vars in clip-path avoided):

```8:15:src/components/portfolio/MediaBlock.tsx
/**
 * Fill the frame edge-to-edge. Explicit radius + clip on the replaced element —
 * iOS/Safari often ignores parent overflow for <video>.
 * 0.375rem matches --radius-sm (Tailwind rounded-sm); CSS vars in clip-path
 * are unreliable on mobile WebKit.
 */
const mediaFillClassName =
  'absolute inset-0 block h-full w-full overflow-hidden rounded-sm object-cover [clip-path:inset(0_round_0.375rem)]'
```

Frame restores `isolate` alongside overflow and radius:

```76:78:src/components/portfolio/MediaBlock.tsx
      className={cn(
        'media-frame relative isolate w-full shrink-0 overflow-hidden rounded-sm',
        'border border-[color:var(--color-border)] bg-[color:var(--color-card)]',
```

CSS clips both the frame and direct `img`/`video` children:

```205:224:src/index.css
/*
  Media frames: iOS/Safari often ignores overflow+radius on replaced content
  (especially <video>). Clip the frame and the media element; literal rem
  matches --radius-sm (CSS vars inside clip-path are unreliable on WebKit).
*/
.media-frame {
  isolation: isolate;
  transform: translateZ(0);
  -webkit-mask-image: -webkit-radial-gradient(white, black);
  clip-path: inset(0 round 0.375rem);
}

.media-frame > img,
.media-frame > video {
  border-radius: 0.375rem;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  /* Belt-and-suspenders: clip the replaced layer itself on mobile WebKit. */
  clip-path: inset(0 round 0.375rem);
}
```

## Why This Works

Mobile WebKit treats `<video>` as replaced content that frequently does not honor a parent’s `overflow` / border-radius / single-layer clip. Parent-only `.media-frame` clipping after Glimm was therefore incomplete for some WebMs. Applying the same literal `clip-path: inset(0 round 0.375rem)` (and `overflow-hidden` / `rounded-sm`) on the media node itself, plus `isolate` / `isolation: isolate` on the frame, forces the rounded geometry onto the video layer. Literal rem avoids the WebKit bug with CSS variables inside `clip-path`. Dual clip (frame + child) matches the documented “belt-and-suspenders” approach in `src/index.css`.

## Prevention

- Never simplify `MediaBlock` clipping to parent-only overflow/radius or parent-only `clip-path`; keep element-level clip classes on `mediaFillClassName` (`src/components/portfolio/MediaBlock.tsx`).
- Prefer literal rem in `clip-path` for media frames; do not reintroduce `var(--radius-*)` inside clip-path on mobile-critical surfaces.
- Keep the layout regression guard that asserts every Pennant video has the clip classes and an isolating overflow frame:

```90:102:src/test/portfolio-layout.test.tsx
    // Every Pennant video frame gets the same clip — not only the first.
    const pennantVideos = screen
      .getByTestId('right-media-stack')
      .querySelectorAll('video[src*="PEN-"]')
    expect(pennantVideos.length).toBeGreaterThan(1)
    pennantVideos.forEach((el) => {
      expect(el).toHaveClass(
        'rounded-sm',
        'overflow-hidden',
        '[clip-path:inset(0_round_0.375rem)]',
      )
      expect(el.closest('.media-frame')).toHaveClass('isolate', 'overflow-hidden')
    })
```

- When changing shared media fill classes during theme/visual refactors (e.g. Glimm), verify rounded corners on real iOS Safari with multiple WebMs, not only desktop Chromium or a single first video.

## Related Issues

- [Portfolio video autoplay and spotlight lock hardening](portfolio-video-autoplay-and-spotlight-lock-hardening.md) — same MediaBlock/Pennant video surface; covers playback gating, not WebKit clip-path.
- [Portfolio spotlight reveal and scroll state](portfolio-spotlight-reveal-and-scroll-state.md) — media stack selection context MediaBlock sits in.
- [Glimm cancel leaves overlay; instant theme path must clear](glimm-overlay-stuck-after-instant-theme-switch.md) — temporal context only (Glimm refactor era); different root cause.
