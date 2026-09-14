# Sky header

The animated sky that fills the site header on every page: a day/night gradient driven by the
real clock, a sun and moon on a shared arc, stars, drifting clouds, and a hill-and-tree
silhouette. Dragging the sun or moon scrubs the time of day.

Implemented in `src/site/header.ts` (647 lines — the largest single source file in the repo) and
bundled by esbuild to `static/js/site.js`, which Zola copies to `/js/site.js`. It is site chrome,
not a game: it shares no code with `src/lib/gamebox/`.

Extracted from PLAN.md Phase 5 on 2026-09-13. The checklists there described work that is now
almost entirely built, so this reads as a description of what exists rather than a plan.

## What it does

**Time system.** The current `Date` becomes a fractional hour, then an angle:
`θ = π/2 − (hour − 12)/12 × π`. The sun sits at θ and the moon at θ + π on the same circle, so
one setting raises the other. Visibility allows a small margin below the horizon.

**Sky gradient.** Interpolated keyframes over a Catppuccin-derived palette — deep indigo to
near-black at night, dark blue predawn, peach and mauve horizon glow at dawn and dusk, sky and
sapphire blues by day. The bottom edge fades into `var(--bg)`, so the canvas meets either theme
seamlessly.

**Sun and moon.** Both are pre-rendered once to offscreen canvases (`buildSunCanvas`,
`buildMoonCanvas`) and blitted each frame: a glowing disc with a soft corona, and a crescent drawn
with the offset-fill technique.

**Stars.** Scattered dots that fade in at dusk and out at dawn, each with its own subtle twinkle.

**Clouds.** Four to five layered objects of overlapping soft circles, drifting left to right and
wrapping at the edges. Each is rendered to its own offscreen canvas and re-rendered only when the
header is resized. Opacity scales with daylight, so they vanish at night.

**Silhouette.** A rolling hill path built from bezier segments (`HILL_SEGS`), with pine trees
rising from it, filled slightly lighter than black to match the Mocha surface colors. It sits just
above the gradient fade zone.

**Drag interaction.** Pointer down on the sun or moon enters drag mode; the drag is projected back
onto the arc with `θ = atan2(horizonY − y, x − centerX)`. Moving one body moves the other to
θ + π, so dragging the sun below the horizon raises the moon. The position freezes after a drag —
the real-time clock is paused — and a double-click or double-tap returns it to real time.

## Files to know

- `src/site/header.ts` — all of the above.
- `templates/base.html` — the `<canvas id="sky-canvas">` inside `<header>`, and the deferred
  `<script src="/js/site.js">`.
- `static/css/style.css` — the canvas is absolutely positioned to fill the header and sits behind
  the nav; the nav has a semi-transparent dark pill so it stays readable against any sky.
- `package.json` — the `build:site` esbuild entry.

Canvas sizing is handled by a `ResizeObserver` on the canvas's parent, which accounts for
`devicePixelRatio` and invalidates the cached gradients and cloud offscreens.

## Open items

Carried from Phase 5; nothing here is a commitment.

- [ ] **Full-bleed header and footer.** The header restructure is partly done — `max-width` and
      padding moved from `body` to a `.page-body` wrapper, and nav content stays centered at
      800px. The footer is still inside `.page-body`, so it is not yet full browser width.
- [ ] **Castle silhouette (Phase 5f).** An alternative castle or urban skyline to compare against
      the hills version, keeping the winner. Never started.
- [ ] **Scroll parallax clouds.** Experiment with clouds shifting on page scroll, keeping ambient
      drift as the fallback.
- [ ] **More foreground detail** — additional trees and buildings over time.
- [ ] **No `prefers-reduced-motion` handling.** The header animates continuously on every page.
      Observed 2026-09-13 by reading the source; worth deciding on before more motion is added.
- [ ] `header.ts` defines its own `lerp` (line 36) rather than importing the one from
      `src/lib/gamebox/math.ts`. Deliberate if site chrome should stay independent of the game
      engine, which now looks like the long-lived answer — but worth recording either way.

## Related

- [PLAN.md](../PLAN.md) — remaining site-wide visual work (Catppuccin palette, typography).
- Repository-wide collaboration rules: [AGENTS.md](../AGENTS.md).
