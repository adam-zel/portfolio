---
title: Pennant WebM videos blank on mobile Safari because they were AV1
date: 2026-10-04
category: ui-bugs
module: portfolio media / Pennant WebM
problem_type: ui_bug
component: frontend_stimulus
symptoms:
  - "Pennant videos rendered as empty rounded cards while scrolling on mobile and mobile web"
  - "Desktop Chromium played the same .webm files normally"
  - "Video elements stayed at readyState HAVE_METADATA and never painted a frame on WebKit"
root_cause: missing_validation
resolution_type: code_fix
severity: high
tags:
  - ios
  - safari
  - webkit
  - webm
  - av1
  - vp9
  - video
  - pennant
  - mobile
  - codec
related_components:
  - testing_framework
---

# Pennant WebM videos blank on mobile Safari because they were AV1

## Problem

Pennant portfolio videos (`PEN-*.webm`) appeared as empty media frames on mobile Safari / WebKit while scrolling. The rounded `.media-clip` shell was correct; the `<video>` never painted, so users saw only the card background and reported “missing” images/videos.

## Symptoms

- On iPhone / mobile WebKit, Pennant video frames stayed blank (card-colored) after scroll-into-view.
- Chromium (desktop and agent browsers) decoded and played the same assets, so the bug was easy to miss in Chromium-only checks.
- WebKit `HTMLVideoElement` reported `readyState === 1` (`HAVE_METADATA`) with a known `videoWidth`, but `canvas.drawImage` sampled near-black/empty until a Safari-playable codec was served.
- `canPlayType('video/webm; codecs="av01.0.05M.08"')` returned `""` on WebKit while `vp9` / `vp8` / H.264 returned `"probably"`.

## What Didn't Work

- Treating blank frames as another iOS clip-path / `-webkit-mask` / `translateZ(0)` compositing regression — stripping those styles on WebKit did not restore paint when the bitstream was still AV1.
- Relying on “it is `.webm` and muted `playsInline`” as a mobile-compatibility signal — container format is not the codec.
- Chromium-only scroll/screenshot verification — Chromium plays AV1-in-WebM, so blank Safari frames never showed up there.
- Layout tests that only asserted `src` paths and clip class names — they never opened the file to check Matroska `CodecID`.

## Solution

Shipped on `feat/portfolio-home` in PR [#1](https://github.com/adam-zel/portfolio/pull/1) (pending merge to git `main`). Re-encode every Pennant `.webm` from **AV1 → VP9** (same public paths), and add a regression test that fails if any portfolio `.webm` still contains Matroska `V_AV1` or lacks `V_VP8`/`V_VP9`.

Verified prediction: fulfilling `PEN-08.webm` with a VP9 re-encode made Playwright WebKit paint immediately (`readyState: 4`, non-card pixels). After replacing all six assets, WebKit iPhone emulation painted every Pennant video (`BLANK_COUNT 0`).

```25:45:src/test/portfolio-layout.test.tsx
  it('uses Safari-playable codecs for portfolio WebM videos (no AV1-in-WebM)', () => {
    const webms = PROJECTS.flatMap((project) =>
      (project.media ?? project.images ?? []).filter((src) =>
        src.toLowerCase().endsWith('.webm'),
      ),
    )
    expect(webms.length).toBeGreaterThan(0)

    for (const src of webms) {
      const mediaPath = path.join(process.cwd(), 'public', src.replace(/^\//, ''))
      const bytes = readFileSync(mediaPath)
      expect(
        bytes.includes(WEBM_AV1_CODEC_ID),
        `${src} is AV1-in-WebM; mobile Safari cannot decode it — use VP8/VP9 WebM or H.264 MP4`,
      ).toBe(false)
      expect(
        bytes.includes(Buffer.from('V_VP9')) || bytes.includes(Buffer.from('V_VP8')),
        `${src} should be VP8 or VP9 WebM for mobile Safari`,
      ).toBe(true)
    }
  })
```

## Why This Works

Mobile Safari supports WebM with VP8/VP9 in recent versions, but **not AV1 inside WebM**. Export pipelines (and “WebM = web video”) often default to AV1 for size; Chromium hides the failure. The empty card was not a React/CSS paint bug — decode never produced a frame. VP9-in-WebM matches what WebKit advertises via `canPlayType`, so `play()` reaches `HAVE_CURRENT_DATA` / `HAVE_ENOUGH_DATA` and the existing `media-clip` radius shows real content.

## Prevention

- Before shipping portfolio `.webm` assets, confirm codec with `ffprobe` (`codec_name=vp8|vp9`) or the Matroska `CodecID` bytes (`V_VP8` / `V_VP9`, never `V_AV1`).
- Keep the layout regression test that scans every project `.webm` for `V_AV1`.
- Verify media on real Safari / WebKit (or Playwright `webkit` + iPhone device), not only Chromium.
- Prefer H.264 MP4 (`<source type="video/mp4">`) when maximum device coverage matters more than WebM-only delivery.

## Related Issues

- [Portfolio video autoplay and spotlight lock hardening](portfolio-video-autoplay-and-spotlight-lock-hardening.md) — playback gating for the same Pennant video surface; does not cover codec compatibility.
- [Media frame video corners square on iOS after Glimm refactor](media-frame-video-corner-clip-ios-regression.md) — WebKit clip-path / radius on media frames; blank AV1 frames can look like a clip failure until the codec is checked.
