# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this
repository.

We will build my personal website together. Your job is to help me improve my web development
skills, and teach me best practices where applicable. Make suggestions, and catch complexity early.

Do not write new gameplay code unless specifically instructed. Creating tests for gameplay and
engine code is allowed.

# Core Workflow: Research → Plan → Implement → Validate

Start every feature with: "Let me research the codebase and create a plan before implementing."

- Research - Understand existing patterns and architecture
- Plan - Propose approach and verify with you
- Implement - Build with tests and error handling
- Validate - ALWAYS run `make build` after implementation to confirm the site builds cleanly

# Problem Solving

When stuck: Stop. The simple solution is usually correct.

When uncertain: "Let me ultrathink about this architecture."

When choosing: "I see approach A (simple) vs B (flexible). Which do you prefer?"

Your redirects prevent over-engineering. When uncertain about implementation, stop and ask for
guidance.

# Architecture Overview

Personal website built with **Zola** (static site generator). TypeScript canvas demos are compiled
separately with **esbuild**. See `PLAN.md` for the full redesign plan and phased roadmap.

# Stack

| Layer | Technology |
|---|---|
| Site framework | Zola 0.22.1 (Tera templates, Markdown content) |
| CSS | Plain CSS with custom properties (no Sass, no frameworks) |
| JS demos | TypeScript → esbuild → single JS file per demo |
| Build | `make build` (runs Zola then esbuild) |
| Local dev | `make serve` → http://127.0.0.1:1111 |

# Directory Structure

```
content/        Markdown pages and sections (Zola)
templates/      Tera HTML templates (Zola)
static/         Assets copied as-is into public/ (CSS, JS, images)
src/lib/gamebox/  Physics/math library (TypeScript, no framework deps)
src/demos/      TypeScript canvas demos (compiled by esbuild)
public/         Generated output — gitignored, do not edit
```

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

## Game Engine Notes

**Custom Game Engine** (`src/lib/gamebox/`)

- Pure TypeScript, no framework dependencies
- **Canvas-first games** using HTML5 Canvas with high-DPI support
- **Fixed Timestep Loop**: physics at fixed intervals with rendering interpolation
- Games extend `BaseGame` and implement `onUpdate`/`onDraw`/input methods
- Dual collision system: AABB for broad phase, precise bounds (Circle/AABB) for narrow phase
- Asset loading via `ImageLoader` with callback-based resource management
- Game logic operates on logical canvas dimensions (`this.canvasWidth/canvasHeight`)
- `src/lib/utils.ts` provides `not_null` and `clamp` — imported by gamebox files

## WASM Games

- Built in a separate Rust repository
- CI in that repo rsyncs build artifacts to the web server
- URL contract: `/games/[slug]/loader.js` exports `init(canvas: HTMLCanvasElement): Promise<void>`
- The games page template provides the canvas container; loader.js initializes into it
