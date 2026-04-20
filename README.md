# smacdo.com

Source for [smacdo.com](https://smacdo.com/) — a personal site with a games/demos gallery,
long-form writing, and an about page.

Built with [Zola](https://www.getzola.org/), a static site generator written in Rust.
TypeScript demos are compiled with [esbuild](https://esbuild.github.io/).

## Prerequisites

- [Zola](https://www.getzola.org/documentation/getting-started/installation/) 0.19.2
- [Node.js](https://nodejs.org/) 22+ (for esbuild, used to compile TypeScript demos)

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

Start a local dev server with live reload at `http://127.0.0.1:1111`:

```bash
make serve
```

## Build

Produces a static site in `public/`:

```bash
make build
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
