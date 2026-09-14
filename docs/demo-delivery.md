# Demo delivery

How demos reach the browser, why the two pipelines are split the way they are, and the one
structural change still outstanding.

Extracted from PLAN.md Phase 6 on 2026-09-13, with its reasoning intact. Read
[games and graphics](games-and-graphics.md) first for the WASM contract and hosting rules; this
file is the decision record behind them.

## Two pipelines

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
[docs/brainfreeze/MIGRATION.md finding F1](brainfreeze/MIGRATION.md).

## Delete runtime gallery discovery ✅

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
still generated on the server; The move below decides its fate.

## Move WASM artifacts out of the document root (deferred)

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
- [ ] Update the URL contract in [games and graphics](games-and-graphics.md#wasm-games)
      and in [PLAN.md](../PLAN.md#wasm-games-separate-repository)

**Deferred deliberately.** After the September 2026 deploy fixes the current arrangement works on
both hosts. This removes a category of future bug, not a present one, and there is exactly one
WASM demo to justify it. Cross-origin module loading is the part most likely to consume
unplanned time.

Do it when any of these becomes true:

- A second or third WASM demo exists — the coupling cost scales with them, this work does not
- Staging needs to mirror prod's demos, which today means cloning the whole publish pipeline
- The `/games/` to `/demos/` rename in TODO.md is wanted; this move is what unblocks it

## Not in scope

- **Moving WASM artifacts into this repository.** Different toolchain and cadence, and binaries
  would bloat a Zola repo. The separation is right; the placement and the runtime discovery are
  the problems.
- **Collapsing the `page.extra.loader` branch in `templates/games/page.html`.** Six lines
  expressing a genuine difference in where an entrypoint comes from.

## Related

- [Games and graphics](games-and-graphics.md) — the implemented WASM contract and hosting rules.
- [TODO.md](../TODO.md) — the `/games/` → `/demos/` rename this unblocks.
- [docs/brainfreeze/MIGRATION.md](brainfreeze/MIGRATION.md) — finding F1, the deploy investigation.
