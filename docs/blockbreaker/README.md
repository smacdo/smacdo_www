# Block Breaker

A brick-breaking canvas demo playable at `/games/blockbreaker/`. Knock every destructible block
out of the field with a ball while keeping it in play with the paddle.

It is the only game built on this repository's TypeScript engine, `src/lib/gamebox/`, which makes
it the de facto test case for everything that engine does: the fixed-timestep loop, render
interpolation, the logical render surface, collision resolution, and sprite-atlas loading.

Originally part of the React SPA, deleted with it in Phase 1 of the redesign, recovered from git
history and rebuilt as a standalone esbuild demo in Phase 3 — see
[PLAN.md](../../PLAN.md#phase-3-js-demo-infrastructure-).

## Current state

Reconciled against the source on 2026-09-13. Behavior below is read from the code; this pass
included no browser or deployment verification.

One hardcoded level, no win state. It renders into a logical 720 × 1280 portrait surface and
updates on a 2 ms fixed step with interpolated rendering.

- **Paddle** — `A`/`D` or the arrow keys, 500 px/s, clamped to the level edges.
- **Ball** — starts stuck to the paddle; `Space` launches it. A paddle hit sets horizontal
  velocity from how far off center the hit landed, then rescales the velocity vector back to its
  previous length, so the speed stays constant and only the angle changes. Side walls and the
  ceiling bounce; there is no floor.
- **Blocks** — six block definitions exist; the level uses four. Definition 1 (grey) is `solid`
  and survives every hit. 2–4 are destroyed on contact. Definitions 5 and 6 are unreferenced by
  the current level.
- **Losing the ball** past the bottom edge rebuilds the level from scratch. There is no score, no
  lives, no level progression, and destroying every destructible block produces no win condition —
  play simply continues.

Known gaps and rough edges are tracked in [TASKS.md](TASKS.md).

## Working on it

From the repository root:

```sh
npm ci        # once
npm run dev   # watches the bundles and serves at http://127.0.0.1:1111
```

Then open http://127.0.0.1:1111/games/blockbreaker/.

Editing anything under `src/demos/blockbreaker/` or `src/lib/gamebox/` rebuilds the bundle and
reloads the browser. `npm run build` builds the whole site; `npm run build:demos` builds just this
demo. `npm run check` runs typecheck, lint, format check, and the unit tests.

## Files to know

Under `src/demos/blockbreaker/`:

- `demo.ts` — entry point. Finds the `#game-canvas` element the page template provides and hands
  it to `runGame` with a fresh `BlockBreakerGame`.
- `blockbreaker.ts` — everything else: tuning constants, the block definition table, the hardcoded
  level, `GameLevel`/`Block`/`Ball`/`Paddle`, input handling, the update step, and drawing.

Outside that directory:

- `content/games/blockbreaker.md` — the page, its description, and the controls text.
- `templates/games/page.html` — supplies `#game-canvas` and, for `loader = "ts"`, the
  `/js/demos/<slug>.js` script tag.
- `package.json` — the `build:demos` esbuild script.
- `static/img/puzzle-spritesheet.png` — the sprite atlas, fetched at runtime from
  `/img/puzzle-spritesheet.png`.
- `static/img/puzzle-spritesheet.json` — the atlas index. **Not loaded at runtime**; the sprite
  rectangles are hardcoded in `blockbreaker.ts`. All eight of them were verified against this file
  on 2026-09-13 and match exactly.

## How it uses the engine

- `runGame` (`src/lib/gamebox/game-runner.ts`) owns the `requestAnimationFrame` loop, a
  `ResizeObserver` on the canvas, and document-level `keydown`/`keyup` listeners.
- `BaseGame` (`src/lib/gamebox/base-game.ts`) accumulates delta time, drains it in fixed steps
  through `onUpdate`, then calls `onDraw` once on an `OffscreenCanvas` with the leftover fraction
  as the interpolation factor, and blits that to the visible canvas.
- `Viewport` (`src/lib/gamebox/viewport.ts`) locks output size to the canvas **height** and derives
  width from the render aspect ratio. Since the game renders 9:16 while `#game-container` in
  `static/css/style.css` is 16:9, the game draws as a centered portrait strip on a black field.
- `resolve_collision` (`src/lib/gamebox/bounds.ts`) returns the interpenetration vector for
  circle-vs-box (ball against blocks and paddle); `vector_direction` classifies it into the axis to
  reflect on.

## Companion documents

- [TASKS.md](TASKS.md) — known gaps and open items.
- [Games and graphics](../games-and-graphics.md) — engine, canvas, WASM, and hosting reference.

Repository-wide collaboration rules live in the root [AGENTS.md](../../AGENTS.md).
