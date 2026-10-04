---
title: Portfolio Dark Mode - Plan
type: feat
date: 2026-08-20
topic: portfolio-dark-mode
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: ce-brainstorm
execution: code
---

# Portfolio Dark Mode - Plan

## Goal Capsule

- **Objective:** Add night-friendly dark appearance to the portfolio home using the Paper dark palette, with OS matching by default, a session-only header toggle override, and no bright first-paint flash.
- **Product authority:** This plan owns appearance theming for the existing home page chrome and the theme control. Spotlight, card reveal, media content, and hosting remain surrounding work, not active scope.
- **Open blockers:** None.
- **Product Contract preservation:** unchanged.

---

## Product Contract

### Summary

Ship a resolved light/dark appearance for the portfolio home.
Match the visitor’s OS by default and keep matching live until they use the Paper-style toggle.
A session-only override can force light or dark; the next browser session returns to OS matching.
Done means full chrome on the Paper dark tokens and no bright flash on first load when the OS is dark.

### Problem Frame

Adam leaves the portfolio bright when viewing at night because there is no dark appearance today.
The cost is eye strain on a personal site that already has a designed dark palette in Paper and a light-only token set in product chrome.

### Key Decisions

- KD1. **Resolved appearance + session override** — one effective mode (light or dark); OS drives until overridden. `(session-settled: user-directed — chosen over toggle-only, system-only, three-way System/Light/Dark, and dark-first default: matches Paper control and night-viewing goal.)` Governs R1, R2, R3, R4.
- KD2. **Session-only override** — does not remember across browser sessions; survives refresh in the same tab/session. `(session-settled: user-directed — chosen over cross-visit memory: next visit should follow OS again.)` Governs R4, R5.
- KD3. **Toggle top-right in left header** — Paper placement above the identity block. `(session-settled: user-directed — chosen over other placements: matches Paper HTV-0.)` Governs R6, R7.
- KD4. **Paper HTV-0 dark palette for portfolio chrome tokens** — ground, card, ink, muted ink, border from that artboard. `(session-settled: user-directed — chosen over inventing a separate dark palette: design source of truth is Paper.)` Governs R8, R9.
- KD5. **Full chrome + no first-paint flash** — every themed chrome surface uses the dark tokens when dark; night open must not flash bright first. `(session-settled: user-directed — chosen over partial chrome or accepting FOUC: definition of done for night viewing.)` Governs R8, R10, R11.
- KD6. **No trim of the above package** — system match, live OS sync, toggle, session override, Paper colors, full chrome, and no-flash ship together. `(session-settled: user-directed — chosen over shipping a smaller system-only cut: none of those pieces were optional.)` Governs scope.
- KD7. **Dark active/hover card elevation may be derived in planning** — Paper does not clearly separate active card from resting card in dark the way light `--color-card-active` does. `(session-settled: user-approved — accepted synthesis call-out over blocking on a design fill-in first.)` Governs R9.

### Actors

- A1. Adam / night viewer — opens the site when the OS is dark and expects immediate dark chrome.
- A2. Site visitor with a light OS — sees light by default; can force dark for the session.
- A3. Site visitor who overrides then returns later — should get OS matching again in a new browser session.

### Requirements

**Appearance resolution**

- R1. Until a session override exists, resolved appearance matches `prefers-color-scheme` (light or dark).
- R2. While no session override exists, changes to OS appearance update the portfolio live.
- R3. Activating a Paper binary toggle segment writes an explicit `light` or `dark` session override and applies that appearance; OS drives only when no override exists.
- R4. A session override is stored only for the current browser session: it survives reload in that tab/session and clears when the browser session ends.
- R5. After the session ends, the next visit resolves from the OS again with no remembered override.

**Control**

- R6. A Paper-style binary theme toggle sits at the top-right of the left-column header, above the identity block, on both light and dark appearances.
- R7. The toggle’s visual states follow the Paper light and dark toggle frames (track and selected segment).

**Chrome theming**

- R8. When resolved appearance is dark, portfolio chrome uses the Paper HTV-0 mapping: ground `#14120B`, card `#1B1913`, ink `#EDECEC`, ink-muted `#EDECEC` at ~60% opacity, border `#EDECEC` at ~8% opacity (and the corresponding light tokens when light).
- R9. Hover and active project-card surfaces have distinct dark elevations relative to resting card; if Paper does not specify a separate active value, planning may derive a close sibling to light `--color-card-active`.
- R10. All portfolio chrome that today uses the light `--color-*` family (columns, cards, identity text, media frames/borders, and related surfaces) participates in dark appearance — no leftover light patches on those surfaces.
- R11. When the OS is dark on first load and no override applies, the first paint must not flash the light ground/ink before dark tokens apply.

**Out of chrome content**

- R12. Project media, mockups, and logo assets are not recolored by theme; only chrome and frames around them switch.

### Key Flows

- F1. Night open with dark OS
  - **Trigger:** A1 opens the portfolio with OS dark and no prior session override.
  - **Actors:** A1
  - **Steps:** First paint resolves dark; left and right chrome use Paper dark tokens; toggle shows dark-side state.
  - **Outcome:** No bright flash; site is immediately night-readable.
  - **Covered by:** R1, R8, R10, R11

- F2. Session override then return later
  - **Trigger:** A2 forces the other mode with the toggle, uses the site, ends the browser session, and opens again.
  - **Actors:** A2, A3
  - **Steps:** Override applies for the session (including reloads); after session end, next visit matches OS again.
  - **Outcome:** Escape hatch without permanent preference memory.
  - **Covered by:** R3, R4, R5

- F3. Live OS change without override
  - **Trigger:** OS appearance flips while the tab is open and no toggle override is set.
  - **Actors:** A1, A2
  - **Steps:** Portfolio updates resolved appearance to match the new OS value.
  - **Outcome:** Site stays aligned with system until the visitor overrides.
  - **Covered by:** R2

### Acceptance Examples

- AE1. Dark OS, cold load
  - **Covers:** R1, R8, R11
  - **Given:** OS prefers dark; no session override.
  - **When:** The portfolio loads.
  - **Then:** First visible paint uses dark ground/ink; chrome matches Paper HTV-0 tokens.

- AE2. Toggle override in-session
  - **Covers:** R3, R4, R6
  - **Given:** Site is matching a dark OS.
  - **When:** The visitor activates the header toggle to force light, then reloads the same tab.
  - **Then:** Appearance stays light for that session; toggle remains in the left-header top-right.

- AE3. New session after override
  - **Covers:** R5
  - **Given:** The visitor previously forced light while OS was dark.
  - **When:** They close the browser session and open the site again with OS still dark.
  - **Then:** Appearance is dark again with no remembered override.

- AE4. Live OS sync
  - **Covers:** R2
  - **Given:** No session override; site is light because OS is light.
  - **When:** The OS switches to dark without a page reload.
  - **Then:** Portfolio chrome switches to dark without requiring a toggle press.

- AE5. Media unchanged
  - **Covers:** R12
  - **Given:** Dark appearance is active.
  - **When:** Project media and logos render.
  - **Then:** Asset colors are unchanged; surrounding frames/borders use dark chrome tokens.

### Success Criteria

- Night open with dark OS never shows a bright first frame of portfolio chrome.
- Left header, project list, identity text, and media frames all read as one dark composition under Paper tokens.
- Toggle is discoverable in the Paper position and overrides for the session only.

### Scope Boundaries

**In scope**

- Appearance resolution (OS + session override + live sync)
- Paper-style toggle in the left header
- Dark values for portfolio chrome tokens and full chrome coverage
- No-flash first paint when dark applies

**Deferred / out of scope**

- Remembering preference across browser sessions
- Explicit three-way System / Light / Dark control
- Dark-first default independent of OS
- Recoloring or replacing project media, mockups, or brand logos for dark
- Changes to Spotlight, card reveal, identity subtitle motion, or cue sounds beyond token-driven color

### Dependencies / Assumptions

- Paper file [Portfolio HTV-0](https://app.paper.design/file/01KZD49VMP442MJ4NN7649VYPQ/2-0/HTV-0) is the dark palette and toggle placement authority.
- Existing light portfolio tokens remain the light appearance source of truth.
- A shadcn `.dark` stub already exists in CSS; product chrome currently keys off light-only portfolio `--color-*` tokens — planning maps the product path without inventing a second competing palette story.
- “Browser session” means the storage lifetime that survives reload in the same tab and clears when that session ends (confirmed at synthesis).

### Outstanding Questions

**Resolve Before Planning**

- None.

**Resolved in Planning**

- Dark `--color-card-active` = `#26241E` and FOUC via shared resolve + blocking head script — see KTD2 / KTD3.

### Sources / Research

- Paper dark artboard and in-header toggle: https://app.paper.design/file/01KZD49VMP442MJ4NN7649VYPQ/2-0/HTV-0
- Paper dark token samples from HTV-0: ground `#14120B`, card `#1B1913`, ink `#EDECEC`, ink-muted `#EDECEC99`, border `#EDECEC14`; dark toggle track `#26241E`
- Grounding dossier (scratch): portfolio tokens light-only on `:root`; `.dark` exists for shadcn tokens only; no product theme switch yet
- Prior home plan light ground: `docs/plans/2026-08-09-001-feat-portfolio-home-plan.md` (warm off-white chrome)

---

## Planning Contract

### Key Technical Decisions

- KTD1. **Class-on-`html` + portfolio `--color-*` under `.dark`** — put `dark` on `document.documentElement`; override the portfolio token family there so existing `var(--color-*)` chrome flips without per-component rewrites. Keep one palette story; do not invent a parallel token set. Watch `@theme inline` aliases for `--color-card` / `--color-border` so Paper values win for chrome. Governs R8, R10. Instantiates KD4, KD5.
- KTD2. **Derive dark `--color-card-active` as `#26241E`** — Paper rest cards are `#1B1913`; use the Paper dark toggle track as the hover/active elevation sibling. Governs R9. `(session-settled: user-approved — chosen over blocking on a Paper fill-in: confirmed at plan HOW synthesis.)` Instantiates KD7.
- KTD3. **Shared pure resolve + blocking head bootstrap** — one pure module owns storage key, override read/write (`sessionStorage`), OS query, and class apply. A tiny blocking `<script>` in `index.html` `<head>` calls the same rules before paint; React reuses the module and must not flip the class on mount. Do not rely on `useEffect` / `useLayoutEffect` alone for R11. Governs R1, R2, R4, R5, R11. `(session-settled: user-approved — chosen over layout-effect-only FOUC mitigation: confirmed at plan HOW synthesis.)` Instantiates KD2, KD5.
- KTD4. **Binary Paper toggle writes an explicit light|dark session override** — segments map to forced appearance (including when the pressed segment matches current OS); with no override, OS drives. Live `prefers-color-scheme` listeners update only when override is absent. Governs R1–R5, R6, R7. Instantiates KD1, KD3.
- KTD5. **Additive LeftColumn header only** — toggle mounts top-right above identity; do not change Spotlight, Card reveal, Active project, Cuelume, or media asset sources. Governs R6, R12.

### High-Level Technical Design

```mermaid
flowchart TD
  boot["index.html head script"] --> resolve["resolveAppearance()"]
  react["useResolvedAppearance / toggle"] --> resolve
  resolve --> storage{"sessionStorage override?"}
  storage -->|yes| forced["forced light|dark"]
  storage -->|no| os["prefers-color-scheme"]
  forced --> class["html.classList dark"]
  os --> class
  class --> tokens[".dark portfolio --color-*"]
  tokens --> chrome["columns / cards / frames / ink"]
```

Appearance resolution is a single pure function shared by bootstrap and React.
Directionally: `override ?? (matchMedia dark ? 'dark' : 'light')` → toggle `html.dark` → CSS tokens drive chrome.

### Assumptions

- `sessionStorage` is the correct “browser session” store for KD2 (survives reload; clears when the session ends).
- Existing chrome already uses portfolio `--color-*` vars; flipping tokens under `.dark` covers R10 without rewriting every class string.
- shadcn `.dark` stub can remain; portfolio chrome does not depend on it for product surfaces.
- jsdom cannot prove FOUC; AE1 smoke is `build` + `preview` with OS dark.

### Risks

| Risk | Mitigation |
|---|---|
| Light FOUC on dark OS | KTD3 blocking head script + shared resolve; never paint-then-correct |
| `@theme` remaps collide with portfolio `--color-card` / `--color-border` | Verify computed chrome vars under `.dark` in preview; override portfolio family on `.dark` explicitly |
| LeftColumn header edit regresses Spotlight / Cuelume | KTD5 additive-only; keep spotlight + cuelume + layout suites green |
| Bootstrap and React disagree on key/class | Single module; React applies same `applyAppearance` path |
| Post-paint-only theme apply | Explicitly forbidden by KTD3; mirrors spotlight first-paint learning |

### Sources & Research

- Local: `src/index.css`, `index.html`, `src/hooks/useMediaQuery.ts`, `src/components/portfolio/LeftColumn.tsx`, `src/components/portfolio/ProjectCard.tsx`, `src/components/portfolio/MediaBlock.tsx`, `src/test/matchMedia.ts`
- Learnings: `docs/solutions/ui-bugs/portfolio-spotlight-reveal-and-scroll-state.md` (first-paint flash), `docs/solutions/best-practices/portfolio-cuelume-card-sounds-without-double-firing.md` (additive left UI)
- Paper HTV-0: https://app.paper.design/file/01KZD49VMP442MJ4NN7649VYPQ/2-0/HTV-0

### Implementation Notes

- Prefer test-first for the pure resolve helper and appearance suite (U2/U4).
- Smoke-first for R11/AE1 after U2: `npm run build && npm run preview` with OS dark before polishing toggle visuals.

---

## Implementation Units

### U1. Dark portfolio chrome tokens

- **Goal:** Define Paper HTV-0 dark values for the portfolio `--color-*` family under `.dark`, including derived card-active.
- **Requirements:** R8, R9, R10
- **Dependencies:** None
- **Files:**
  - modify: `src/index.css`
- **Approach:**
  1. Extend the existing **unlayered** `.dark { ... }` block in `src/index.css` (alongside the shadcn dark stub). Do not place portfolio dark `--color-*` overrides in `@theme`, `@layer base`, or any other layered rule — unlayered `:root` light tokens would otherwise keep winning.
  2. Under that `.dark` block, set `--color-ground: #14120B`, `--color-card: #1B1913`, `--color-card-active: #26241E` (KTD2), `--color-ink: #EDECEC`, `--color-ink-muted: rgb(237 236 236 / 0.6)`, `--color-border: rgb(237 236 236 / 0.08)`.
  3. Set `color-scheme: dark` on `html.dark` (and keep light native chrome coherent when dark is absent).
  4. Confirm body/`--color-ground` consumers still resolve through these vars; do not remove light `:root` values.
  5. Spot-check that `@theme` aliases do not leave chrome on light shadcn surfaces when `.dark` is present.
- **Patterns to follow:** Existing `:root` portfolio token block; KTD1–KTD2.
- **Test scenarios:** Covered in U4 (class toggles computed token usage via chrome classes); manual preview for visual Paper match.
- **Verification:** With `html.dark` forced in DevTools, left/right columns and cards use dark ground/card/ink.

### U2. Appearance resolve module and head bootstrap

- **Goal:** Shared Resolved appearance resolution with session override storage and pre-paint bootstrap so dark OS never flashes light.
- **Requirements:** R1, R4, R5, R11; F1 (bootstrap/class half); AE1 (bootstrap half)
- **Dependencies:** None (U1 required before AE1 FOUC smoke only)
- **Files:**
  - create: `src/lib/appearance.ts` (or equivalent pure module path)
  - modify: `index.html`
- **Approach:**
  1. Export constants: storage key, class name `dark`.
  2. Export pure helpers: `readOverride()`, `writeOverride(light|dark|null)`, `systemPrefersDark()`, `resolveAppearance()`, `applyAppearance(mode)` toggling `document.documentElement.classList`.
  3. In `index.html` `<head>`, add a blocking inline script that cannot import ESM before paint. Mirror the same storage key, class name, and resolve rules as `src/lib/appearance.ts` via comment-synced literal constants (no divergent duplicate logic). React imports the module only.
  4. Bootstrap runs before body paint: resolve → apply class. Wrap override read and system query in try/catch; on failure ignore storage and still apply from `prefers-color-scheme` (or light if matchMedia unavailable). Treat non-`light`/`dark` storage values as absent.
  5. Do not use `localStorage`.
- **Patterns to follow:** KTD3; `useMediaQuery` OS query string `'(prefers-color-scheme: dark)'`.
- **Execution note:** Prefer proving resolve helpers with unit tests before wiring React UI.
- **Test scenarios:** Covered in U4 pure-module tests.
- **Verification:** `npm run build && npm run preview` with OS dark, hard reload — no cream flash (AE1 smoke).

### U3. Theme toggle and React appearance sync

- **Goal:** Paper-style binary toggle top-right in the left header; React keeps Resolved appearance in sync with OS and session override without remount FOUC.
- **Requirements:** R1–R7, R12; F2, F3; AE2–AE5
- **Dependencies:** U1, U2
- **Files:**
  - modify: `src/components/portfolio/LeftColumn.tsx`
  - optionally create: `src/components/portfolio/ThemeToggle.tsx` if extracting keeps the header readable
- **Approach:**
  1. In LeftColumn (or a tiny extracted control), read override + `useMediaQuery('(prefers-color-scheme: dark)')`; when override absent, live OS updates call `applyAppearance`; when present, ignore OS changes until the session ends.
  2. On mount, call `applyAppearance(resolveAppearance())` so React matches bootstrap (no class flip).
  3. Add `relative` to the LeftColumn `<header>` (`h-80` identity header). Mount the Paper pill toggle absolute top-right above identity (Paper HTV-0 / KTD5). Light track `#E6E5E0`; dark track `#26241E` with selected segment `#EDECEC1A`.
  4. Bind selected segment UI to `resolveAppearance()` (not storage presence). Activating either segment always `writeOverride('light'|'dark')` and applies that mode—including when the pressed segment matches the current OS—intentionally disabling live OS sync until the session ends (KTD4). Prefer this explicit-segment model over “flip to opposite.”
  5. Keyboard and a11y: Tab to the control; Arrow/Enter/Space to select; accessible name (e.g. `aria-label="Color theme"`); `aria-pressed` (or equivalent) on segments; visible `:focus-visible` on both tracks.
  6. Keep identity subtitle and project list behavior unchanged; do not alter logo/`img`/`video` sources or filters (R12).
- **Patterns to follow:** `LeftColumn` header; `useMediaQuery`; KTD4–KTD5; additive identity-subtitle precedent.
- **Test scenarios:** Covered in U4.
- **Verification:** Dev smoke — toggle forces light or dark; reload keeps override; new tab/session returns to OS; logos unchanged.

### U4. Appearance automated contracts

- **Goal:** Prove resolve/override/OS sync, toggle placement, and no media recolor regressions; keep Spotlight/Cuelume green.
- **Requirements:** R1–R7, R12; AE2–AE5 (automated shape); AE1 smoke-only
- **Dependencies:** U1–U3
- **Files:**
  - create: `src/test/portfolio-appearance.test.tsx` (and/or `src/lib/appearance.test.ts`)
  - modify: `src/test/matchMedia.ts` — add `mockPrefersColorScheme('dark' | 'light')` with change-listener stub
  - optionally modify: `src/test/portfolio-layout.test.tsx` — assert toggle present; logos `src` unchanged under dark
- **Approach:**
  1. Unit-test pure resolve: no override + dark OS → dark; override light + dark OS → light; clear override → OS again.
  2. RTL: render app/left column with dark OS mock → `document.documentElement` has `dark`; toggle to light → class removed and sessionStorage set; reload simulation by re-resolving with storage present.
  3. Fire synthetic `matchMedia` change with no override → class updates (AE4 shape).
  4. With override set, OS change does not flip appearance.
  5. Assert project logos still use original `src` under dark (AE5).
  6. Run full `npm test` including spotlight + cuelume + identity suites.
- **Patterns to follow:** `src/test/matchMedia.ts`, `src/test/portfolio-identity-subtitle.test.tsx`, `src/test/portfolio-layout.test.tsx`.
- **Test scenarios:**
  - Happy path: dark OS, no override → `html` has `dark`.
  - Covers AE2 shape: toggle to light → override stored; resolve stays light after re-read.
  - Covers AE3 shape: clearing sessionStorage (new session) + dark OS → dark again.
  - Covers AE4: no override; dispatch color-scheme change → class updates.
  - Covers AE5: logo `src` unchanged when dark.
  - Edge: override present; OS change ignored.
  - Integration: layout, spotlight, cuelume, identity suites stay green.
- **Verification:** New suite green; full `npm test` green; AE1 confirmed via preview smoke from U2.

---

## Verification Contract

| Gate | Command / action | Applies |
|---|---|---|
| Unit/integration | `npm test` | After U1–U4 |
| Production build | `npm run build` | After U2–U3 |
| FOUC smoke (AE1) | `npm run build && npm run preview` with OS dark; hard reload — no light flash | After U2 |
| Toggle smoke | Dev/preview — override, reload keep, new session reset; Paper placement | After U3 |
| Regression | Existing spotlight + cuelume + identity + layout suites green | After U3–U4 |

---

## Definition of Done

- Implementation units U1–U4 complete with their verification outcomes met.
- Product requirements R1–R12 satisfied for Resolved appearance and Session override.
- AE2–AE5 covered by automated contracts; AE1 covered by documented preview smoke.
- `npm test` and `npm run build` succeed.
- No cross-visit preference memory, no three-way theme control, no media/logo recoloring, no Spotlight/Card reveal/Cuelume behavior changes beyond token-driven color.
