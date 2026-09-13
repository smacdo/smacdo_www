# AGENTS.md

This file provides guidance to Codex and other coding agents working in this repository.

We will build my personal website together. Your job is to help me improve my web development
skills, and teach me best practices where applicable. Make suggestions, and catch complexity early.

Do not write new gameplay code unless specifically instructed. The existing TypeScript engine
is planned for removal and a simpler future rewrite; do not expand it or its test infrastructure
unless required by a specific task. Removal requires an explicit request. Preserve the separate
WASM integration. Read [games and graphics](docs/games-and-graphics.md) before working on games,
canvas rendering, WASM loading, or demo hosting.

# Core Workflow: Research → Plan → Implement → Validate

- Research - Understand existing patterns and architecture
- Plan - Explain the approach for substantial changes; resolve routine choices independently
- Implement - Follow existing patterns; add tests and error handling where the change warrants them
- Validate - Use the checks below and report what passed, failed, or could not be run

# Problem Solving

Prefer simple solutions and catch unnecessary complexity early. Investigate uncertainty using
the existing code and available checks. Ask for guidance when a missing requirement or meaningful
tradeoff needs the user's input; otherwise proceed with reasonable assumptions.

# Architecture Overview

Personal website built with **Zola** (static site generator). TypeScript site interactions and canvas demos
are compiled separately with **esbuild**. See `PLAN.md` for the full redesign plan and phased roadmap.

# Stack

| Layer | Technology |
|---|---|
| Site framework | Zola 0.22.1 (Tera templates, Markdown content) |
| CSS | Plain CSS with custom properties (no Sass, no frameworks) |
| JavaScript | TypeScript → esbuild for site interactions and demos |
| Build | `make build` (runs Zola then esbuild) |
| Local dev | `make serve` → http://127.0.0.1:1111 |

# Directory Structure

```
content/        Markdown pages and sections (Zola)
templates/      Tera HTML templates (Zola)
static/         Assets copied as-is into public/ (CSS, JS, images)
src/lib/gamebox/  Physics/math library (TypeScript, no framework deps)
src/demos/      TypeScript canvas demos (compiled by esbuild)
src/site/       Site interactions → public/js/site.js
public/         Generated output — gitignored, do not edit
```

# Development and Validation

- Install dependencies with `npm ci`, matching CI and the committed lockfile.
- Run `make build` for site code, template, style, or content changes.
- Run `zola check` for content or link changes; CI also runs this check.
- For documentation-only changes, check links and run `git diff --check`.
- For visual or interactive changes, check narrow and wide layouts, both themes, keyboard
  navigation, and browser console errors. Report any browser checks you could not perform.
- Existing TypeScript tests are not wired to a test runner or an `npm test` command. Do not
  report a build as passing tests or add test infrastructure without a task that requires it.
- `make serve` starts only Zola; it does not compile TypeScript. After TypeScript changes, run
  `npm run build:site` or `npm run build:demos` as appropriate. If Zola regenerates `public/`,
  rebuild the bundles before checking browser behavior.

# Development Notes

## Zola Templates

- Templates use Tera syntax — similar to Jinja2/Django templates
- `templates/base.html` is the base layout all pages extend
- Section pages use `templates/[section-name]/section.html`
- Individual pages use `templates/[section-name]/page.html`
- Front matter is TOML between `+++` delimiters

**Critical: Zola does NOT auto-discover subdirectory templates.** Every section's
`_index.md` must explicitly declare which templates to use:

```toml
template = "writing/section.html"      # the section list page
page_template = "writing/page.html"    # all pages within this section
```

Without these keys, Zola falls back to its built-in "Welcome to Zola!" placeholder.

## Static Assets

- Use **root-relative paths** for CSS and JS in templates: `/css/style.css`, `/js/theme.js`
- Do NOT use Zola's `get_url()` for static assets — it generates absolute URLs from
  `base_url` in `config.toml`, which breaks staging and any non-production host

## CSS

- All styles in `static/css/style.css`
- Light/dark theming via CSS custom properties (`--bg`, `--fg`, `--muted`, `--border`, `--link`)
- Theme is toggled by setting `data-theme="dark"` on `<html>` and persisted in localStorage
- No Sass, no utility frameworks — plain CSS only

## Deployment

**Staging** deploys automatically on every push to `master`.

**Production** requires a `releases-vN` tag:
```bash
# Replace N with the intended release number.
git tag releases-vN
git push origin releases-vN
```
Then approve the pending deployment in GitHub Actions (Settings → Environments → production).

For demo server scripts and the required Apache symlink setting, see
[demo hosting](docs/games-and-graphics.md#demo-hosting).
