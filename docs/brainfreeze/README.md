# Brainfreeze

A small 2D browser game for learning modern TypeScript, JavaScript, and Canvas, playable at
`/games/brainfreeze/`. It is a Sokoban-style puzzle: push every crate onto a goal square. A later,
different prototype will help evaluate which parts of the code are actually reusable.

Originally built as the standalone `toybox` project and grafted into this repository — with its
full commit history — in September 2026. See [MIGRATION.md](MIGRATION.md) for how that was done
and which decisions are locked.

## Current state

One hardcoded level supports grid movement, crate pushing, goal highlighting, completion
detection, restart, and snapshot undo. Controls: WASD to move, R to restart, Z to undo. The game
uses a continuous frame loop with discrete input actions; `sokoban-game.ts` owns browser-independent
rules and state.

The progressive TypeScript conversion is underway. The level types, first level, and
browser-independent rules are now TypeScript; the browser-facing entry point, loop/rendering, and
input modules remain JavaScript with checked JSDoc types. This mixed state is intentional so the
conversion can proceed file by file rather than as one blocking cleanup.

Typecheck, lint, formatting, and the esbuild bundle all pass. Automated tests cover the
browser-independent rules, keyboard state, game-loop coordination, completion overlay, and demo
bootstrap; level-data validation remains pending. See [TASKS.md](TASKS.md).

## Working on it

From the repository root:

```sh
npm ci        # once
npm run dev   # watches the bundles and serves at http://127.0.0.1:1111
```

Then open http://127.0.0.1:1111/games/brainfreeze/.

Editing anything under `src/demos/brainfreeze/` rebuilds the bundle and reloads the browser
automatically. `npm run build` does the whole site at once, and `npm run build:brainfreeze`
just this demo.

Checks, all from the repository root: `npm run typecheck`, `npm run lint`, and
`npm run format:check` (or `npm run format` to apply).

## Files to know

All paths relative to `src/demos/brainfreeze/`:

- `demo.js`: entry point — finds the canvas the page template provides, sizes it, starts the game.
- `game.js`: frame loop, input-to-action mapping, and Canvas rendering.
- `sokoban-game.ts`: movement rules, completion, restart, and undo. No browser APIs.
- `input.js`: held/pressed keyboard state and focus-loss handling.
- `level.ts`: shared level types.
- `levels/level1.ts`: the hardcoded level definition.

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
