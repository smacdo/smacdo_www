# Standalone tasks

Independent, small tasks to consider when the user chooses. Larger features and
their steps belong in PLAN.md. The assistant may add tasks and update their status
as discussion and development progress without separate permission. A checkbox
is not permission to execute the task. Move work into PLAN.md if it grows into
a feature.

## Development setup

- [x] Configure ESLint for browser JavaScript and add a lint command. Confirm it
      works with the existing JavaScript type checking.
- [x] Configure Prettier and add format/check commands, keeping the current
      double-quote and semicolon style unless the user chooses otherwise.
- [x] Add Vitest run/watch commands when preparing for game-rule tests; avoid
      creating placeholder tests just to exercise the runner. Done repo-wide: `npm test` and
      `npm run test:watch`, with `vitest.config.ts` at the root.
- [x] Add Vitest unit tests for SokobanGame movement: valid cardinal steps,
      invalid arguments throwing without state changes, coordinate bounds and row
      wrapping, walls, successful pushes, blocked pushes (walls, boxes, board edges),
      goal occupancy, and independence from the original level data. Extend coverage
      to the now-implemented undo, restart, and completion: repeated/empty undo,
      snapshot independence, rejected moves, undoing a win, and restart clearing history. Completed
      with 64 browser-independent rule tests in `sokoban_game.test.ts`.
- [x] Add focused tests around the remaining runtime boundaries: keyboard held/pressed/blur state,
      action mapping and frame timing, the completion overlay, and demo bootstrap. Keep `level.ts`
      type-only and avoid tests that merely repeat the static `level1.ts` fixture.
- [x] Simplify .gitignore. Remove unrelated Vite-repository patterns and duplicates;
      reconcile `.vscode/*` plus the extensions.json exception with the later rule
      that ignores the whole `.vscode` directory. Preserve intended generated-file
      exclusions, including `.playwright-mcp/`.

## Starter cleanup

- [x] Remove unused counter.js demo.
- [x] Remove remaining unused Vite demo files. Done during the migration: the starter
      images/logos, public icons, and the whole Vite scaffolding were dropped.

## Gameplay and integration follow-ups

- [x] Convert the demo to TypeScript progressively, one file at a time. Completed 2026-09-19;
      all Brainfreeze source modules are now TypeScript.

- [x] Fix canvas clipping: 8 rows at 64 pixels need 512 pixels of height; canvas
      height was 480. Fixed during the migration — `demo.ts` now sizes the canvas bitmap to
      512x512 rather than relying on markup attributes.
- [x] Validate level data at construction: positive integer column count dividing
      tile count, recognized tiles, equal nonzero box/goal counts, integer in-bounds
      floor positions, unique boxes/goals, no player/box overlap, and wall-based reachability from
      the player to every box and goal. Completed 2026-09-19 with focused unit tests, including
      disconnected regions, paths around walls, and boxes being ignored as obstacles. The
      extracted `Grid` has 25 focused tests covering construction, cloning, cell access, and bounds.
- [x] Replace the `Box`, `Goal`, and `Player` classes with plain interfaces that extend `Position`
      and carry distinct literal `kind` fields. The discriminants prevent those structurally
      similar records from being mixed accidentally and survive `structuredClone()`, unlike custom
      class prototypes. Update level definitions and test fixtures to provide the corresponding
      `kind` values. Completed 2026-09-20.
- [ ] Decide how Input listeners are disposed when a game is unmounted/recreated. Now
      live rather than hypothetical: the demo runs inside a multi-page site. Current
      listeners are attached to `window` at construction and live for the page lifetime.
- [x] Recheck restart followed by undo after the history-reset fix. Independently verified
      2026-09-13 by exercising the rules headlessly after the migration: restart resets the
      player and a following undo returns false, so the snapshot history is genuinely cleared.

The smacdo_www migration is complete; see [MIGRATION.md](MIGRATION.md) for the record.

## Completed

- [x] Connect Playwright MCP and verify the rendered canvas and browser console.
      This is local assistant setup, not a reproducible repository installation.
