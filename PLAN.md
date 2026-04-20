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
- Source lives in `src/demos/[name]/demo.ts`
- esbuild outputs to `public/js/demos/[name].js` after `zola build` runs
- No React, no Vite, no bundler config files
- The gamebox physics/math library (`src/lib/gamebox/`) is shared across demos

### Build Orchestration: Makefile
- `make build` — runs Zola then esbuild
- `make serve` — runs `zola serve` for local development
- `make clean` — removes `public/` and `node_modules/`
- Minimal `package.json` with esbuild as the only dev dependency

### WASM Games: Separate Repository
- WASM builds live in a separate Rust repository
- That repo's CI builds and rsyncs artifacts directly to the web server
- URL contract: `/games/[slug]/loader.js`, `/games/[slug]/game.wasm`, `/games/[slug]/assets/`
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
├── Makefile                 Build orchestration
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
│       └── blockbreaker.md  BlockBreaker game page
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
│   ├── lib/
│   │   └── gamebox/         Physics/math library (React stripped out)
│   │       ├── bounds.ts    AABB, Circle, collision resolution
│   │       ├── math.ts      lerp, vector ops
│   │       ├── direction.ts Direction enum
│   │       ├── viewport.ts  Canvas scaling logic
│   │       ├── resources.ts ImageLoader
│   │       ├── sprites.ts   SpriteDefinition
│   │       └── debounce.ts
│   └── demos/
│       ├── canvas-demo/
│       │   └── demo.ts      Minimal canvas animation template
│       └── blockbreaker/
│           └── demo.ts      BlockBreaker (TS, until Rust port replaces it)
│
└── .github/
    └── workflows/
        ├── deploy_prod.yml      (unchanged)
        ├── deploy_staging.yml   (unchanged)
        └── deploy_template.yml  (updated — see CI Changes below)
```

---

## Implementation Phases

### Phase 1: Zola Foundation
- [ ] Initialize Zola project (`config.toml`)
- [ ] Create directory structure (`content/`, `templates/`, `static/`)
- [ ] Remove React codebase (keep `src/lib/gamebox/` TypeScript source files)
- [ ] Create `base.html` template with header, nav, footer
- [ ] Create home page template and stub content
- [ ] Implement dark/light theme toggle in vanilla JS
- [ ] Create `Makefile` with `build`, `serve`, `clean` targets
- [ ] Create minimal `package.json` with esbuild as only dependency
- [ ] Update `deploy_template.yml`: install pinned Zola binary, add `zola check`, fix output path

### Phase 2: Content Sections
- [ ] About page template + stub bio and CV content
- [ ] Writing section: list template, article template
- [ ] Enable RSS feed in Zola config
- [ ] Games section: gallery list template, game page template with canvas container
- [ ] Tools placeholder page
- [ ] Wire up all nav links

### Phase 3: JS Demo Infrastructure
- [ ] Strip React wrappers from gamebox library (pure TypeScript, no framework deps)
- [ ] Add esbuild compilation step to Makefile
- [ ] Create `canvas-demo` as minimal working example (canvas init, resize, animation loop)
- [ ] Migrate BlockBreaker to standalone TS demo (no React, no custom router)

### Phase 4: WASM Integration
- [ ] Finalize WASM embedding contract (URL structure, JS API)
- [ ] Update game page template to load and initialize WASM via loader.js
- [ ] Document the contract for the Rust game repository

### Phase 5: Visual Polish
- [ ] Catppuccin Mocha (dark) and Latte (light) CSS custom properties
- [ ] Typography: Oxanium (headings), Inter (body), JetBrains Mono (code)
- [ ] Parallax canvas header (clouds, stars, night/day per theme)
- [ ] Games gallery card design (thumbnail, hover-to-play, download links)
- [ ] Full article typography and reading comfort

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
      node-version: '22'
      cache: 'npm'

  - name: Build project
    run: make build

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
  import { init } from '/games/{{ page.slug }}/loader.js';
  const canvas = document.getElementById('game-canvas');
  await init(canvas);
</script>
```

---

## Future / Deferred Items

- Rust port of BlockBreaker (separate repo, replaces TS demo)
- Interactive parallax header (mouse movement, shooting stars, day/night toggle)
- Game download links (desktop Windows/Mac builds)
- Game storefront links (itch.io, Steam)
- Writing: first articles (dotfiles guide, DevPod tutorial, graphical demo write-ups)
- Tools page (undefined scope — build when ready)
