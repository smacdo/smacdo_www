# smacdo.com Redesign Plan

## Goals

- Replace React+TypeScript SPA with a Zola static site — simpler, faster, no JS framework required
- Create clear sections: Home, About, Writing, Games, Tools
- Support embedded WebAssembly games built and deployed from a separate Rust repository
- Support TypeScript/canvas demos built with esbuild
- Establish a sustainable writing section for long-form articles
- Visual direction: gamedev aesthetic, Catppuccin colors, animated header (Phase 5)

## Non-Goals (explicitly deferred)

- Tools page functionality — placeholder only for now
- Rust/WASM game ports — separate repository, separate effort
- Full visual polish — Catppuccin colors, custom fonts, parallax header are Phase 5
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
- Hand-written, no utility frameworks

### JS/TypeScript Demos: esbuild

- Each demo is a standalone TypeScript file compiled by esbuild
- Source lives in `src/demos/[name]/demo.ts` (Brainfreeze is still `demo.js`)
- Corrected 2026-09-13: esbuild outputs to `static/js/demos/[name].js` and runs **before**
  `zola build`, which then copies `static/` into `public/`. The `public/js/demos/` path recorded
  here was never what shipped.
- No React, no Vite, no bundler config files
- The gamebox library (`src/lib/gamebox/`) is available to every demo; Block Breaker is currently
  its only consumer — see [docs/blockbreaker/README.md](docs/blockbreaker/README.md)

### Build Orchestration: Makefile — superseded 2026-09-13

The Makefile was removed in favor of npm scripts: it used none of Make's dependency
tracking (every target was phony), `make clean`'s `rm -rf` did not work on Windows, and
three of its four build lines already just called npm. The commands below now live in
`package.json` as `npm run build`, `npm run serve`, and `npm run clean`, the last of which
removes `public/` only. The completed checklist items further down are left as written,
since they record what was done at the time.

- `make build` — runs Zola then esbuild
- `make serve` — runs `zola serve` for local development
- `make clean` — removes `public/` and `node_modules/`
- Minimal `package.json` with esbuild as the only dev dependency

### WASM Games: Separate Repository

- WASM builds live in a separate Rust repository
- That repo's CI builds and rsyncs artifacts directly to the web server
- URL contract, corrected 2026-09-13: `/demos/<slug>/loader.js`, with content under
  `/demos/<slug>/content/`. The `/games/[slug]/` paths recorded here were never what
  shipped; Phase 4 and docs/games-and-graphics.md describe the implemented contract,
  and Phase 6b may move it to a separate host.
- `loader.js` exports `init(canvas: HTMLCanvasElement): Promise<void>`
- Site's game page template provides the canvas container within normal site chrome

### Hosting

- Current: Dreamhost (during transition)
- Planned: Self-hosted home server
- Deployment: GitHub Actions → rsync over SSH
- Staging deploys on every push to `master`
- Production deploys on tag matching `releases-v\d+`

---

## Site Structure

```
smacdo.com/
  /              Home — brief intro, animated header, links to sections
  /about/        Bio + stripped CV (no personal contact info)
  /writing/      Article list with RSS feed
  /writing/[slug]/   Individual article (Markdown-rendered)
  /games/        Games and demos gallery
  /games/[slug]/ Individual game/demo page with embedded player
  /tools/        Placeholder page
```

---

## Directory Layout

```
smacdo.com repo/
├── config.toml              Zola configuration
├── package.json             esbuild only (single dev dependency)
├── PLAN.md                  This file
│
├── content/                 Markdown content (managed by Zola)
│   ├── _index.md            Home page content
│   ├── about/
│   │   └── _index.md
│   ├── writing/
│   │   └── _index.md        Writing section index
│   └── games/
│       ├── _index.md        Games gallery index
│       ├── blockbreaker.md  BlockBreaker game page
│       ├── brainfreeze.md   Brainfreeze game page
│       └── turboprop-demo.md  WASM demo page
│
├── templates/               Tera HTML templates
│   ├── base.html            Base layout (header, nav, footer, theme toggle)
│   ├── index.html           Home page
│   ├── about.html           About + CV
│   ├── writing/
│   │   ├── list.html        Article list
│   │   └── page.html        Individual article
│   └── games/
│       ├── list.html        Games gallery
│       └── page.html        Game/demo page with embedded player
│
├── static/                  Assets copied as-is by Zola into public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── theme.js         Dark/light mode toggle (vanilla JS)
│   └── img/
│
├── src/                     TypeScript source (compiled by esbuild, not Zola)
│   ├── lib/                 Reconciled with the tree 2026-09-13
│   │   ├── utils.ts         not_null, clamp
│   │   ├── debounce.ts
│   │   └── gamebox/         Game engine + physics/math (React stripped out)
│   │       ├── base-game.ts Fixed timestep, interpolation, offscreen blit
│   │       ├── game-runner.ts  rAF loop, resize observer, key listeners
│   │       ├── object.ts    GameObject (position, velocity, bounds)
│   │       ├── bounds.ts    AABB, Circle, collision resolution
│   │       ├── math.ts      lerp, vector ops
│   │       ├── direction.ts Direction enum
│   │       ├── viewport.ts  Canvas scaling logic
│   │       ├── resources.ts ImageLoader
│   │       └── sprites.ts   SpriteDefinition
│   ├── site/
│   │   └── header.ts        Sky canvas → static/js/site.js
│   └── demos/
│       ├── blockbreaker/    Docs: docs/blockbreaker/
│       │   ├── demo.ts      Entry point (TS, until Rust port replaces it)
│       │   └── blockbreaker.ts  Game rules, level, rendering
│       └── brainfreeze/     Sokoban demo (still JS). Docs: docs/brainfreeze/
│
└── .github/
    └── workflows/
        ├── deploy_prod.yml      (unchanged)
        ├── deploy_staging.yml   (unchanged)
        └── deploy_template.yml  (updated — see CI Changes below)
```

---

## Implementation Phases

Status reconciled against source on 2026-09-12. Checked items indicate implementation present,
not fresh browser or deployment verification. The current guided improvement sequence is in
[TODO.md](TODO.md#improvement-walkthrough-2026-09-12). TypeScript checking is configured and
passes locally. Linting and formatting are configured and pass locally; the coordinated dev
command is next. All three checks are wired into deployment CI, not yet verified remotely.

### Phase 1: Zola Foundation ✅

- [x] Initialize Zola project (`config.toml`)
- [x] Create directory structure (`content/`, `templates/`, `static/`)
- [x] Remove React codebase (keep `src/lib/gamebox/` TypeScript source files)
- [x] Create `base.html` template with header, nav, footer
- [x] Create home page template and stub content
- [x] Implement dark/light theme toggle in vanilla JS
- [x] Create `Makefile` with `build`, `serve`, `clean` targets
- [x] Create minimal `package.json` with esbuild as only dependency
- [x] Update `deploy_template.yml`: install pinned Zola binary, add `npm ci`, fix output path

### Phase 2: Content Sections ✅

- [x] About page template + bio and CV content
- [x] Writing section: list template, article template
- [x] Enable RSS feed in Zola config
- [x] Games section: gallery list template, game page template with canvas container
- [x] Tools placeholder page
- [x] Wire up all nav links
- [x] 404 page template + `.htaccess`

### Phase 3: JS Demo Infrastructure ✅

- [x] Strip React wrappers from gamebox library (pure TypeScript, no framework deps)
- [x] Add esbuild compilation step to Makefile
- [x] Migrate BlockBreaker to standalone TS demo (BaseGame + game-runner.ts, no React)
- [x] Recover BlockBreaker source from git history after Phase 1 deletion

Demo-specific documentation moved to [docs/blockbreaker/](docs/blockbreaker/README.md) on
2026-09-13: current behavior, how it drives the engine, and its
[open items](docs/blockbreaker/TASKS.md).

### Phase 4: WASM Integration

- [ ] Finalize WASM embedding contract (URL structure, JS API)
- [x] Update game page template to load and initialize WASM via loader.js
- [x] Document the implemented contract in [games and graphics](docs/games-and-graphics.md#wasm-games)

Current implementation uses `/demos/<slug>/loader.js` and `load(canvas)`, with content under
`/demos/<slug>/content/`. Final cross-repository agreement remains unverified. Runtime gallery
discovery was removed in Phase 6a; the section page now lists demos from the content tree alone.

### Phase 5: Visual Polish

#### 5a: Colors + Fonts

- [ ] Update CSS variables to full Catppuccin Latte (light) + Mocha (dark) palette
    - Light: bg `#eff1f5`, fg `#4c4f69`, muted `#6c6f85`, border `#ccd0da`, link `#1e66f5`
    - Dark theme is already Mocha — verify and tune
    - Add `--accent` variable (Catppuccin mauve `#cba6f7` dark / `#8839ef` light)
- [x] Self-host fonts (download `.woff2` to `static/fonts/`, add `@font-face`)
    - **Inter** — body text
    - **Oxanium** — headings (`h1`–`h4`)
    - **JetBrains Mono** — `code`, `pre`

Current light colors use warm ink/paper rather than Latte; the palette item remains open.
Both themes already define `--accent`.

#### 5b: Full-bleed Header Restructure

- [x] Move `max-width` + `padding` from `body` to a `.page-body` inner wrapper
- [ ] `<header>` and `<footer>` become full browser-width
- [x] Nav content inside header stays centered at 800px
- [x] Nav gets semi-transparent dark pill background (readable against any sky)
- [ ] Complete remaining template/style restructure: footer is still inside `.page-body`

#### 5c: Sky Canvas — Core

Implemented in `src/site/header.ts`, compiled to `public/js/site.js`.

- [x] Add esbuild entry to `package.json` build script
- [x] Add `<canvas id="sky-canvas">` inside `<header>` in `base.html`
- [x] Add `<script src="/js/site.js" defer>` to `base.html`
- [x] Canvas is absolutely positioned, fills header, behind nav (z-index)
- [x] **Time system**: `Date` → fractional hour → angle `θ = π/2 − (hour−12)/12 * π`
- [x] **Sun/moon shared circle**: sun at θ, moon at θ + π; visibility includes a small horizon margin
- [x] **Sky gradient** (interpolated keyframes using Catppuccin palette):
    - Night: deep indigo → near-black
    - Predawn: dark blue
    - Dawn/Dusk: peach + mauve horizon glow
    - Day: Catppuccin sky/sapphire blues
- [x] Bottom edge fades to `var(--bg)` via gradient (any sky → any theme, seamless)
- [x] Sun: glowing circle with soft corona
- [x] Moon: crescent (offset fill technique)
- [x] Stars: scattered dots, fade in at dusk / out at dawn, subtle per-star twinkle

#### 5d: Clouds + Drag Interaction

- [x] **Clouds**: 4–5 layered objects, ambient left-to-right drift, wrap at edges
    - Opacity scales with daylight (invisible at night)
    - Drawn as overlapping soft circles (white/light gray)
- [x] **Drag interaction** (mouse + touch):
    - Pointer down on sun or moon → enter drag mode
    - Drag projected onto the arc circle: `θ = atan2(horizonY − y, x − centerX)`
    - Dragging one body updates θ; the other follows automatically at θ + π
    - Dragging sun below horizon naturally causes moon to rise
    - Position frozen after drag; real-time clock paused
    - Double-click / double-tap → unfreeze, return to real time

#### 5e: Foreground Silhouette v1 (hills + trees)

- [x] Rolling hill silhouette at bottom of canvas using a bezier/sine path
- [x] Simple triangle trees rising from the hills
- [x] Dark fill (slightly lighter than pure black, matches Mocha surface colors)
- [x] Sits just above the gradient fade zone

#### 5f: Foreground Silhouette v2 (castle — compare and pick)

- [ ] Alternative castle/urban skyline silhouette
- [ ] Side-by-side comparison with hills version; keep the winner

#### 5g: Typography + Reading Polish (can be done independently of canvas)

- [ ] Article line-height, font-size, and measure tuning
- [x] Heading hierarchy with Oxanium weights
- [ ] Code block styling with JetBrains Mono + Catppuccin syntax highlight theme

### Phase 6: Demo Delivery Simplification

Demos reach the browser through two unrelated pipelines. TypeScript demos are bundled by
esbuild into `static/js/demos/<slug>.js` and deployed with the site. WASM demos are built in
the turboprop repo, published by its own CI to `~/turboprop-demos/<slug>/` on the server, and
exposed at `/demos/` through a symlink inside the Apache document root.

Splitting on _how a demo is built_ is correct — different toolchains, different repos, different
release cadence. The split that is not correct is _how a demo is listed and delivered_. Two of
the September 2026 deploy failures surfaced at that seam. The unanchored `--exclude 'demos'` in
`deploy-www.sh`, which exists only to protect the symlink, also matched `js/demos/` and froze the
site's own demo bundles at an April copy — and because `--exclude` shields receiver files from
`--delete`, they could be neither updated nor removed. Separately, `.htaccess` never reached any
document root, which is an `upload-artifact` dotfile problem rather than a demos problem, but it
stayed hidden for months because prod kept promoting a stale copy from its staging area and the
only visible symptom was the symlinked `/demos/` failing on staging. See
docs/brainfreeze/MIGRATION.md finding F1.

#### 6a: Delete runtime gallery discovery ✅

`templates/games/section.html` rendered `section.pages` at build time, then a module script
fetched `/demos/metadata.json` and appended a second list describing the same demos. That script
never ran: the bare `return` on its fourth line is illegal at the top level of a module, so the
block was a parse error and the browser discarded it whole.

- [x] Remove the `<script type="module">` discovery block from `templates/games/section.html`
- [x] Decide where the version badge comes from — dropped. `.version-badge` had no CSS rule
      anywhere and, since the script never executed, had never rendered. Version and publish date
      on the demo page itself remain an open TODO, unaffected by this.
- [ ] Verify `/games/` lists each demo exactly once on staging, then prod

Why this was subtraction, not a trade:

- **The code was dead, not merely redundant.** Verified 2026-09-13 by rendering
  smacdo.com/games/ in headless Chrome: `#wasm-demos` was empty and each demo appeared exactly
  once. The illegal top-level `return` was TODO.md item 5.
- **Repairing it would have created a duplicate listing rather than fixed anything.**
  `metadata.json` holds one entry, `turboprop-demo`, which already has a content page and was
  already rendered by `section.pages`. Item 5 was therefore closed by deleting the block, not by
  making it parse. Record this clearly: the reason not to restore gallery discovery is not that
  it was broken, but that a working version would duplicate the content tree.
- **Runtime discovery could not do the job it was added for.** The script linked entries to
  `/games/<slug>/`, and Zola generates that page only from `content/games/<slug>.md`. A demo
  present in `metadata.json` but absent from the content tree linked to a 404. Discovery could
  never surface a demo the site did not already know about.
- **It cost no workflow.** Publishing a WASM demo already requires adding a content page;
  `content/games/turboprop-demo.md` exists for exactly that reason. Removing the fetch removed
  the pretense that the content page is optional, not the step itself.
- **`version` was the only field `metadata.json` rendered that the content file lacks.** `slug`,
  `title` and `description` duplicate front matter; `loader_url` is derivable; `published` was
  unused.

It also makes the gallery crawlable, brings demo links under `zola check`, and makes staging's
`/demos/` 403 irrelevant, since nothing fetches `metadata.json` any more. `metadata.json` is
still generated on the server; Phase 6b decides its fate.

#### 6b: Move WASM artifacts out of the document root (deferred)

Not a build change — the artifacts never enter `public/` and are never rsynced by
`deploy-www.sh`. They exist only on the server. Three distinct directories are easy to conflate:

| Directory               | What it is           | Where                   |
| ----------------------- | -------------------- | ----------------------- |
| `public/`               | Zola build output    | CI runner / dev machine |
| `~/deploy/staging/www/` | deploy staging area  | server                  |
| `~/smacdo.com/`         | Apache document root | server                  |

`~/turboprop-demos/` is symlinked as `demos` inside the third. So two deploy pipelines write
into one served directory, and a cluster of guard rails exists purely to keep them apart: the
anchored `--exclude '/demos'` in `deploy-www.sh`, `Options +FollowSymLinks` in `static/.htaccess`,
and the standing rule that `--delete` must not be added to the staging rsync.

Giving the artifacts their own origin removes the collision by construction rather than guarding
against it.

- [ ] Dreamhost subdomain `demos.smacdo.com` with its own document root, plus Cloudflare DNS
- [ ] CORS headers on that host so the cross-origin module import and content fetches succeed
- [ ] turboprop: `window.__turboprop_content_base` becomes an absolute URL
- [ ] `templates/games/page.html`: import the loader from the demos host
- [ ] `deploy-www.sh`: drop `--exclude`, and `--delete` becomes safe to add
- [ ] Update the URL contract in "WASM Games: Separate Repository" above

**Deferred deliberately.** After the September 2026 deploy fixes the current arrangement works on
both hosts. This removes a category of future bug, not a present one, and there is exactly one
WASM demo to justify it. Cross-origin module loading is the part most likely to consume
unplanned time.

Do it when any of these becomes true:

- A second or third WASM demo exists — the coupling cost scales with them, this work does not
- Staging needs to mirror prod's demos, which today means cloning the whole publish pipeline
- The `/games/` to `/demos/` rename in TODO.md is wanted; 6b is what unblocks it

#### Not in scope

- **Moving WASM artifacts into this repository.** Different toolchain and cadence, and binaries
  would bloat a Zola repo. The separation is right; the placement and the runtime discovery are
  the problems.
- **Collapsing the `page.extra.loader` branch in `templates/games/page.html`.** Six lines
  expressing a genuine difference in where an entrypoint comes from.

### Follow-up / Future

- [ ] **Scroll parallax clouds** — experiment with clouds shifting on page scroll (keep ambient drift as fallback)
- [ ] Games gallery card design (thumbnail, hover effect, download links)
- [ ] First real Writing article
- [ ] Rust port of BlockBreaker (separate repo, replaces TS demo) — [demo docs](docs/blockbreaker/README.md#planned-direction)
- [ ] Trees, castle/buildings added to foreground silhouette over time
- [ ] Tools page (scope TBD)

---

## CI/CD Changes (deploy_template.yml)

Replace the Node-only build with Zola + esbuild:

```yaml
steps:
    - name: Checkout repo
      uses: actions/checkout@v4

    - name: Install Zola
      run: |
          ZOLA_VERSION="0.22.1"
          wget -qO- https://github.com/getzola/zola/releases/download/v${ZOLA_VERSION}/zola-v${ZOLA_VERSION}-x86_64-unknown-linux-gnu.tar.gz \
            | tar xz -C /usr/local/bin/

    - name: Setup Node
      uses: actions/setup-node@v4
      with:
          node-version: "22"
          cache: "npm"

    - name: Build project
      run: npm run build

    - name: Check internal links
      run: zola check

    - name: Upload build artifact
      uses: actions/upload-artifact@v4
      with:
          name: deployment-files
          path: ./public
```

In the deploy job: change rsync source from `./dist/` to `./public/`, and change `--verbose` to `--itemize-changes`.

---

## WASM Embedding Contract

The example below is the original proposal, retained for context, and is not the deployed URL/API
contract. See [the implemented contract](docs/games-and-graphics.md#wasm-games) for current paths
and loader behavior.

The Rust game repo's CI publishes to the server at:

```
/games/[slug]/loader.js     exports init(canvas: HTMLCanvasElement): Promise<void>
/games/[slug]/game.wasm
/games/[slug]/assets/       (optional)
```

The Zola game page template embeds the game:

```html
<canvas id="game-canvas"></canvas>
<script type="module">
    import { init } from "/games/{{ page.slug }}/loader.js";
    const canvas = document.getElementById("game-canvas");
    await init(canvas);
</script>
```

---

## Future / Deferred Items

- Rust port of BlockBreaker (separate repo, replaces TS demo) — also listed under Follow-up above;
  [demo docs](docs/blockbreaker/README.md#planned-direction)
- Interactive parallax header (mouse movement, shooting stars, day/night toggle)
- Game download links (desktop Windows/Mac builds)
- Game storefront links (itch.io, Steam)
- Writing: first articles (dotfiles guide, DevPod tutorial, graphical demo write-ups)
- Tools page (undefined scope — build when ready)
