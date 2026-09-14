# TODO

## Brainfreeze migration (active)

Grafting the `toybox` Sokoban project in as a demo at `/games/brainfreeze/`, with its Git
history. Phases, locked decisions, and verified findings:
[docs/brainfreeze/MIGRATION.md](docs/brainfreeze/MIGRATION.md).

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
3. [x] Coordinate Zola serving and TypeScript rebuilds in one dev command. Done 2026-09-13:
       `npm run dev` (`scripts/dev.mjs`) watches every bundle through esbuild's JS API and runs
       `zola serve` alongside, with no new dependency. The bundles are emitted into `static/`
       rather than `public/`, so Zola copies them and its own live reload fires on a rebuild —
       verified end to end: editing a source file reloads the browser with the new code.
       Note the premise here was wrong: `zola serve` does _not_ regenerate `public/` or remove
       bundles; it rebuilds incrementally. `zola build` does clean the output directory, which
       is why the build order is now esbuild first, Zola second.
4. [x] Align local/CI Node versions, document `npm ci`, and provide one shared local/PR check
       command. Assess restoring existing tests as a separate task.
       Done in part: `npm run format:check` could not pass on Windows, because
       `core.autocrlf=true` with no `.gitattributes` gave a CRLF working tree while Prettier
       defaults to `endOfLine: "lf"`. Fixed 2026-09-13 by committing `.gitattributes` with
       `* text=auto eol=lf` and re-checking out the tree; all three checks now pass locally.
5. [x] Fix illegal top-level `return` statements in `templates/games/section.html`.
       Resolved 2026-09-13 by deleting the gallery discovery block rather than repairing it —
       see PLAN.md Phase 6a. Confirmed in headless Chrome that the script never executed, so
       the gallery it built had never appeared; making it parse would have duplicated an entry
       the content tree already renders.
6. [x] Include `public/.htaccess` in the deployment artifact; upload-artifact v4 excludes
       hidden files by default. Fixed 2026-09-13 with `include-hidden-files: true` in
       `deploy_template.yml`. Verified on both hosts: the custom 404 page is served, which
       only happens once `.htaccess` reaches the document root.
7. [ ] Fix premature resolution in `httpGetImage` (`src/lib/gamebox/resources.ts`) and
       release its object URL after image load/error.
8. [ ] Bound fixed-step catch-up in `BaseGame` and reset runner timing when resuming.

Baseline as of this review (2026-09-12): `make build` passes; the gallery module fails Node's
syntax check with `Illegal return statement`. No browser or live-server validation performed in
this review. Both halves have since changed — `make build` became `npm run build` on 2026-09-13,
and the gallery module was deleted outright rather than repaired (item 5).

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

- Rename /games/ to /demos/ — **blocked by hosting.** `deploy-www.sh` rsyncs with
  `--exclude '/demos'` so the `~/smacdo.com/demos` → `~/turboprop-demos` symlink survives, so a
  Zola-built `/demos/` page would work locally and never reach the doc root. Moving the section
  means changing that deploy script (it lives in the turboprop repo) and the WASM URL contract
  together. PLAN.md Phase 6b is what unblocks this: once the artifacts have their own host there
  is no symlink in the doc root to protect, and the exclude goes away entirely. Verified
  2026-09-13; see docs/brainfreeze/MIGRATION.md finding F1.
- Show version and publish date on the demo page (demos/name-of-demo). Still open: Phase 6a
  dropped the gallery version badge, which is a different surface. If this is built, take the
  values from front matter rather than re-introducing a runtime fetch of `metadata.json`.

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
