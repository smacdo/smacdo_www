# Toybox

A small 2D browser-game project for learning modern JavaScript and Canvas.
The first game is Sokoban. A later, different prototype will help evaluate which
parts of the code are actually reusable.

## Current state

One hardcoded Sokoban level supports grid movement, crate pushing, goal highlighting,
completion detection, restart, and snapshot undo. Controls: WASD to move, R to
restart, Z to undo. Game uses a continuous frame loop with discrete input actions;
SokobanGame owns browser-independent rules and state.

Lint, formatting, and build passed at the latest review; gameplay has been checked
in a browser and with temporary logic checks. Permanent unit tests and level-data
validation remain pending. The 512-pixel-tall board is partly clipped by the
480-pixel canvas; see TASKS.md. The latest restart-history fix is user-confirmed
and present in source, but has not yet been independently rechecked.

Development is paused ahead of a planned integration into `smacdo_www`. Migration
has not started; see PLAN.md for the handoff and outstanding decisions.

## Run locally

Install Node.js LTS with npm, then run these commands in the project root:

```sh
npm install
npm run dev
```

Open the Local URL printed by Vite, usually http://localhost:5173. Keep the
terminal running while developing; press Ctrl+C to stop the server.

To build and locally preview the production output:

```sh
npm run build
npm run preview
```

Preview serves the existing build, so rebuild after changes.

## Files to know

- `index.html`: page shell and canvas element.
- `src/main.js`: canvas setup and creation of Game/Input.
- `src/game.js`: frame loop, input-to-action mapping, and Canvas rendering.
- `src/sokoban_game.js`: movement rules, completion, restart, and undo.
- `src/input.js`: held/pressed keyboard state and focus-loss handling.
- `src/level.js`: shared JSDoc level type.
- `src/levels/level1.js`: hardcoded level definition.
- `src/style.css`: page and canvas styling.
- `jsconfig.json`: editor checking for JavaScript, including Vite asset imports.
- `package.json`: dependencies and npm commands.

The stack is vanilla JavaScript with ES modules, Vite, and Canvas 2D. Run
`npm run lint` for ESLint, `npm run format:check` to check formatting, or
`npm run format` to apply Prettier formatting. Vitest setup is still pending.
Browser inspection through Playwright MCP is an optional local
assistant tool, not a game dependency. Its configuration lives outside this repo.

## Development notes

- [Working with an assistant](AGENTS.md)
- [Milestones and architecture](PLAN.md)
- [Standalone tasks](TASKS.md)
