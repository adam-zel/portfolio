# Concepts

Shared domain vocabulary for this project — entities, named processes, and status concepts with project-specific meaning. Seeded with core domain vocabulary, then accretes as ce-compound and ce-compound-refresh process learnings; direct edits are fine. Glossary only, not a spec or catch-all.

## Portfolio home

### Spotlight
The scroll-linked pairing between the left project list and the right media stack: whichever media block is featured is the active project in the list, and clicking a list row jumps media so that project is featured.

### Active project
The project currently featured by Spotlight. It must remain visible and focusable in the left list even when that row has not yet scrolled into the left column on its own.

### Card reveal
The progressive show of left-column project rows as they enter the left scrollport. Reveal is additive and must treat the Active project as revealed so Spotlight never highlights a hidden row.

### Programmatic scroll lock
A short window after a click-to-jump where Spotlight defers Active project selection from media-root intersections so intermediate media blocks cannot steal the Active project during smooth scroll. Intersection ratios still update during the lock so unlock can reconcile from fresh viewport data.

### Card interaction cue
Audio feedback on a project card for hover, pointer press, and keyboard activation. Cues are independent of Card reveal and Spotlight selection: sound must not gate on reduced-motion preference, and cue wiring must stay additive so it does not change which row is Active or whether a row is revealed.

### Identity subtitle
The muted line under the name in the left column. It cycles through a fixed ordered list of personality titles with a readable dwell and stable width. Motion uses a masked upward reveal (not a character morph). Distinct from the static name and from project-card copy.

### Readable dwell
How long an Identity subtitle title stays fully visible after its enter phase finishes, before exit begins. Not the same as the time until the next title mounts (that also includes exit and swap delays).

### Advance interval
The full time from one title mount until the next title mounts on the sequential swap path (enter + readable dwell + exit + micro-delay). Test mocks that only tick the Readable dwell will silent-pass against production.

### Resolved appearance
The effective light or dark chrome mode for the portfolio home. Until a Session override exists, Resolved appearance tracks the OS color scheme (including live changes). Distinct from raw OS preference once an override is set.

### Session override
A visitor-forced light or dark choice set by the header theme toggle. It applies only for the current browser session (survives reload in that session; clears when the session ends) and does not remember across visits.

### Glimm sweep
The full-viewport prism band that animates when the visitor pointer-toggles appearance. Appearance class changes at Midpoint appearance apply, not at click start.

### Midpoint appearance apply
The moment during a Glimm sweep when Resolved appearance is written to the document (dark class on/off). Distinct from writing Session override, which happens immediately when the toggle is activated.

### Instant theme path
Theme change with no Glimm sweep (keyboard arrows). Cancels any in-flight sweep and must clear the band; Sweep cancel alone leaves the overlay visible.

### Sweep cancel
Glimm's mid-flight abort: stops the animation loop but leaves the band's alpha and progress so a following sweep can continue. Instant theme path must clear the overlay after Sweep cancel; pointer-to-pointer replacement may rely on the next sweep instead.

### Media frame
The fixed-aspect card in the right column that shows one project image or video. Shared radius and clip must apply to the replaced media element itself on mobile WebKit — parent overflow alone is not enough for `<video>`.
