import type { ComponentType, SVGProps } from 'react'
import type { CountryFlagProps } from './types.js'
import { escapeXml } from './escapeXml.js'

declare const process: { env: { NODE_ENV?: string } } | undefined

type AnyFlagComponent = ComponentType<SVGProps<SVGSVGElement>> & {
  svgContent: string
}

type FlagRegistry = Record<string, AnyFlagComponent>

export function createDynamicFlag(
  registry: Record<string, unknown>,
  suffix: 'Rounded' | 'Circle',
  displayName: string,
) {
  const typedRegistry = registry as FlagRegistry

  function Component({ code, size = '1em', title, width, height, ref, ...props }: CountryFlagProps) {
    const Flag = typedRegistry[`${code.toUpperCase().replace(/-/g, '')}${suffix}`]

    if (!Flag) {
      if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn(`[@appica/country-flags-react] ${displayName}: unknown country code "${code}"`)
      }
      return null
    }

    const resolvedWidth = width ?? size
    const resolvedHeight = height ?? size

    if (title) {
      return (
        <svg
          ref={ref}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 40 40"
          role="img"
          width={resolvedWidth}
          height={resolvedHeight}
          {...props}
          dangerouslySetInnerHTML={{
            __html: `<title>${escapeXml(title)}</title>${Flag.svgContent}`,
          }}
        />
      )
    }

    return <Flag ref={ref} width={resolvedWidth} height={resolvedHeight} {...props} />
  }

  Component.displayName = displayName
  return Component
}
