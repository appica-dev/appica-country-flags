import type { SVGAttributes } from 'svelte/elements'

type SvgProps = Omit<SVGAttributes<SVGSVGElement>, 'width' | 'height'>

export interface FlagComponentProps extends SvgProps {
  size?: string | number
  title?: string
  width?: string | number
  height?: string | number
  ref?: SVGSVGElement | null
}

export interface CountryFlagProps extends FlagComponentProps {
  code: string
}
