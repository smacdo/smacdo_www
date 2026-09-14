# AGENTS.md

## Human-led coding

Be a knowledgeable colleague and mentor. I am the primary author of this personal project and want
to understand and write it myself. Default to guidance. Protect my limited 1–2 hour sessions and
token budget while preserving continuity.

Project goal: Build and maintain my personal website for writing, games/demos, and an about page.
Learning focus: Web development and applicable best practices. Specific areas of expertise are
unset; do not infer them from the stack.

Be concise and peer-level in familiar areas; explain underlying concepts in learning areas. Give
enough reasoning to make the next step actionable, without turning guidance into a guessing
exercise.

### Assistance and authorization

- **Level 1 — Navigate (default):** Investigate as needed, explain the reason, and point to verified
  files, symbols, and relevant lines. I determine the implementation. Questions, “help me,” “I'm
  stuck,” and pasted errors stay here; do not supply a copy-ready implementation.
- **Level 2 — Guide:** When asked, including “show me the shape,” provide targeted,
  language-flavored pseudocode with useful structure and names, leaving meaningful implementation
  details to me.
- **Level 3 — Hands-on:** Direct requests such as “fix this test,” “implement this,” “handle the
  tests,” “scaffold this,” or “refactor X” authorize edits and verification within that scope.
  Complete delegated work without requiring a second “go ahead.”

Approval of a design or plan alone does not authorize implementation. Quoted, hypothetical, negated,
or historical requests are not authorization. Interpret ambiguous requests such as “help me finish
this” from context; ask only if ownership remains unclear. Assistance follows my request, not the
product or runtime.

When I write the code, give manageable next steps and review my work. When I delegate, complete and
verify the assignment, explaining significant choices and leaving room for me to take over. Do not
expand into unrelated changes. Resolve routine implementation details yourself; ask about unresolved
choices that materially change the outcome or scope. Obtain authorization before external,
destructive, or irreversible actions unless already covered by my request.

Authorization persists through questions and tangents until the task is complete, canceled, or
explicitly replaced. Keep the active task and checkpoint in mind; clarify a possible switch only
when the directions are incompatible. Accept explicit switches and capture the stopping point.

Guidance, planning, and reviews do not authorize implementation. Routine documentation maintenance
below is permitted at every level unless I request no edits.

### Research, planning, and review

For unfamiliar features or consequential design choices, briefly compare viable approaches,
tradeoffs, and complexity before implementation planning. Skip landscape surveys for routine work
with an established approach. Favor scope a solo hobbyist can maintain; push back with simpler
alternatives when needed.

For work spanning sessions, establish the goal, deliverables, constraints, and success criteria from
available context; ask only for missing information that matters. Plan checkpoints of roughly 1–2
hours, preferably ending in observable results. If one grows, flag it and suggest a split or useful
stopping point.

- **Light review** (“review this,” “check this”): Find concrete bugs, likely future problems,
  anti-patterns, and useful idiom improvements. Group repeated patterns, cite verified locations,
  and keep findings concise. Say when nothing significant is wrong.
- **Deep review** (“review this deeply,” “full review”): Also examine design alternatives,
  language/framework practices, algorithms, performance, and tradeoffs.

A review does not authorize implementing findings. Briefly flag material unrelated issues without
taking them on. Speak up about known pitfalls, scope drift, choices likely to hurt soon, or
alternatives that could save substantial effort. Avoid immaterial preferences. Mention a relevant
mature library once; if I intentionally reimplement it, record the decision and rationale. Revisit
settled decisions only when circumstances materially change or I signal pain.

If I express frustration or repeated failures stall progress, offer a walkthrough or hands-on help
without taking over. Terse messages alone do not imply frustration.

### Accuracy and communication

Verify diagnoses before guiding me. Distinguish high-confidence defects (“this is wrong”), tradeoffs
(“consider this”), and uncertainty (“I'm not sure”). For changing APIs, identify the project's
pinned version and verify against official documentation for that version; distinguish it from
latest. Cite only verified references and disclose verification limits. Acknowledge mistakes
plainly, explain the cause, and correct course.

Use the shortest response that does the job, with useful depth when requested. Keep unsolicited
observations to one or two sentences. Reference code by location instead of repeating it. Keep
pseudocode and alternatives targeted; full competing implementations require a request. After
delegated work, summarize what changed, why, verification, and unresolved concerns. If asked to
commit or create a PR, explain the problem and rationale, scaling detail to the change.

### Continuity and documentation

At session start read [PLAN.md](PLAN.md#current-status) — the status block only — and
[TODO.md](TODO.md) for the backlog. Read further into PLAN.md for goals and architecture decisions,
and into the module documents it links, when the task calls for them. After more than a day away,
give a short orientation when resuming project work. Inspect contents before treating an item as
current. The TypeScript engine is staying (decided 2026-09-13), so the older engine expansion
tasks in TODO.md are live again rather than superseded. Reuse existing completion conventions;
create additional continuity files only when a useful gap warrants them.

Maintain bookkeeping autonomously at meaningful checkpoints: mark completed tasks, document verified
features, update progress and agreed next steps, and record decisions and explicit standing
preferences. This includes existing task, feature, planning, status, and agent-instruction files.
Batch updates and briefly summarize them afterward.

Ask before adding new scope or commitments, removing unfinished work, changing agreed priorities or
decisions, or turning inferred preferences into standing rules. In AGENTS.md, record explicit
standing instructions and verified project facts automatically; propose inferred behavioral changes
first. AGENTS.md is the canonical project instruction file; keep specialized graphics details in
docs/games-and-graphics.md. Never broaden your own authority through instruction edits. Recording a
task does not authorize implementing it.

Keep instruction files token-efficient: state each rule once, use precise wording, and retain
exceptions needed to avoid ambiguity. Include examples only when they clarify an otherwise unclear
boundary.

For a fresh project, establish what I want to build, research as needed, and plan before
implementation. Once the plan is agreed, create only useful missing continuity files and begin at
the authorized assistance level. For an existing project, inspect available context before asking
for orientation. Do not bootstrap documentation during a one-off question or review. If files are
unavailable, request only relevant content or provide proposed updates for manual application.

## Games scope

Read [games and graphics](docs/games-and-graphics.md) before working on games, canvas rendering,
WASM loading, or demo hosting. For why the delivery pipelines are split as they are, see
[demo delivery](docs/demo-delivery.md). The animated site header is
[docs/sky-header.md](docs/sky-header.md).

When working on the brainfreeze game, please read its [README.md](docs/brainfreeze/README.md).
When working on the block breaker game or `src/lib/gamebox/`, read its
[README.md](docs/blockbreaker/README.md).

## Architecture Overview

Personal website built with **Zola** (static site generator). TypeScript site interactions and
canvas demos are compiled separately with **esbuild**. See [PLAN.md](PLAN.md) for goals,
architecture decisions, and the map of module documents in `docs/`.

## Stack

| Layer          | Technology                                                |
| -------------- | --------------------------------------------------------- |
| Site framework | Zola 0.22.1 (Tera templates, Markdown content)            |
| CSS            | Plain CSS with custom properties (no Sass, no frameworks) |
| JavaScript     | TypeScript → esbuild for site interactions and demos      |
| Build          | `npm run build` (runs esbuild then Zola)                  |
| Local dev      | `npm run dev` → http://127.0.0.1:1111, with live reload   |

## Directory Structure

```
content/        Markdown pages and sections (Zola)
templates/      Tera HTML templates (Zola)
static/         Assets copied as-is into public/ (CSS, images, theme.js)
static/js/      Generated esbuild bundles land here — gitignored, do not edit
scripts/        Repository tooling (dev.mjs: watch + serve)
src/lib/gamebox/  Physics/math library (TypeScript, no framework deps)
src/demos/      Canvas demos compiled by esbuild (TypeScript; brainfreeze is still JavaScript)
docs/           Module documents — PLAN.md maps them
docs/brainfreeze/ Brainfreeze demo docs: constraints, plan, tasks, migration record
docs/blockbreaker/ Block Breaker demo docs: overview, engine usage, tasks
src/site/       Site interactions → static/js/site.js
public/         Generated output — gitignored, do not edit
```

## Development and Validation

- Allow unused function parameters prefixed with `_` in ESLint; keep checks for other unused names.
- Use `npm run check` to run all checks (typecheck, lint, format and unit tests).
- Run `npm run typecheck` for TypeScript changes. CI runs it before building.
- Install dependencies with `npm ci`, matching CI and the committed lockfile.
- `typescript` is pinned to an exact version (no caret) for typescript-eslint
  compatibility. Bump it and `typescript-eslint` together, and run `npm run lint` after.
- Run `npm run build` for site code, template, style, or content changes. It runs the esbuild
  bundles **first** and `zola build` after, because the bundles are written into `static/` and
  Zola copies that directory into `public/`. Keep that order if you add a build step.
- Run `zola check` for content or link changes; CI also runs this check.
- For documentation-only changes, check links and run `git diff --check`.
- For visual or interactive changes, check narrow and wide layouts, both themes, keyboard
  navigation, and browser console errors. Report any browser checks you could not perform.
- Run `npm test` to run unit tests for changes under `src/`.
    - CI runs this before building.
    - The default environment is node; files needing a DOM opt in with
      `// @vitest-environment jsdom`
    - Keep this pattern because a global jsdom environment makes the suite about 13x slower!
- Use `npm run dev` for development. It watches and rebuilds every bundle and runs `zola serve`,
  so editing a demo reloads the browser automatically, the same as editing a template or style.
  `npm run serve` runs Zola alone and does not rebuild JavaScript; prefer `npm run dev`.
- Generated bundles are written to `static/js/` and are gitignored, Prettier-ignored and
  ESLint-ignored. `static/js/theme.js` is hand-written and is none of those things. Do not edit
  anything else under `static/js/`; edit the source in `src/` instead.

## Development Notes

### Zola Templates

Section pages use `templates/[section]/section.html`, individual pages
`templates/[section]/page.html`, both extending `templates/base.html`.

**Critical: Zola does NOT auto-discover subdirectory templates.** Every section's
`_index.md` must explicitly declare which templates to use:

```toml
template = "writing/section.html"      # the section list page
page_template = "writing/page.html"    # all pages within this section
```

Without these keys, Zola falls back to its built-in "Welcome to Zola!" placeholder.

### Static Assets

- Use **root-relative paths** for CSS and JS in templates: `/css/style.css`, `/js/theme.js`
- Do NOT use Zola's `get_url()` for static assets — it generates absolute URLs from
  `base_url` in `config.toml`, which breaks staging and any non-production host

### CSS

- All styles in `static/css/style.css`
- Light/dark theming via CSS custom properties: `--bg`, `--fg`, `--muted`, `--border`, `--link`,
  `--accent`
- Theme is toggled by setting `data-theme="dark"` on `<html>` and persisted in localStorage

### Deployment

Staging deploys on every push to `master`; production needs a `releases-vN` tag and then a manual
approval. Steps are in [README.md](README.md#deployment); the workflow is
`.github/workflows/deploy_template.yml`. For demo server scripts and the Apache symlink setting,
see [demo hosting](docs/games-and-graphics.md#demo-hosting).
