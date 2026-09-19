# smacdo.com Redesign Plan

Why the site is built the way it is, and what is left to do. Implementation detail for individual
modules lives in [docs/](docs/); this file stays at the level of goals, decisions, and open work.

## Current status

Reconciled against source on 2026-09-13.

The Zola rewrite is done and deployed. Content sections, the theme toggle, the TypeScript demo
pipeline, and the WASM integration are all in place, as is the animated sky header. Typecheck,
lint, formatting, and unit tests run locally and in CI via `npm run check` — CI has not been
observed passing remotely.

What is actually open:

| Area          | State                                                                                              |
| ------------- | -------------------------------------------------------------------------------------------------- |
| Visual polish | Catppuccin light palette and typography tuning — below                                             |
| Sky header    | Castle silhouette, full-bleed footer — [docs/sky-header.md](docs/sky-header.md)                    |
| Demo delivery | WASM artifacts still share the document root — [docs/demo-delivery.md](docs/demo-delivery.md)      |
| Block Breaker | Staying TypeScript; gamebox's shape still open — [docs/blockbreaker/](docs/blockbreaker/README.md) |
| Brainfreeze   | MVP progression — [docs/brainfreeze/](docs/brainfreeze/README.md)                                  |
| Backlog       | [TODO.md](TODO.md#improvement-walkthrough-2026-09-12) — engine bugs, `/demos/` rename              |

## Goals

- Replace React+TypeScript SPA with a Zola static site — simpler, faster, no JS framework required
- Create clear sections: Home, About, Writing, Games, Tools
- Support embedded WebAssembly games built and deployed from a separate Rust repository
- Support TypeScript/canvas demos built with esbuild
- Establish a sustainable writing section for long-form articles
- Visual direction: gamedev aesthetic, Catppuccin colors, animated header

## Non-Goals (explicitly deferred)

- Tools page functionality — placeholder only for now
- Rust/WASM game ports — separate repository, separate effort
- Comments on articles
- Search functionality

---

## Architecture Decisions

### Static Site Generator: Zola

- Single Rust binary, no Node.js required for the site itself
- Tera templates (Jinja2/Django-like syntax — familiar from Python)
- Built-in Markdown, RSS feed generation, syntax highlighting, Sass (not used)
- Output: `public/` directory, served as static files
- Zola version pinned in CI for reproducible builds (currently `0.22.1`)

### CSS: Plain CSS with custom properties

- No Sass — one less build step, simpler mental model
- CSS custom properties for theming (Catppuccin dark/light palette)

### JS/TypeScript Demos: esbuild

- Each demo is a standalone TypeScript file compiled by esbuild
- Source lives in `src/demos/[name]/demo.ts`
- esbuild outputs to `static/js/demos/[name].js` and runs **before** `zola build`, which then
  copies `static/` into `public/`
- No React, no Vite, no bundler config files
- The gamebox library (`src/lib/gamebox/`) is available to every demo; Block Breaker is currently
  its only consumer — see [docs/blockbreaker/README.md](docs/blockbreaker/README.md)

### Build Orchestration: Makefile — superseded 2026-09-13

The Makefile was removed in favor of npm scripts: it used none of Make's dependency
tracking (every target was phony), `make clean`'s `rm -rf` did not work on Windows, and
three of its four build lines already just called npm. Its commands now live in `package.json`
as `npm run build`, `npm run serve`, and `npm run clean`, the last of which removes `public/`
only.

### WASM Games: Separate Repository

- WASM builds live in a separate Rust repository (turboprop)
- That repo's CI builds and rsyncs artifacts directly to the web server
- URL contract: `/demos/<slug>/loader.js`, with content under `/demos/<slug>/content/`. Documented
  in [games and graphics](docs/games-and-graphics.md#wasm-games); final cross-repository agreement
  remains unverified.
- Site's game page template provides the canvas container within normal site chrome
- Why the two delivery pipelines are split as they are, and the move that would decouple them:
  [docs/demo-delivery.md](docs/demo-delivery.md)

### Hosting

- Current: Dreamhost (during transition)
- Planned: Self-hosted home server
- Deployment: GitHub Actions → rsync over SSH; staging on every push to `master`, production on a
  tag matching `releases-v\d+`. The workflow itself is
  [.github/workflows/deploy_template.yml](.github/workflows/deploy_template.yml) — read it rather
  than a copy, and see [README.md](README.md#deployment) for how to trigger a release.

---

## Completed phases

Compressed 2026-09-13; the per-item checklists are in git history. Completion means the
implementation is present, not that it was freshly verified in a browser or on a host.

- **Phase 1 — Zola foundation.** Zola project, directory structure, base template, home page,
  vanilla-JS theme toggle, npm/esbuild setup, CI updated. React codebase removed, keeping
  `src/lib/gamebox/`.
- **Phase 2 — Content sections.** About, Writing (with RSS), Games gallery and game pages, Tools
  placeholder, nav, 404 page and `.htaccess`.
- **Phase 3 — JS demo infrastructure.** React wrappers stripped from gamebox; Block Breaker
  recovered from git history after the Phase 1 deletion and rebuilt as a standalone esbuild demo.
  See [docs/blockbreaker/](docs/blockbreaker/README.md).
- **Phase 4 — WASM integration.** Game page template loads and initializes WASM through
  `loader.js`; the implemented contract is documented in
  [games and graphics](docs/games-and-graphics.md#wasm-games).
- **Phase 5 — Visual polish.** Self-hosted fonts, heading hierarchy, full-bleed header groundwork,
  and the animated sky canvas with sun, moon, stars, clouds, silhouette and drag-to-scrub.
  See [docs/sky-header.md](docs/sky-header.md). Remaining colour and typography work is below.
- **Phase 6a — Runtime gallery discovery deleted.** The demo gallery now renders from the content
  tree alone. The reasoning is worth not re-deriving:
  [docs/demo-delivery.md](docs/demo-delivery.md).

---

## Open work

### Visual polish

- [ ] Update CSS variables to full Catppuccin Latte (light) + Mocha (dark) palette
    - Light: bg `#eff1f5`, fg `#4c4f69`, muted `#6c6f85`, border `#ccd0da`, link `#1e66f5`
    - Dark theme is already Mocha — verify and tune
    - Current light colors use warm ink/paper rather than Latte; both themes already define
      `--accent`
- [ ] Article line-height, font-size, and measure tuning
- [ ] Code block styling with JetBrains Mono + Catppuccin syntax highlight theme

### Future / deferred

- [ ] Move WASM artifacts off the document root —
      [docs/demo-delivery.md](docs/demo-delivery.md)
- [ ] Finalize the WASM embedding contract with the turboprop repo — the implemented URL/API
      shape is documented, but cross-repository agreement is still unverified
- [ ] Games gallery card design (thumbnail, hover effect, download links)
- [ ] First real Writing article — dotfiles guide, DevPod tutorial, graphical demo write-ups
- [ ] Game download links (desktop Windows/Mac builds) and storefront links (itch.io, Steam)
- [ ] Interactive parallax header — scroll parallax, shooting stars, day/night toggle
      ([docs/sky-header.md](docs/sky-header.md))
- [ ] Tools page (undefined scope — build when ready)
