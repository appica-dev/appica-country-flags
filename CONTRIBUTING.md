# Contributing

Appica Country Flags is developed in-house, and we're not accepting feature pull requests at this time. That said, your input genuinely helps the project:

- **Bug reports** are very welcome — please [open an issue](https://github.com/appica-dev/appica-country-flags/issues) — a small code example that shows the problem helps us fix it much faster. Flag accuracy corrections are especially appreciated.
- **Small fixes** (typos, docs, obvious one-line bugs) are fine as PRs.
- For anything larger, **open an issue first** so we can discuss it before you invest time.

## Working on a fix or reproducing an issue locally

### Prerequisites

- Node.js >= 20
- [pnpm](https://pnpm.io) >= 9 (`npm install -g pnpm`)

### Setup and common commands

```sh
pnpm install

pnpm build          # build all packages (generates components from SVG assets, then bundles)
pnpm test           # run all test suites
pnpm typecheck      # type-check all packages
pnpm format         # format the codebase with Prettier
```

Package-specific commands can be run with a filter, e.g. `pnpm --filter @appica/country-flags-react codegen` to re-generate components from the SVG sources without bundling.

### How it works

SVG flag sources live in `assets/`, one file per country and shape variant. Each framework package under `packages/` generates its components from them at build time and is published to npm independently. Generated component files (e.g. `packages/react/src/flags/`) are build output — edit the SVG sources or the codegen scripts, not the generated files.
