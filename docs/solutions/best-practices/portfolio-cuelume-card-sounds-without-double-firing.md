---
title: Wire Cuelume cues on ProjectCard without double-firing toggle
date: 2026-08-09
category: best-practices
module: portfolio cuelume sounds
problem_type: best_practice
component: frontend_stimulus
severity: low
applies_when:
  - "Wiring Cuelume interaction sounds on portfolio ProjectCards or similar focusable cards"
  - "Avoiding double-fired hover/press/toggle cues from declarative attrs plus imperative play()"
  - "Testing sound wiring with vi.mock('cuelume') for attributes and play-call contracts"
  - "Deciding whether prefers-reduced-motion should silence interaction sounds (it should not)"
tags:
  - cuelume
  - portfolio
  - project-card
  - interaction-sounds
  - keyboard-a11y
  - vitest
  - reduced-motion
related_components:
  - testing_framework
---

# Wire Cuelume cues on ProjectCard without double-firing toggle

## Context

The portfolio home work on `feat/portfolio-home` introduces Cuelume sound cues on project cards: a hover tick, a press cue for pointer activation, and a keyboard toggle cue. As of 2026-08-09 that wiring is present in the local checkout on `feat/portfolio-home` (which is also this repo’s GitHub default branch name) but was not yet on the remote tip of `origin/feat/portfolio-home` or `origin/main`; confirm the remote tip before treating it as trunk truth.

The hard part is not installing the library — it is splitting responsibility so mouse and keyboard paths never both call `play('toggle')` for one activation. Buttons that use Cuelume’s declarative press attribute already emit press audio on pointer down. If `onClick` also calls `play('toggle')`, a mouse click plays press *and* toggle. Keyboard activation needs an explicit `play('toggle')` because there is no press attribute path for Enter/Space the same way. The durable pattern is: declarative attributes for hover/press, imperative `play('toggle')` only on keyboard, and selection logic only on `onClick`.

A second friction point is motion preference. Visual motion may respect `prefers-reduced-motion`, but these cues are intentional audio feedback. Gating sound behind reduced-motion would silence keyboard and attribute cues for users who only asked to reduce motion, which the portfolio tests explicitly reject.

Card cues must stay additive relative to Spotlight, Card reveal, and Programmatic scroll lock — sound wiring must not alter selection or reveal contracts.

## Guidance

### Bind once at the app shell

Install `cuelume`, then call `bind()` once at the app shell on mount. In this codebase, `App` imports `bind` and runs it inside a mount-only `useEffect` with an empty dependency array (`src/App.tsx:2`, `src/App.tsx:6-8`). Do not call `bind()` from individual cards; the library’s `bind` is idempotent, but leaf binds still make ownership unclear. The portfolio Cuelume suite asserts that rendering `<App />` invokes `bind` (`src/test/portfolio-cuelume.test.tsx:25-28`).

### Declarative hover and press on the card; never toggle via attribute

On `ProjectCard`, the interactive element is a `<button>` that carries:

- `data-cuelume-hover="tick"` (`src/components/portfolio/ProjectCard.tsx:33`)
- `data-cuelume-press=""` (`src/components/portfolio/ProjectCard.tsx:34`)

It must **not** set `data-cuelume-toggle`. The test suite locks that contract: revealed cards have hover tick and press attributes, and must not have a toggle attribute (`src/test/portfolio-cuelume.test.tsx:30-36`). Press is pointer-path audio; toggle is reserved for the keyboard path below.

### Keyboard toggle is imperative and gated

Import `play` from `cuelume` (`src/components/portfolio/ProjectCard.tsx:2`) and handle keyboard activation in `onKeyDown` (`src/components/portfolio/ProjectCard.tsx:42`). The handler (`src/components/portfolio/ProjectCard.tsx:21-26`) applies three gates before calling `play('toggle')`:

1. The card must be revealed (`if (!revealed) return`).
2. The key must be Enter or Space (`if (event.key !== 'Enter' && event.key !== ' ') return`).
3. The event must not be a key-repeat (`if (event.repeat) return`).

Only then call `play('toggle')`. Selection stays on `onClick`: when revealed, `onClick` calls `onSelect?.(project.id)` and does nothing else (`src/components/portfolio/ProjectCard.tsx:38-41`). **Do not** put `play('toggle')` on `onClick`. A pointer click already gets press from `data-cuelume-press`; adding toggle on click doubles the cue.

### Reduced motion does not gate sound

Cue attributes and keyboard `play('toggle')` remain active when `prefers-reduced-motion` is mocked on (`src/test/portfolio-cuelume.test.tsx:66-77`). If you later gate visual animation, keep audio cues independent unless product requirements explicitly change.

### Test the split with a Cuelume mock

In Vitest, mock the module once at the top of the suite:

```ts
vi.mock('cuelume', () => ({
  bind: (...args: unknown[]) => bind(...args),
  play: (...args: unknown[]) => play(...args),
}))
```

(`src/test/portfolio-cuelume.test.tsx:13-16`). Clear `bind` and `play` in `beforeEach` (`src/test/portfolio-cuelume.test.tsx:19-23`). Assert:

| Expectation | Where |
|-------------|--------|
| `bind` runs on app mount | `src/test/portfolio-cuelume.test.tsx:25-28` |
| Hover/press attrs present; no toggle attr | `src/test/portfolio-cuelume.test.tsx:30-36` |
| Click selects but does not `play('toggle')` | `src/test/portfolio-cuelume.test.tsx:38-47` |
| Enter and Space each `play('toggle')` once and activate | `src/test/portfolio-cuelume.test.tsx:49-64` |
| Reduced motion still has attrs and keyboard toggle | `src/test/portfolio-cuelume.test.tsx:66-77` |
| Unrevealed card: no play, no select on Enter | `src/test/portfolio-cuelume.test.tsx:79-92` |
| `repeat: true` Enter does not play | `src/test/portfolio-cuelume.test.tsx:94-101` |
| Non-activation keys (`a`, `Tab`) do not play or select | `src/test/portfolio-cuelume.test.tsx:103-115` |

That matrix is the regression fence for the double-fire bug class.

## Why This Matters

Cuelume’s declarative press cue and an imperative toggle call operate on different layers. Collapsing them onto `onClick` produces a double sound on every mouse activation while still looking “correct” in a casual manual check if you only listen for “some sound happened.” Separating paths keeps pointer press and keyboard toggle each once, preserves selection behavior for both input modes, and keeps tests able to assert “click must not call toggle” as a hard invariant.

Binding once at the shell keeps cue wiring a single lifecycle concern. Spreading `bind()` into leaf components invites duplicate registration and makes mount-order tests brittle.

Leaving audio ungated by reduced motion matches the product intent encoded in tests: reduced motion is about motion, not about silencing activation feedback. Future agents that wrap `play` in a motion media-query check would break that contract.

## When to Apply

- Adding or changing Cuelume attributes on portfolio `ProjectCard` or any similar selectable button that already uses `data-cuelume-press`.
- Introducing keyboard sound for a control that also has declarative press/hover cues.
- Extending the portfolio Cuelume Vitest suite, or adding Cuelume to another interactive surface in this repo.
- Reviewing changes on `feat/portfolio-home` (or successors) that touch `src/App.tsx`, `ProjectCard.tsx`, or `portfolio-cuelume.test.tsx`.

Do not apply a “call `play` in every handler” shortcut when declarative attributes already cover the pointer path.

## Examples

### Correct: shell bind + card attributes + keyboard-only toggle

App mount (verified):

```tsx
// src/App.tsx:5-8
function App() {
  useEffect(() => {
    bind()
  }, [])
```

Card surface (verified attributes and handlers):

```tsx
// src/components/portfolio/ProjectCard.tsx:21-42 (structure)
function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
  if (!revealed) return
  if (event.key !== 'Enter' && event.key !== ' ') return
  if (event.repeat) return
  play('toggle')
}

<button
  data-cuelume-hover="tick"
  data-cuelume-press=""
  onClick={() => {
    if (!revealed) return
    onSelect?.(project.id)
  }}
  onKeyDown={handleKeyDown}
>
```

### Incorrect: toggle on click (double-fires with press)

```tsx
// Anti-pattern — do not do this
onClick={() => {
  if (!revealed) return
  play('toggle') // doubles with data-cuelume-press on mouse
  onSelect?.(project.id)
}}
```

A pointer click would then get press from the attribute and toggle from the handler. The suite’s “does not play toggle on pointer click while still selecting” case (`src/test/portfolio-cuelume.test.tsx:38-47`) exists specifically to catch this.

### Incorrect: `data-cuelume-toggle` on the button

Putting toggle on the element as a data attribute fights the intentional split (press via attribute, toggle via keyboard `play`). The suite asserts the toggle attribute is absent (`src/test/portfolio-cuelume.test.tsx:35`).

### Test excerpt: click vs Enter

```tsx
// Click: selection yes, toggle play no
await user.click(screen.getByTestId('project-card-pennant'))
expect(play).not.toHaveBeenCalledWith('toggle')

// Enter: toggle once, selection via native activation
card.focus()
await user.keyboard('{Enter}')
expect(play).toHaveBeenCalledTimes(1)
expect(play).toHaveBeenCalledWith('toggle')
```

(`src/test/portfolio-cuelume.test.tsx:38-63`)

## Related

- Adjacent learning: [Portfolio spotlight must couple reveal with active scroll state](../ui-bugs/portfolio-spotlight-reveal-and-scroll-state.md) — same ProjectCard surface; Cuelume cues stay additive and must not disturb reveal, active selection, or programmatic scroll lock.
- Local (possibly unpushed) work on `feat/portfolio-home` — confirm the remote tip before treating as trunk truth.
- Defining implementation: `src/App.tsx`, `src/components/portfolio/ProjectCard.tsx`.
- Defining regression suite: `src/test/portfolio-cuelume.test.tsx` (includes non-activation keydown coverage in the working tree as of this writing).
