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
- [ ] Add Vitest run/watch commands when preparing for game-rule tests; avoid
      creating placeholder tests just to exercise the runner.
- [ ] Add Vitest unit tests for SokobanGame movement: valid cardinal steps,
      invalid arguments throwing without state changes, coordinate bounds and row
      wrapping, walls, successful pushes, blocked pushes (walls, boxes, board edges),
      goal occupancy, and independence from the original level data. Extend coverage
      to the now-implemented undo, restart, and completion: repeated/empty undo,
      snapshot independence, rejected moves, undoing a win, and restart clearing history.
- [x] Simplify .gitignore. Remove unrelated Vite-repository patterns and duplicates;
      reconcile `.vscode/*` plus the extensions.json exception with the later rule
      that ignores the whole `.vscode` directory. Preserve intended generated-file
      exclusions, including `.playwright-mcp/`.

## Starter cleanup

- [x] Remove unused counter.js demo.
- [ ] Remove remaining unused Vite demo files after checking references: starter
      images/logos, and public icons. Review the favicon reference before deleting it.

## Gameplay and integration follow-ups

- [ ] Fix canvas clipping: 8 rows at 64 pixels need 512 pixels of height; canvas
      height is currently 480. No DPI/scaling framework is required for this fix.
- [ ] Validate level data at construction: positive integer column count dividing
      tile count, recognized tiles, equal nonzero box/goal counts, integer in-bounds
      floor positions, unique boxes/goals, and no player/box overlap. Reachability
      analysis is deferred (PLAN.md).
- [ ] Decide how Input listeners are disposed when a game is unmounted/recreated;
      especially relevant when integrating into smacdo_www. Current listeners live
      for the page lifetime.
- [ ] Recheck restart followed by undo after the history-reset fix (user confirmed;
      source now clears stateSnapshots).

The smacdo_www migration is larger planned work tracked in PLAN.md, not a one-shot.

## Completed

- [x] Connect Playwright MCP and verify the rendered canvas and browser console.
      This is local assistant setup, not a reproducible repository installation.
