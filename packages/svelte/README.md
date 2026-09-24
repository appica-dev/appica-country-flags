[![Appica Country Flags for Svelte](https://raw.githubusercontent.com/appica-dev/appica-country-flags/main/.github/assets/appica-country-flags-root.jpg)](https://appica.dev/ui/country-flags)

[![npm](https://img.shields.io/npm/v/%40appica%2Fcountry-flags-svelte)](https://www.npmjs.com/package/@appica/country-flags-svelte)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-blue)](https://www.typescriptlang.org/)
[![Figma](https://img.shields.io/badge/Figma-design_file-F24E1E?logo=figma&logoColor=white)](https://www.figma.com/community/file/1657080448204231925)

A high-fidelity collection of 261 SVG country flags in rounded and circle shapes for Svelte.

## Installation

```bash
npm install @appica/country-flags-svelte
# or
yarn add @appica/country-flags-svelte
# or
pnpm add @appica/country-flags-svelte
# or
bun add @appica/country-flags-svelte
```

Requires Svelte 5 or later. ESM only. Components ship as `.svelte` source and are compiled by your app.

## Usage

There are two ways to use flags: **dynamic** (code-based) and **static** (individual imports).

### Dynamic

`CountryFlagRounded` and `CountryFlagCircle` accept a `code` prop and resolve the flag at runtime. Useful when rendering flags from data.

```svelte
<script>
  import { CountryFlagRounded, CountryFlagCircle } from '@appica/country-flags-svelte'
</script>

<CountryFlagRounded code="us" size={32} />
<CountryFlagCircle code="gb" size="2rem" />
```

Works with Tailwind CSS — use `size-*` to control dimensions:

```svelte
<CountryFlagRounded code="us" class="size-10" />
<CountryFlagCircle code="gb" class="size-6" />
```

### Static

Import individual flag components directly for optimal tree-shaking. Each flag is a standalone SVG component.

```svelte
<script>
  import { USRounded, GBRounded, FRRounded, USCircle, GBCircle } from '@appica/country-flags-svelte'
</script>

<USRounded size={24} />
<GBCircle size="1.5rem" />
```

Works with Tailwind CSS — use `size-*` to control dimensions:

```svelte
<USRounded class="size-8" />
<GBCircle class="size-6" />
```

## Shapes

| Shape             | Dynamic              | Static                      |
| ----------------- | -------------------- | --------------------------- |
| Rounded rectangle | `CountryFlagRounded` | `USRounded`, `GBRounded`, … |
| Circle            | `CountryFlagCircle`  | `USCircle`, `GBCircle`, …   |

## Props

| Prop    | Type               | Default | Description                                                                                                    |
| ------- | ------------------ | ------- | -------------------------------------------------------------------------------------------------------------- |
| `code`  | `string`           | —       | ISO country code — required for dynamic components only                                                        |
| `size`  | `string \| number` | `"1em"` | Width and height. Accepts a CSS value (`"2rem"`) or a pixel number (`32`)                                      |
| `title` | `string`           | —       | Accessible label rendered as an SVG `<title>` element. When omitted, `aria-hidden="true"` is set automatically |
| `class` | `string`           | —       | CSS class name                                                                                                 |
| `ref`   | `SVGSVGElement`    | —       | The underlying `<svg>` element. Bind it with `bind:ref`                                                        |

All standard SVG element attributes are also accepted and forwarded to the underlying `<svg>`.

```svelte
<script>
  import { USRounded } from '@appica/country-flags-svelte'

  let svg = $state(null)
</script>

<USRounded bind:ref={svg} class="size-8" title="United States" />
```

## Country codes

Flags follow [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) codes (e.g. `us`, `gb`, `fr`). 261 flags total.

### Subnational & special flags

In addition to sovereign nations, the following regional and special flags are included:

**United Kingdom**

| Code     | Flag           |
| -------- | -------------- |
| `gb-eng` | England        |
| `gb-sct` | Scotland       |
| `gb-wls` | Wales          |
| `gb-ork` | Orkney Islands |

**Spain**

| Code    | Flag             |
| ------- | ---------------- |
| `es-pv` | Basque Country   |
| `es-ce` | Ceuta            |
| `es-ml` | Melilla          |
| `ic`    | Canary Islands   |
| `ib`    | Balearic Islands |

**Portugal**

| Code    | Flag    |
| ------- | ------- |
| `pt-20` | Azores  |
| `pt-30` | Madeira |

**France**

| Code    | Flag    |
| ------- | ------- |
| `fr-2b` | Corsica |

**Italy**

| Code    | Flag     |
| ------- | -------- |
| `it-88` | Sardinia |

**Netherlands (Caribbean)**

| Code    | Flag           |
| ------- | -------------- |
| `bq-ba` | Bonaire        |
| `bq-sa` | Saba Island    |
| `bq-se` | Sint Eustatius |

**China**

| Code    | Flag  |
| ------- | ----- |
| `cn-xz` | Tibet |

**Ecuador**

| Code   | Flag              |
| ------ | ----------------- |
| `ec-w` | Galapagos Islands |

**Other**

| Code | Flag           |
| ---- | -------------- |
| `eu` | European Union |
| `un` | United Nations |
| `xa` | Abkhazia       |
| `xk` | Kosovo         |
| `xo` | South Ossetia  |

### Static import naming

Component names use the uppercased code without hyphens followed by the shape suffix:

```svelte
<script>
  // "gb-sct" → GBSCTRounded / GBSCTCircle
  // "es-pv"  → ESPVRounded  / ESPVCircle
  // "bq-ba"  → BQBARounded  / BQBACircle
  import { GBSCTRounded, ESPVCircle } from '@appica/country-flags-svelte'
</script>
```

## TypeScript

Full TypeScript support is built in. The `CountryFlagProps` type is exported for use in your own components:

```svelte
<script lang="ts">
  import { CountryFlagRounded, type CountryFlagProps } from '@appica/country-flags-svelte'

  let { ...props }: CountryFlagProps = $props()
</script>

<CountryFlagRounded {...props} />
```

## Figma design file

All 261 flags in both shapes are included in the free [Appica UI Figma file](https://www.figma.com/community/file/1657080448204231925), alongside the component library — use the same flags in your designs that you render in code.

## Stay updated

Follow [@Appica_dev](https://x.com/Appica_dev) on X for release announcements and updates.

## License

MIT © [Appica](https://appica.dev)

Free to use in personal and commercial projects.
