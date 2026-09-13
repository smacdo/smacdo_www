# Toybox

A small 2D browser-game project for learning modern JavaScript and Canvas.
The first game is Sokoban. A later, different prototype will help evaluate which
parts of the code are actually reusable.

## Current state

The Vite page loads and draws a solid rectangle on a 640 × 480 canvas. Rendering
has been checked in a live browser. Gameplay and a game loop are not implemented.

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

Preview serves the existing build, so rebuild after changes. These commands are
available in package.json; their presence is not a claim that a build was verified.

## Files to know

- `index.html`: page shell and canvas element.
- `src/main.js`: JavaScript entry point and initial Canvas drawing.
- `src/style.css`: page and canvas styling.
- `jsconfig.json`: editor checking for JavaScript, including Vite asset imports.
- `package.json`: dependencies and npm commands.

The stack is vanilla JavaScript with ES modules, Vite, and Canvas 2D. ESLint,
Prettier, and Vitest are listed as development dependencies; their project setup
is still pending. Browser inspection through Playwright MCP is an optional local
assistant tool, not a game dependency. Its configuration lives outside this repo.

## Development notes

- [Working with an assistant](AGENTS.md)
- [Milestones and architecture](PLAN.md)
- [Standalone tasks](TASKS.md)
