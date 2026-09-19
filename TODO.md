# TODO

## Brainfreeze development

The `toybox` Sokoban project is grafted in as a demo at `/games/brainfreeze/`, with its Git history,
and its source conversion to TypeScript is complete. Current work lives in
[docs/brainfreeze/TASKS.md](docs/brainfreeze/TASKS.md); migration phases, locked decisions, and
verified findings remain in [docs/brainfreeze/MIGRATION.md](docs/brainfreeze/MIGRATION.md).

## Improvement walkthrough (2026-09-12)

User implements; assistant guides and reviews; each item is a separate checkpoint.

Items 1–6 are complete; compressed 2026-09-13, with the per-item verification notes in git
history. Facts from them that are still load-bearing now live where the work does: the exact
`typescript` pin and the ESLint `_`-prefix rule in [AGENTS.md](AGENTS.md), the esbuild-before-Zola
build order in AGENTS.md, the `include-hidden-files` fix as a comment in
`deploy_template.yml`, and the gallery-discovery reasoning in
[docs/demo-delivery.md](docs/demo-delivery.md).

1. [x] TypeScript dev dependency, browser `tsconfig.json`, `typecheck` script, CI checking.
2. [x] typescript-eslint + Prettier for TS, JS, CSS and Markdown, at 100 characters.
3. [x] One dev command: `npm run dev` (`scripts/dev.mjs`) watches the bundles and runs
       `zola serve`. Bundles emit into `static/`, so Zola copies them and live reload fires.
4. [x] Aligned local/CI Node, documented `npm ci`, added `npm run check`. Windows needed
       `.gitattributes` with `* text=auto eol=lf`, or `format:check` fails on a CRLF tree.
5. [x] Illegal top-level `return` in `templates/games/section.html` — closed by deleting the
       gallery discovery block, not repairing it.
6. [x] `public/.htaccess` reaching the deploy artifact (`include-hidden-files: true`).
7. [ ] Fix premature resolution in `httpGetImage` (`src/lib/gamebox/resources.ts`) and
       release its object URL after image load/error.
8. [ ] Bound fixed-step catch-up in `BaseGame` and reset runner timing when resuming.

## Earlier engine backlog

These concern `src/lib/gamebox/`. Block Breaker is its only consumer and would be the first game
to exercise any of them; demo-specific items live in
[docs/blockbreaker/TASKS.md](docs/blockbreaker/TASKS.md).

- Resize the canvas and game when the window changes dimensions.
- A game should declare its target dimensions (width, height), aspect ratio requirements (lock to
  vertical, horizontal, or none), and then the engine will handle implementation.
    - Engine will render at a multiple of the desired dimension (1x, 2x etc. scale)
    - If current dimensions in between two multiples, engine will render at higher multiple and then
      downscale to fit.
        - Consider applying this if current dims >~ 20% or so to avoid fuzziness.
    - Engine will add border padding as needed when scaling.
    - UI can be rendered at native resolution if game desires
        - Provide `onDrawUI` which draws directly to canvas at DPR adjusted dims

## Demos

- Rename /games/ to /demos/ — **blocked by hosting.** `deploy-www.sh` rsyncs with
  `--exclude '/demos'` so the `~/smacdo.com/demos` → `~/turboprop-demos` symlink survives, so a
  Zola-built `/demos/` page would work locally and never reach the doc root. Moving the section
  means changing that deploy script (it lives in the turboprop repo) and the WASM URL contract
  together. The move in docs/demo-delivery.md unblocks this: once the artifacts have their own
  host there is no symlink in the doc root to protect, and the exclude goes away entirely. Verified
  2026-09-13; see docs/brainfreeze/MIGRATION.md finding F1.
- Show version and publish date on the demo page (demos/name-of-demo). Still open: deleting
  gallery discovery dropped the gallery version badge, which is a different surface. If this is
  built, take the values from front matter rather than re-introducing a runtime fetch of
  `metadata.json`.

## Viewport

- Add option to use canvas width or height when determining output size.

## Debug Mode

- When the canvas is resized, draw the new size briefly in the window corner.

## Debug Menu

- Viewport
    - Physical size: $width x $height
    - Render size: $width x $height
    - Output size: $width x $height
    - Render aspect ratio: $ratio
    - Device Pixel Ratio: $dpr
    - <button: Show physical, render and output regions>
