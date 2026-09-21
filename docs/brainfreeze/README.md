# Brainfreeze

A small 2D browser game for learning modern TypeScript, JavaScript, and Canvas, playable at
`/games/brainfreeze/`. It is a Sokoban-style puzzle: push every crate onto a goal square. A later,
different prototype will help evaluate which parts of the code are actually reusable.

Originally built as the standalone `toybox` project and grafted into this repository — with its
full commit history — in September 2026. See [MIGRATION.md](MIGRATION.md) for how that was done
and which decisions are locked.

## Current state

Three hardcoded levels support grid movement, crate pushing, goal highlighting, completion
detection, restart, snapshot undo, and progression through a `LevelPack`. Controls: WASD to move,
R to restart, Z to undo, and Enter to advance after completing a non-final level. The game uses a
continuous frame loop with discrete input actions. `ScreenManager` owns the active screen;
`SokobanGameScreen` owns gameplay input, rendering, level progression, and completion modals; and
`sokoban_game.ts` owns browser-independent rules and the live state for one level at a time.

The TypeScript conversion is complete. The level types and data, browser-independent rules,
browser-facing entry point, loop/rendering, and input modules are all TypeScript.

Typecheck, lint, formatting, and the esbuild bundle all pass. Automated tests cover the
browser-independent rules and level validation, keyboard state, level-pack progression, game-loop
coordination, screen replacement, gameplay input routing, completion overlays, and demo bootstrap.
See [TASKS.md](TASKS.md).

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

Run `npm run check` from the repository root for typechecking, linting, formatting, and unit tests.
Use `npm run format` to apply formatting fixes.

## Files to know

All paths relative to `src/demos/brainfreeze/`:

- `demo.ts`: entry point — finds the canvas the page template provides, sizes it, starts the game.
- `game_loop.ts`: frame loop and coordination between input, updates, and rendering.
- `screen_manager.ts`: active-screen ownership, replacement, update, and rendering delegation.
- `sokoban_game_screen.ts`: gameplay input mapping, Canvas rendering, level progression, and modals.
- `level_pack.ts`: ordered level-pack state and progression.
- `sokoban_game.ts`: movement rules, completion, restart, and undo. No browser APIs.
- `input.ts`: held/pressed keyboard state and focus-loss handling.
- `level.ts`: shared level types.
- `levels/`: the three hardcoded level definitions.

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
