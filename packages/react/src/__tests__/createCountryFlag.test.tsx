import { describe, it, expect } from 'vitest'
import { createRef } from 'react'
import { render } from '@testing-library/react'
import { createCountryFlag } from '../createCountryFlag.js'

const sampleSvg = '<path d="M0 0h40v40H0z"/>'
const Flag = createCountryFlag('xx', sampleSvg)

describe('createCountryFlag', () => {
  it('renders an svg with viewBox 0 0 40 40', () => {
    const { container } = render(<Flag />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg!.getAttribute('viewBox')).toBe('0 0 40 40')
  })

  it('inlines svgContent via dangerouslySetInnerHTML', () => {
    const { container } = render(<Flag />)
    const path = container.querySelector('svg > path')
    expect(path).not.toBeNull()
    expect(path!.getAttribute('d')).toBe('M0 0h40v40H0z')
  })

  it('defaults aria-hidden to "true"', () => {
    const { container } = render(<Flag />)
    expect(container.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true')
  })

  it('allows aria-hidden override via prop', () => {
    const { container } = render(<Flag aria-hidden={false} />)
    expect(container.querySelector('svg')!.getAttribute('aria-hidden')).toBe('false')
  })

  it('forwards ref to the svg element', () => {
    const ref = createRef<SVGSVGElement>()
    render(<Flag ref={ref} />)
    expect(ref.current).toBeInstanceOf(SVGElement)
    expect(ref.current!.tagName.toLowerCase()).toBe('svg')
  })

  it('exposes svgContent as a property on the component', () => {
    expect((Flag as unknown as { svgContent: string }).svgContent).toBe(sampleSvg)
  })

  it('sets displayName to the country code', () => {
    expect(Flag.displayName).toBe('xx')
  })

  it('forwards arbitrary svg props', () => {
    const { container } = render(<Flag data-testid="x" className="my-flag" />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('data-testid')).toBe('x')
    expect(svg.getAttribute('class')).toBe('my-flag')
  })

  it('defaults size to "1em" for both width and height', () => {
    const { container } = render(<Flag />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe('1em')
    expect(svg.getAttribute('height')).toBe('1em')
  })

  it('applies size as both width and height', () => {
    const { container } = render(<Flag size={24} />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe('24')
    expect(svg.getAttribute('height')).toBe('24')
  })

  it('passes a string size through', () => {
    const { container } = render(<Flag size="1.5rem" />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe('1.5rem')
    expect(svg.getAttribute('height')).toBe('1.5rem')
  })

  it('explicit width/height override size', () => {
    const { container } = render(<Flag size={24} width={48} height={16} />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe('48')
    expect(svg.getAttribute('height')).toBe('16')
  })

  it('renders <title> as the first child and sets role="img" when title is set', () => {
    const { container } = render(<Flag title="Example" />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('role')).toBe('img')
    expect(svg.firstElementChild?.tagName.toLowerCase()).toBe('title')
    expect(svg.firstElementChild?.textContent).toBe('Example')
  })

  it('does not force aria-hidden when a title is present', () => {
    const { container } = render(<Flag title="Example" />)
    expect(container.querySelector('svg')!.getAttribute('aria-hidden')).toBeNull()
  })

  it('escapes XML metacharacters in title', () => {
    const { container } = render(<Flag title={`A&B<C>"D"'E`} />)
    expect(container.querySelector('title')!.textContent).toBe(`A&B<C>"D"'E`)
  })
})
