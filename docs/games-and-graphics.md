# Games and graphics

Read this reference when changing games, canvas rendering, WASM loading, or demo hosting.

## Existing TypeScript engine

The engine in `src/lib/gamebox/` is planned for removal and a much simpler future rewrite.
Do not expand its abstractions, documentation, or test infrastructure unless a specific task
requires it. Remove or rewrite it only when explicitly requested.

For maintenance, games extend `BaseGame`; the engine uses a fixed timestep, rendering
interpolation, and logical canvas dimensions. The current demo is in `src/demos/blockbreaker/`.
These are existing implementation details, not requirements for the future rewrite.

## Canvas resource reuse

Reuse gradients, offscreen canvases, image bitmaps, and WebGL resources across frames.
Create them during initialization and rebuild when dimensions or relevant inputs change.

Use `rg` to locate resource constructors such as `createLinearGradient`,
`createRadialGradient`, `createPattern`, `createImageBitmap`, and `new OffscreenCanvas`,
then inspect whether animation callbacks repeatedly invoke them. Treat matches as review
candidates, not proof of a memory leak. Verify suspected leaks with runtime profiling.

## WASM Games

- Built in the `turboprop` repo; CI publishes artifacts to `~/turboprop-demos/<slug>/` on the server
- Discovery: the games section page fetches `/demos/metadata.json` at runtime to list available demos
- Each game page sets `loader = "wasm"` in front matter; `templates/games/page.html` imports
  `/demos/<slug>/loader.js` and calls `load(canvas)`
- Canvas element must have `id="game-canvas"` — turboprop-graphics finds it by ID at startup
- Assets are fetched from `/demos/<slug>/content/`; `loader.js` sets
  `window.__turboprop_content_base` before calling `init()` so turboprop knows where to look

The WASM integration is separate from the TypeScript engine. Preserve it during engine
removal unless the task explicitly includes changing it.

## Demo hosting

Keep `+FollowSymLinks` in `static/.htaccess`: Apache uses it to serve `/demos/` through
the `~/smacdo.com/demos → ~/turboprop-demos` symlink.

Server scripts (`deploy-www.sh`) live at `~/deploy/bin/` on both `smacdo_prod` and
`smacdo_staging`. Their source is in the `turboprop` repository's `server/` directory.
Script changes must be applied to both servers; this repository does not deploy those scripts.
