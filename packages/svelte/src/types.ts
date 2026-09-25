import type { SVGAttributes } from 'svelte/elements'

type SvgProps = Omit<SVGAttributes<SVGSVGElement>, 'width' | 'height'>

export interface FlagComponentProps extends SvgProps {
  /** Width and height. A CSS value (`"2rem"`) or a pixel number (`32`). Defaults to `"1em"`. */
  size?: string | number
  /** Accessible label rendered as an SVG `<title>`. Without it, the flag is `aria-hidden`. */
  title?: string
  /** Overrides the width set by `size`. */
  width?: string | number
  /** Overrides the height set by `size`. */
  height?: string | number
  /** The rendered `<svg>` element. Bind it with `bind:ref`. */
  ref?: SVGSVGElement | null
}

export interface CountryFlagProps extends FlagComponentProps {
  /** Country or region code, e.g. `"us"` or `"gb-sct"`. Case-insensitive. */
  code: string
}
