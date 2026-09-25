# Changelog

All notable changes to `@appica/country-flags-react`.

The library follows [semantic versioning](https://semver.org/spec/v2.0.0.html).

## 1.1.0 - 2026-09-25

Mayotte joins the collection, which now counts 262 flags in both shapes.

### Added

- **Mayotte** - Code `yt`, exported as `YTRounded` and `YTCircle`, and resolved by `code="yt"` on `CountryFlagRounded` and `CountryFlagCircle`.

### Improved

- **Dependencies** - All workspace dependencies updated to their latest versions, including the major bumps in TypeScript (6 → 7), Vitest (4 → 5), jsdom (29 → 30) and @testing-library/jest-dom (6 → 7). Type declarations are now emitted by the TypeScript compiler and describe the same public API.

## 1.0.0 - 2026-07-09

The first public release of `@appica/country-flags-react`.

### Added

- **261 flags in rounded and circle shapes** - Tree-shakeable components, imported by name from the package root (`import { USRounded, USCircle } from '@appica/country-flags-react'`).
- **`CountryFlagRounded` and `CountryFlagCircle`** - Resolve a flag from its `code` prop at runtime, for rendering flags from data.
- **`CountryFlagProps`** - The props type, exported for typing your own wrappers.
