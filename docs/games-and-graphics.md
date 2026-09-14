# Games and graphics

Read this reference when changing games, canvas rendering, WASM loading, or demo hosting.

## Adding a demo

Every demo, TypeScript or WASM, is a page in `content/games/` plus something that draws into the
canvas `templates/games/page.html` provides. That canvas is always `id="game-canvas"` — both
loaders find it by that ID, so a demo that renames it silently draws nothing.

Front matter the templates actually read:

| Key            | Effect                                                                                                                       |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `title`        | Page heading and the gallery entry                                                                                           |
| `description`  | Sub-heading and the gallery blurb                                                                                            |
| `weight`       | Gallery order — the section sorts by it (`sort_by = "weight"`)                                                               |
| `extra.loader` | `"ts"` loads `/js/demos/<slug>.js`; `"wasm"` imports `/demos/<slug>/loader.js`. Omit it and the page renders an empty canvas |
| `extra.aspect` | CSS `aspect-ratio` for the container. **Omit it and you get 16:9**, which letterboxes any demo that is not widescreen        |

`platforms`, `status`, and `date` are also present on the existing game pages but no games
template reads them. They are reserved for the gallery card design in
[PLAN.md](../PLAN.md#future--deferred); until that exists they do nothing.

For a TypeScript demo, also add a `build:<name>` esbuild script to `package.json` and include it
in `build:js` — bundles must land in `static/js/demos/`, not `public/`.

## Existing TypeScript engine

Games extend `BaseGame`; the engine uses a fixed timestep, rendering
interpolation, and logical canvas dimensions. Its only consumer is Block Breaker — see
[docs/blockbreaker/README.md](blockbreaker/README.md) for how that demo drives each piece.
Brainfreeze is also a TypeScript-bundled demo but does not use this engine. It may in the future.
Decided 2026-09-13: 2D games stay in TypeScript and this engine stays with them. A Rust port
of Block Breaker is no longer planned; turboprop is for 3D. Whether gamebox is kept as-is,
reworked, or merged with Brainfreeze's approach is still open.

## Canvas resource reuse

Reuse gradients, offscreen canvases, image bitmaps, and WebGL resources across frames.
Create them during initialization and rebuild when dimensions or relevant inputs change.

A constructor called inside an animation callback is a review candidate, not proof of a
leak — verify with runtime profiling before acting.

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
