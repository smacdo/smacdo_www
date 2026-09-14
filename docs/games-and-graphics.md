# Games and graphics

Read this reference when changing games, canvas rendering, WASM loading, or demo hosting.

## Existing TypeScript engine

Games extend `BaseGame`; the engine uses a fixed timestep, rendering
interpolation, and logical canvas dimensions. Its only consumer is Block Breaker — see
[docs/blockbreaker/README.md](blockbreaker/README.md) for how that demo drives each piece.
Brainfreeze is also a TypeScript-bundled demo but does not use this engine. It may in the future.
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
- Discovery:
    - demos are listed from `content/games/*.md`
    - a WASM demo needs a content page with `loader = "wasm"` and a slug matching the
      published artifact directory
- Each game page sets `loader = "wasm"` in front matter; `templates/games/page.html` imports
  `/demos/<slug>/loader.js` and calls `load(canvas)`
- Canvas element must have `id="game-canvas"` — turboprop-graphics finds it by ID at startup
- Assets are fetched from `/demos/<slug>/content/`; `loader.js` sets
  `window.__turboprop_content_base` before calling `init()` so turboprop knows where to look

The WASM integration is separate from the TypeScript engine.

## Demo hosting

Keep `+FollowSymLinks` in `static/.htaccess`: Apache uses it to serve `/demos/` through
the `~/smacdo.com/demos → ~/turboprop-demos` symlink.

Server scripts (`deploy-www.sh`) live at `~/deploy/bin/` on both `smacdo_prod` and
`smacdo_staging`. Their source is in the `turboprop` repository's `server/` directory.
Script changes must be applied to both servers; this repository does not deploy those scripts.
