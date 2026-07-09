import type { SVGProps } from 'react'

export interface CountryFlagProps extends SVGProps<SVGSVGElement> {
  code: string
  size?: string | number
  title?: string
}
