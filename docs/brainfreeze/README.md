# Brainfreeze

A small 2D browser game for learning modern JavaScript and Canvas, playable at
`/games/brainfreeze/`. It is a Sokoban-style puzzle: push every crate onto a goal square. A later,
different prototype will help evaluate which parts of the code are actually reusable.

Originally built as the standalone `toybox` project and grafted into this repository — with its
full commit history — in September 2026. See [MIGRATION.md](MIGRATION.md) for how that was done
and which decisions are locked.

## Current state

One hardcoded level supports grid movement, crate pushing, goal highlighting, completion
detection, restart, and snapshot undo. Controls: WASD to move, R to restart, Z to undo. The game
uses a continuous frame loop with discrete input actions; `sokoban-game.js` owns browser-independent
rules and state.

Still vanilla JavaScript with JSDoc types, not TypeScript. The annotations already pass this
repository's strict `tsconfig.json`, so the planned conversion can proceed file by file rather than
as one blocking cleanup.

Typecheck, lint, formatting, and the esbuild bundle all pass. Permanent unit tests and level-data
validation remain pending; see [TASKS.md](TASKS.md).

## Working on it

From the repository root:

```sh
npm ci                      # once
npm run build:brainfreeze   # compile the demo bundle
make serve                  # Zola dev server at http://127.0.0.1:1111
```

Then open http://127.0.0.1:1111/games/brainfreeze/.

`make serve` runs only Zola and does **not** compile JavaScript, so rerun `npm run
build:brainfreeze` after editing any file under `src/demos/brainfreeze/`. If Zola regenerates
`public/`, the bundle is removed and must be rebuilt. `make build` does the whole site at once.

Checks, all from the repository root: `npm run typecheck`, `npm run lint`, and
`npm run format:check` (or `npm run format` to apply).

## Files to know

All paths relative to `src/demos/brainfreeze/`:

- `demo.js`: entry point — finds the canvas the page template provides, sizes it, starts the game.
- `game.js`: frame loop, input-to-action mapping, and Canvas rendering.
- `sokoban-game.js`: movement rules, completion, restart, and undo. No browser APIs.
- `input.js`: held/pressed keyboard state and focus-loss handling.
- `level.js`: shared JSDoc level type.
- `levels/level1.js`: the hardcoded level definition.

Outside that directory:

- `content/games/brainfreeze.md`: the page, its description, and its declared aspect ratio.
- `templates/games/page.html`: supplies the `#game-canvas` element the demo attaches to.
- `package.json`: the `build:brainfreeze` esbuild script.

## Development notes

- [Project constraints](constraints.md) — what not to reach for, and why.
- [Milestones and architecture](PLAN.md)
- [Standalone tasks](TASKS.md)
- [Migration record](MIGRATION.md)

Repository-wide collaboration rules live in the root [AGENTS.md](../../AGENTS.md).
