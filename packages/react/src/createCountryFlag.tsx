import type { SVGProps } from 'react'
import { escapeXml } from './escapeXml.js'

export type FlagComponent = ReturnType<typeof createCountryFlag>

export interface FlagComponentProps extends SVGProps<SVGSVGElement> {
  size?: string | number
  title?: string
}

export function createCountryFlag(code: string, svgContent: string) {
  function Component({
    'aria-hidden': ariaHidden,
    size = '1em',
    title,
    width,
    height,
    ref,
    ...props
  }: FlagComponentProps) {
    const resolvedWidth = width ?? size
    const resolvedHeight = height ?? size

    if (title) {
      return (
        <svg
          ref={ref}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 40 40"
          role="img"
          aria-hidden={ariaHidden}
          width={resolvedWidth}
          height={resolvedHeight}
          {...props}
          dangerouslySetInnerHTML={{ __html: `<title>${escapeXml(title)}</title>${svgContent}` }}
        />
      )
    }

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 40 40"
        aria-hidden={ariaHidden ?? 'true'}
        width={resolvedWidth}
        height={resolvedHeight}
        {...props}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    )
  }

  Component.displayName = code
  ;(Component as FlagComponent & { svgContent: string }).svgContent = svgContent

  return Component
}
