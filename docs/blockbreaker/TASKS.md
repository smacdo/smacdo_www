# Block Breaker tasks

Known gaps and rough edges in the demo, recorded from a source review on 2026-09-13. Nothing here
was browser-verified in that pass, and a checkbox is not permission to execute the task. Items
about the engine rather than the game stay in the root [TODO.md](../../TODO.md); they are
cross-referenced below, not moved.

Anything that grows into a feature belongs in [PLAN.md](../../PLAN.md), not here.

## Gameplay

- [ ] **No win condition.** Clearing every destructible block leaves the ball bouncing in an empty
      field. There is no score, no lives, and no second level.
- [ ] **Losing the ball is silent.** Dropping past the bottom edge calls `loadLevel()`, which
      rebuilds the level from scratch with no message, pause, or penalty.
- [ ] Block definitions 5 and 6 (`element_red_rectangle_glossy`, `element_yellow_rectangle_glossy`)
      exist in the `BLOCKS` table but no level uses them.

## Presentation

- [ ] **The game is letterboxed.** It renders 720 × 1280 (9:16) into `#game-container`, which is
      `aspect-ratio: 16 / 9` in `static/css/style.css`, and `Viewport` sizes output from canvas
      height — so the playfield is a narrow centered strip with wide black bars. Adding
      `aspect = "9 / 16"` to `content/games/blockbreaker.md` would fit it, the way Brainfreeze
      declares `aspect = "1 / 1"`. Confirm in a browser before changing it.
- [ ] **Arrow keys and `Space` are not prevented from scrolling the page.** `game-runner.ts`
      listens on `document` and `BlockBreakerGame.onKeyDown` never calls `preventDefault()`, so the
      launch and movement keys should also scroll a game page long enough to scroll. Reproduce
      before fixing; the fix belongs in the game or the runner, and that choice affects every demo.

## Code health

- [ ] `BlockDefinition.color` is never read — rendering goes entirely through `spriteDef`. The
      values are also misleading: definition 2 is `#00B300` (green) paired with
      `element_blue_rectangle_glossy`. Drop the field or make something use it.
- [ ] `src/content/puzzle-spritesheet.png` and `.json` are byte-identical, unreferenced duplicates
      of the `static/img/` copies the game actually loads. Confirm nothing else wants them, then
      remove one pair.
- [ ] Block penetration correction in `updateBallCollisions` uses `ball.aabb.halfHeight` on both
      axes. Harmless today because the ball's AABB is square, but it silently breaks for any
      non-square object.
- [ ] Wall and ceiling bounces in `updateBallPosition` are an `else if` chain, so a corner hit
      reflects on one axis per update step rather than both.
- [ ] The fixed update step is 2 ms — roughly 8 update calls per 60 Hz frame. Intentional or not,
      it multiplies the cost of the unbounded catch-up loop in root TODO.md item 8.

## Engine items that affect this demo

Tracked in the root [TODO.md](../../TODO.md#improvement-walkthrough-2026-09-12):

- Item 7 — premature resolution in `httpGetImage` (`src/lib/gamebox/resources.ts`); this demo's
  sprite atlas is the only thing loading through it.
- Item 8 — unbounded fixed-step catch-up in `BaseGame`, and timing reset on resume.
- The "Earlier engine backlog" section — resize handling, target dimensions, and scaling rules,
  all of which `BlockBreakerGame` would be the first game to exercise.
