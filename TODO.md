# TODO

## Improvement walkthrough (2026-09-12)

User implements; assistant guides and reviews. Next: item 3; each item is a separate checkpoint.

1. [x] Add TypeScript as a dev dependency, a browser-oriented `tsconfig.json`, and a
       `typecheck` script (`tsc --noEmit`). Resolve production-source diagnostics and add CI checking.
       Existing test files need separate runner/type setup; do not silently treat them as checked.
       Verified locally: `npm run typecheck` passes with TypeScript 6.0.3, pinned exactly for
       typescript-eslint compatibility (replacing 7.0.2). CI step reviewed,
       positioned after dependency installation and before build; remote CI not yet run.
2. [x] Add typescript-eslint recommended linting and Prettier for TS, JS, CSS, and Markdown.
       Use a 100-character wrapping target; keep bulk formatting separate from behavior changes.
       Prettier configured; user reports formatting and type checks pass. ESLint config added and
       configured to allow unused parameters prefixed with `_`, per user preference.
       Verified: format, lint, and type checks pass locally. CI runs all three before building;
       remote CI not yet run. Formatting includes the `.mjs` ESLint config.
3. [ ] Coordinate Zola serving and TypeScript rebuilds in one dev command. Account for Zola
       regenerating `public/` and removing bundles, not just TypeScript file changes.
4. [ ] Align local/CI Node versions, document `npm ci`, and provide one shared local/PR check
       command. Assess restoring existing tests as a separate task.
5. [ ] Fix illegal top-level `return` statements in `templates/games/section.html`.
       Consider moving gallery discovery into checked TypeScript; handle missing metadata gracefully.
6. [ ] Include `public/.htaccess` in the deployment artifact; upload-artifact v4 excludes
       hidden files by default. Verify the downloaded artifact contains it.
7. [ ] Fix premature resolution in `httpGetImage` (`src/lib/gamebox/resources.ts`) and
       release its object URL after image load/error.
8. [ ] Bound fixed-step catch-up in `BaseGame` and reset runner timing when resuming.

Baseline: `make build` passes; the gallery module fails Node's syntax check with
`Illegal return statement`. No browser or live-server validation performed in this review.

## Earlier engine backlog

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

- Rename /games/ to /demos/
- Show version and publish date on the demo page (demos/name-of-demo)

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
