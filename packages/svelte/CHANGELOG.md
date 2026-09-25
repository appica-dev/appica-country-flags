# Changelog

All notable changes to `@appica/country-flags-svelte`.

The library follows [semantic versioning](https://semver.org/spec/v2.0.0.html).

## 1.0.0 - 2026-09-25

The first public release of `@appica/country-flags-svelte`, with the flags and API of `@appica/country-flags-react` 1.1.0.

### Added

- **262 flags in rounded and circle shapes** - Tree-shakeable Svelte 5 components, imported by name from the package root (`import { USRounded, USCircle } from '@appica/country-flags-svelte'`).
- **`CountryFlagRounded` and `CountryFlagCircle`** - Resolve a flag from its `code` prop at runtime, for rendering flags from data.
- **`bind:ref`** - Binds the rendered `<svg>` element, on static and dynamic flags.
- **`CountryFlagProps`** - The props type, exported for typing your own wrappers.
