# Brainfreeze migration runbook

Grafting the `toybox` learning project (a Sokoban-style puzzle game) into this repository,
with its Git history, as a playable demo at `/games/brainfreeze/`.

This file is the durable record of the migration. It is written to survive a session cutoff:
a fresh session, or a subagent handed a single phase, should be able to act from this file
alone without re-deriving the research below. **Update the status table as phases complete.**

## Status

| Phase | Description                                 | State |
| ----- | ------------------------------------------- | ----- |
| 0     | Prep: commit this plan, install filter-repo | DONE  |
| 1     | Graft toybox history (commit 1)             | DONE  |
| 2     | Reorganize + strip scaffolding (commit 2)   | DONE  |
| 3     | Wire into build/lint/typecheck (commit 3)   | DONE  |
| 4     | Reformat to project style (commit 4)        | DONE  |
| 5     | Page + code adaptation (commit 5)           | DONE  |
| 6     | Bookkeeping (commit 6)                      | DONE  |

Nothing is pushed by any phase. See [Guardrails](#guardrails).

All phases are complete. Verified end to end afterwards: `npm run build` and `zola check` pass
with zola 0.22.1 (the CI pin), all three game pages render correctly, and the game rules were
exercised headlessly — 19 assertions covering movement, wall and diagonal rejection, pushing,
undo, restart, source-level immutability, and a full ten-move solve of level 1, all passing. That
check ran from a scratch directory and was deliberately not committed, since adding test
infrastructure needs its own task; it would be a reasonable starting point for the Vitest task in
[TASKS.md](TASKS.md).

The one outstanding item is a human browser check of `/games/brainfreeze/`: board square and
uncropped, WASD/R/Z responsive, no console errors.

### Changed after the migration

The phase instructions below are kept as written, as a record of what was done. Two things have
changed since, so read them as history rather than as current commands:

- The `Makefile` was removed in favour of npm scripts. `make build` is now `npm run build` and
  `make serve` is `npm run serve`; `npm run clean` removes `public/` only.
- The games page template's aspect-ratio override was rewritten. The original
  `default(value='16 / 9')` form double-escaped the literal into invalid CSS; it now emits an
  inline style only when a page declares `extra.aspect`, leaving `style.css` as the single
  source of the 16/9 default.
- Finding F8's line-ending problem is fixed — a `.gitattributes` now pins LF, so the repo-wide
  `npm run format:check` works and the scoped-prettier workaround is unnecessary.

### Deviations from the plan as written

- **Phase 1** needed `git clone --no-local` (not plain `git clone`): filter-repo refuses to rewrite
  a local clone that reuses the source's object store, since it is not "freshly packed".
- **Phase 1** installed `git-filter-repo` to the Python _user_ scripts directory, not
  `C:\Python313\Scripts`. The binary is at
  `C:/Users/smacd/AppData/Roaming/Python/Python313/Scripts/git-filter-repo.exe`, and the
  `git filter-repo` subcommand form does not resolve; invoke the exe by full path.
- **Phase 2** removed `demo.js`'s `import "./style.css"` (planned for Phase 5). Deleting
  `style.css` and keeping its import would have left a commit that cannot build; the deletion and
  the import removal are one change.
- **Phase 1's** commit predates this status table, so Phases 1 and 2 are both marked here in the
  Phase 2 commit.

## Context

`toybox` (`C:/Users/smacd/repos/toybox`, branch `master`, HEAD `03180dd`, clean, 15 commits,
27 tracked files) is a weekend project: vanilla JS ES modules + Canvas 2D + Vite, one hardcoded
Sokoban level with grid movement, crate pushing, goal highlighting, completion detection,
restart, and snapshot undo.

Its own `PLAN.md` already anticipates this migration ("Pause and handoff — 2026-09-13") and
lists the decisions to settle, all of which are now settled below.

Sequence after this migration, deliberately **not** part of it:

1. This migration — land it, vanilla JS, CI green.
2. Progressive TypeScript refactor, file by file.
3. Merge into `src/lib/gamebox/` — **blocked**, see [Deferred](#deferred-and-open-items).

## Decisions (locked — do not relitigate)

| Decision            | Choice                                          | Rationale                                                                                                                                                                                                                                 |
| ------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name                | **Brainfreeze**                                 | A name the user had used years ago for the same idea. "Sokoban" is trademarked (Falcon Co., Ltd., acquired 2001) though largely genericized; risk was negligible, but an own name suits a portfolio site better and lets mechanics drift. |
| Location            | `/games/brainfreeze/`                           | `/demos/` is unusable — see finding F1. The `games` section is already titled "Games & Demos" and hosts blockbreaker.                                                                                                                     |
| History             | `git filter-repo --to-subdirectory-filter`      | Full history with native `git log`/`blame` on the new path. One prefix = zero path collisions with this repo's root files on an unrelated-histories merge.                                                                                |
| Formatting          | Reformat once, in its own commit                | Matches the existing "keep bulk formatting separate from behavior changes" preference (TODO.md item 2). No lingering config exception to remember.                                                                                        |
| Docs                | `docs/brainfreeze/`, collaboration rules merged | Toybox's AGENTS.md "Collaboration" section conflicts with this repo's 3-level authorization system; the root AGENTS.md wins. Only toybox's "Project constraints" survive.                                                                 |
| Rules module naming | Stays Sokoban-named                             | `sokoban-game.js` / `class SokobanGame` is an internal descriptive identifier for the _genre ruleset_, distinct from the _product_ name. Avoids churn in files about to become TS.                                                        |

## Verified findings

Established 2026-09-13 by direct inspection and trial runs. Trust these; do not re-derive.

- **F1 — `/demos/` is unusable as a content path.** `deploy-www.sh` rsyncs staging → doc root
  with `--delete-after --exclude demos/`, because `~/smacdo.com/demos` is a symlink to
  `~/turboprop-demos` holding WASM artifacts. Evidence: `.github/workflows/deploy_template.yml`
  (comment above "Promote to live") and `docs/games-and-graphics.md`. Anything Zola generates
  into `public/demos/` works locally and is silently dropped on deploy. This also blocks the
  "Rename /games/ to /demos/" item in `TODO.md`.
- **F2 — toybox's JSDoc passes this repo's strict TypeScript config.** All six `.js` files were
  copied to a scratch tree and checked with this repo's exact `tsconfig.json` plus
  `allowJs`/`checkJs`: **zero errors**, all six confirmed present via `--listFiles`. No type
  cleanup is needed to land the graft, so the TS refactor can be genuinely progressive.
- **F3 — Prettier reformatting is total.** Toybox is 2-space/80-col; this repo is 4-space/100-col.
  Measured: `game.js` 354 changed lines of 196, `sokoban_game.js` 519 of 307 — effectively every
  line of every file. CI runs `format:check` over `**/*.{ts,js,mjs,css,md}`, so the graft breaks
  CI on arrival unless Phase 4 runs.
- **F4 — grafted `.js` would be silently unlinted.** `eslint.config.mjs` covers only
  `src/**/*.ts` and `static/js/**/*.js`. Phase 3 adds a `src/**/*.js` block.
- **F5 — canvas geometry conflicts.** `#game-container` is a hard `aspect-ratio: 16 / 9` box
  (`static/css/style.css:384`) with the canvas stretched to 100%/100%. The board is 8×8 tiles at
  64px = 512×512 and would render distorted. Fixing this also closes toybox's "canvas clipping"
  task (8 rows × 64px = 512 > the old hardcoded 480 height).
- **F6 — local tooling. Resolved.** `zola` and `make` were not on PATH during the migration, so
  `npm run build` could not be run locally. Zola 0.22.1 — matching the CI pin exactly — is now
  installed via `winget install getzola.zola --version 0.22.1`; the Makefile has since been
  replaced by npm scripts, so `make` is no longer needed at all. `npm run build` and `zola check`
  both pass locally. `npm ci` warns that esbuild's postinstall was blocked, but `npx esbuild
--version` works (0.25.12) and `node_modules/@esbuild/win32-x64` is present.
- **F7 — slug/filename coupling.** `templates/games/page.html` resolves the demo script as
  `/js/demos/{{ page.slug }}.js`. The content filename and the esbuild output basename must
  match exactly: `brainfreeze.md` ⇒ `brainfreeze.js`.

## Guardrails

- **Never push, never tag.** Pushes to `master` deploy to staging; `releases-v*` tags deploy to
  production. All phases are local commits only.
- **Never create content under `content/demos/`** (finding F1).
- **Do not add a test runner** or test infrastructure — root `AGENTS.md` forbids it without a task
  that requires it. Vitest stays a backlog item.
- **Do not touch `src/lib/gamebox/` or the blockbreaker demo.** The gamebox merge is a later,
  separate, currently-blocked step.
- **Keep Phase 4 formatting-only.** No behavior changes in that commit.
- The `toybox` repo is left untouched throughout as the pristine original.

---

## Phase 0 — Prep

1. Commit this runbook plus pointers to it from `AGENTS.md` and `TODO.md`.
2. Install git-filter-repo:

    ```sh
    pip install git-filter-repo
    git filter-repo --version
    ```

    Fallback if the `git filter-repo` subcommand is not found after install, invoke directly:
    `python C:/Python313/Scripts/git-filter-repo <args>`.

**Verify:** `git filter-repo --version` prints a version.

## Phase 1 — Graft the history (commit 1)

Work on a throwaway clone so `toybox` is never modified.

```sh
git clone C:/Users/smacd/repos/toybox C:/Users/smacd/toybox-graft-tmp
cd C:/Users/smacd/toybox-graft-tmp
git filter-repo --to-subdirectory-filter src/demos/brainfreeze

cd C:/Users/smacd/repos/smacdo_www/smacdo_www
git remote add toybox-graft C:/Users/smacd/toybox-graft-tmp
git fetch toybox-graft
git merge --allow-unrelated-histories toybox-graft/master -m "graft toybox history as brainfreeze demo"
git remote remove toybox-graft
rm -rf C:/Users/smacd/toybox-graft-tmp
```

All 27 tracked files land under `src/demos/brainfreeze/`, preserving toybox's internal layout
(so game sources arrive at `src/demos/brainfreeze/src/*.js` — Phase 2 flattens this). Authorship
and dates are preserved; SHAs change.

**Why one prefix rather than a per-file `--path-rename` map:** a rename map would leave toybox's
`package.json`, `package-lock.json`, `eslint.config.js`, `.gitignore`, `.prettierrc.json` and
`.prettierignore` at the repo root, colliding head-on with this repo's own files across unrelated
histories. A single prefix guarantees a conflict-free merge.

**Verify:** `git log --oneline -- src/demos/brainfreeze` shows all 15 toybox commits; working tree
is otherwise unchanged.

## Phase 2 — Reorganize and strip scaffolding (commit 2)

All paths below are relative to `src/demos/brainfreeze/` unless stated otherwise.

**Move game sources up one level, renaming to this repo's conventions:**

| From                   | To                 | Why                                          |
| ---------------------- | ------------------ | -------------------------------------------- |
| `src/main.js`          | `demo.js`          | Matches blockbreaker's `demo.ts` entry point |
| `src/game.js`          | `game.js`          |                                              |
| `src/input.js`         | `input.js`         |                                              |
| `src/level.js`         | `level.js`         |                                              |
| `src/sokoban_game.js`  | `sokoban-game.js`  | kebab-case, matching `game-runner.ts`        |
| `src/levels/level1.js` | `levels/level1.js` |                                              |

**Move docs to `docs/brainfreeze/`** (repo root relative): `README.md`, `PLAN.md`, `TASKS.md`.

**Reduce toybox's `AGENTS.md` to `docs/brainfreeze/constraints.md`:** keep only its "Project
constraints" section (vanilla JS + Canvas 2D, no UI framework/engine/physics/ECS, static terrain
vs dynamic entities separate, grid coordinates, rules independent of browser APIs, primitive
rendering). Drop its "Collaboration" section entirely — it conflicts with the root `AGENTS.md`.

**Delete** (Vite scaffolding and superseded config): `index.html`, `package.json`,
`package-lock.json`, `jsconfig.json`, `eslint.config.js`, `.prettierrc.json`, `.prettierignore`,
`.gitignore`, `CLAUDE.md`, `src/style.css`, `src/assets/` (hero.png, javascript.svg, vite.svg),
`public/favicon.svg`, `public/icons.svg`.

**Promote** `.vscode/extensions.json` to the repo root (recommends eslint + prettier, both used
here; the root `.gitignore` already whitelists exactly that file). Delete
`.vscode/settings.json` with the rest of the prefix.

**Verify:** `src/demos/brainfreeze/` contains exactly `demo.js`, `game.js`, `input.js`,
`level.js`, `sokoban-game.js`, `levels/level1.js`. No stray `src/`, `public/`, or `.vscode/`
inside the prefix.

## Phase 3 — Wire into the build (commit 3)

**`package.json`** — add alongside the existing build scripts:

```json
"build:brainfreeze": "npx esbuild src/demos/brainfreeze/demo.js --bundle --outfile=public/js/demos/brainfreeze.js"
```

**`Makefile`** — add to the `build` target, after `npm run build:demos`:

```make
	npm run build:brainfreeze
```

**`tsconfig.json`** — add to `compilerOptions`: `"allowJs": true, "checkJs": true`; extend
`include` to `["src/**/*.ts", "src/**/*.js"]`. Leave `exclude` alone. Verified clean by F2.

**`eslint.config.mjs`** — add before the `static/js/**/*.js` block:

```js
{
    files: ["src/**/*.js"],
    extends: [js.configs.recommended],
    rules: {
        "no-unused-vars": ["error", { args: "all", argsIgnorePattern: "^_" }],
    },
    languageOptions: {
        globals: globals.browser,
    },
},
```

**Verify:** `npm run typecheck` and `npm run lint` both pass. Formatting still fails here — that is
expected and is Phase 4's job.

## Phase 4 — Reformat (commit 4, formatting only)

```sh
npx prettier --write "src/demos/brainfreeze/**/*.js" "docs/brainfreeze/**/*.md"
```

**Verify:** `npx prettier --check "src/demos/brainfreeze/**/*.js" "docs/brainfreeze/**/*.md"`
passes; `npm run typecheck` and
`npm run lint` still pass; `git diff` for this commit contains no behavior changes.

## Phase 5 — Page and code adaptation (commit 5)

**`content/games/brainfreeze.md`:**

```toml
+++
title = "Brainfreeze"
description = "A Sokoban-style puzzle game: push every crate onto a goal square."
date = 2026-09-13
weight = 20

[extra]
platforms = ["web"]
status = "demo"
loader = "ts"
aspect = "1 / 1"
+++

Use **WASD** to move, **R** to restart, and **Z** to undo.
```

`weight = 20` sorts it after blockbreaker (`weight = 10`) under the section's `sort_by = "weight"`.

**`templates/games/page.html`** — make the container aspect front-matter driven so Brainfreeze can
be square without affecting blockbreaker (note Tera single quotes inside the HTML double quotes):

```html
<div
    id="game-container"
    style="aspect-ratio: {{ page.extra.aspect | default(value='16 / 9') }}"
></div>
```

**`src/demos/brainfreeze/demo.js`** — three changes:

1. Query `#game-canvas` (the id the template provides), not `#game`.
2. Drop `import "./style.css";` — Vite handled that; esbuild + site CSS replace it.
3. Set the canvas bitmap to 512×512 before constructing the game. This closes the "canvas
   clipping" task (finding F5).

**Verify:** `npm run build:brainfreeze` emits `public/js/demos/brainfreeze.js`; typecheck, lint,
and a scoped prettier check all pass. Then **hand to the user** for `make build` and a browser check
(finding F6): board renders square and uncropped, WASD/R/Z work, no console errors.

## Phase 6 — Bookkeeping (commit 6)

- `docs/brainfreeze/README.md` — replace the Vite run instructions (`npm run dev`/`preview`) with
  `make serve` + `npm run build:brainfreeze`; update the "Files to know" paths; record that the
  migration is complete.
- `docs/brainfreeze/PLAN.md` — replace the "Pause and handoff" section with the completed
  migration and the decisions above.
- `docs/brainfreeze/TASKS.md` — tick the canvas-clipping task; keep Vitest, level validation, and
  listener disposal open; add the progressive TypeScript refactor.
- Product references across the grafted docs become "Brainfreeze"; genre references stay "Sokoban".
- Root `AGENTS.md` — add `src/demos/brainfreeze/` to the Directory Structure block.
- Root `TODO.md` — record finding F1 against the "Rename /games/ to /demos/" item.

---

## Deferred and open items

- **Gamebox merge is blocked pending a decision.** The user's stated endgame is folding this into
  `src/lib/gamebox/`, but `AGENTS.md` (Continuity section) refers to "the planned removal below"
  with no such section present in that file, and `docs/games-and-graphics.md` calls the engine's
  details "not requirements for the future rewrite" and says to preserve the WASM integration
  "during engine removal". `PLAN.md` does not mention the engine at all. **Resolve whether gamebox
  is being removed/rewritten before refactoring Brainfreeze toward it.**
- **Input listener disposal** — `input.js` attaches `keydown`/`keyup`/`blur` to `window` at
  construction and never removes them. Carried over from toybox's TASKS.md, and now genuinely
  relevant on a multi-page site.
- **No test runner** comes across; Vitest and the SokobanGame unit tests stay in
  `docs/brainfreeze/TASKS.md`.
- **Level data validation** at construction — still unimplemented, still in TASKS.md.
- **`/games/` → `/demos/` rename** — blocked by finding F1.
