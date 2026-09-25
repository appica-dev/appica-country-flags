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

pnpm codegen        # generate components from SVG assets before tests/typechecks
pnpm typecheck      # type-check all packages
pnpm test           # run all test suites
pnpm build          # generate components, then build all packages
pnpm clean:generated
pnpm clean:dist
pnpm format         # format the codebase with Prettier
```

Generated flag components are not committed. After a fresh clone, run `pnpm codegen` before `pnpm test` or `pnpm typecheck`. For one package, use the corresponding filter, for example `pnpm --filter @appica/country-flags-react codegen` or `pnpm --filter @appica/country-flags-svelte codegen`.

### How codegen works

Flag components are generated, not hand-written: [`assets/`](./assets) holds the SVG sources in one directory per shape (`circle/`, `rounded/`), and the shared pipeline in [`scripts/codegen/`](./scripts/codegen) extracts each flag's code and inner SVG markup before calling the framework package's render hooks to write one component file per flag into its `src/flags/<shape>/` directory. Generated files are git-ignored build output (`packages/*/src/flags/` in `.gitignore`) — edit the SVG sources or the codegen scripts, never the generated files. Each shape also gets a generated barrel, `src/flags/<shape>/index.ts`, which the dynamic components (`CountryFlagRounded`, `CountryFlagCircle`) and the package's `./flags/<shape>` subpath exports rely on.

#### Adding a new framework package

1. **Scaffold `packages/<framework>/`** with its package manifest and source files. No further wiring is needed: [`pnpm-workspace.yaml`](./pnpm-workspace.yaml) already includes `packages/*`, so the root `pnpm codegen`, `pnpm build`, `pnpm test`, and `pnpm typecheck` (`pnpm -r <script>`) pick the package up automatically, and `.gitignore` already covers its generated output.
2. **Write a thin `scripts/build.ts`** — the pipeline itself lives in the shared core, so the script only calls `generateFlags(target)` from `../../../scripts/codegen/index.js` (i.e. `scripts/codegen/` at the repo root) and writes into `<packageDir>/src/flags/<shape>/`. The target describes only the framework-specific pieces:
   - `packageDir` — absolute path of the package directory (`assetsDir` defaults to the repo's [`assets/`](./assets)),
   - `extension` — component file extension, e.g. `".tsx"` or `".svelte"`,
   - `renderFlagFile(record)` — full content of one flag component file; `record` provides `shape`, `code`, `componentName`, and `innerSvg` (the sanitized SVG body),
   - `renderShapeBarrel(records)` — content of each shape's `index.ts`.
3. **Register any new shape first** — shapes are discovered from the `assets/` subdirectories and their component-name suffixes live in `scripts/codegen/extractCode.ts` (`SHAPE_SUFFIXES`); the pipeline fails loudly on an unregistered shape directory.
4. **Wire codegen and explicit cleanup into package scripts**, mirroring react: `"codegen": "tsx scripts/build.ts"`, `"clean:generated": "rm -rf src/flags"`, and `"clean:dist": "rm -rf dist"`. Run codegen as the first step of `build`; do not add `pretest` or `pretypecheck` hooks.
5. **Expose generated components through the package root and shape subpaths** (`"./flags/rounded"`, `"./flags/circle"`), mirroring react's `package.json` `exports`.

[`packages/react/scripts/build.ts`](./packages/react/scripts/build.ts) is the reference implementation.
