# smacdo.com

Source for [smacdo.com](https://smacdo.com/) — a personal site with a games/demos gallery,
long-form writing, and an about page.

Built with [Zola](https://www.getzola.org/), a static site generator written in Rust.
TypeScript demos are compiled with [esbuild](https://esbuild.github.io/).

## Prerequisites

- [Zola](https://www.getzola.org/documentation/getting-started/installation/) 0.22.1
- [Node.js](https://nodejs.org/) 24+ (for esbuild, used to compile TypeScript demos)

On macOS:

```bash
brew install zola
brew install node
```

## Development

Install JS dependencies (esbuild only):

```bash
npm install
```

Start the dev server at `http://127.0.0.1:1111`:

```bash
npm run dev
```

This watches the TypeScript and JavaScript bundles and runs Zola together, so editing a demo,
a template, a stylesheet or a page reloads the browser automatically. Use `npm run serve` if
you want Zola on its own without the JavaScript watchers.

## Test

Tests use [Vitest](https://vitest.dev/) and live alongside code as `*.test.ts`.

```bash
npm run check        # Run all checks including tests.

npm test             # Only run tests.
npm run test:watch   # Re-run tests each time the project is changed.
```

## Build

Produces a static site in `public/`:

```bash
npm run build
```

## References

Collected links and resources are in [docs/references.md](docs/references.md).

## Deployment

All pushes to `master` are built and deployed to
[staging.smacdo.com](https://staging.smacdo.com) via GitHub Actions.

A production deploy to [smacdo.com](https://smacdo.com) is triggered by creating a tag
matching `releases-v*` on the master branch:

```bash
git tag releases-v1
git push origin releases-v1
```
