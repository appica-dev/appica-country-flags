import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/svelte'
import CountryFlagRounded from '../CountryFlagRounded.svelte'
import CountryFlagCircle from '../CountryFlagCircle.svelte'
import DynamicProbe from './DynamicProbe.svelte'
import type { CountryFlagProps } from '../types.js'
import type { Component } from 'svelte'

const cases: { name: string; Comp: Component<CountryFlagProps> }[] = [
  { name: 'CountryFlagRounded', Comp: CountryFlagRounded },
  { name: 'CountryFlagCircle', Comp: CountryFlagCircle },
]

describe.each(cases)('$name', ({ Comp }) => {
  it('resolves a lowercase code', () => {
    const { container } = render(Comp, { code: 'us' })
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('resolves an uppercase code', () => {
    const { container } = render(Comp, { code: 'US' })
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('resolves a mixed-case code', () => {
    const { container } = render(Comp, { code: 'Us' })
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('resolves a hyphenated subcode', () => {
    const { container } = render(Comp, { code: 'gb-sct' })
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('renders nothing for unknown codes and warns in development', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { container } = render(Comp, { code: 'zz' })
    expect(container.querySelector('svg')).toBeNull()
    expect(warn).toHaveBeenCalledOnce()
    warn.mockRestore()
  })

  it('applies size as both width and height', () => {
    const { container } = render(Comp, { code: 'us', size: 32 })
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe('32')
    expect(svg.getAttribute('height')).toBe('32')
  })

  it('explicit width/height override size', () => {
    const { container } = render(Comp, { code: 'us', size: 32, width: 48, height: 16 })
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe('48')
    expect(svg.getAttribute('height')).toBe('16')
  })

  it('passes string size through', () => {
    const { container } = render(Comp, { code: 'us', size: '2rem' })
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe('2rem')
    expect(svg.getAttribute('height')).toBe('2rem')
  })

  it('default size is "1em"', () => {
    const { container } = render(Comp, { code: 'us' })
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe('1em')
    expect(svg.getAttribute('height')).toBe('1em')
  })

  it('renders <title> as the first child when title prop is set', () => {
    const { container } = render(Comp, { code: 'us', title: 'United States' })
    const svg = container.querySelector('svg')!
    expect(svg.firstElementChild?.tagName.toLowerCase()).toBe('title')
    expect(svg.firstElementChild?.textContent).toBe('United States')
  })

  it('escapes XML metacharacters in title', () => {
    const { container } = render(Comp, { code: 'us', title: `A&B<C>"D"'E` })
    const titleEl = container.querySelector('title')!
    expect(titleEl.textContent).toBe(`A&B<C>"D"'E`)
  })

  it('sets role="img" when title is present', () => {
    const { container } = render(Comp, { code: 'us', title: 'United States' })
    expect(container.querySelector('svg')!.getAttribute('role')).toBe('img')
  })

  it('sets aria-hidden="true" when title is absent', () => {
    const { container } = render(Comp, { code: 'us' })
    expect(container.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true')
  })

  it('forwards ref', () => {
    let svg: SVGSVGElement | null = null
    render(DynamicProbe, {
      component: Comp,
      code: 'us',
      onref: (el: SVGSVGElement) => {
        svg = el
      },
    })
    expect(svg).not.toBeNull()
    expect((svg as unknown as SVGSVGElement).tagName.toLowerCase()).toBe('svg')
  })

  it('forwards ref on the title path too', () => {
    let svg: SVGSVGElement | null = null
    render(DynamicProbe, {
      component: Comp,
      code: 'us',
      title: 'United States',
      onref: (el: SVGSVGElement) => {
        svg = el
      },
    })
    expect(svg).not.toBeNull()
    expect((svg as unknown as SVGSVGElement).tagName.toLowerCase()).toBe('svg')
  })

  it('forwards arbitrary svg props', () => {
    const { container } = render(Comp, { code: 'us', 'data-testid': 'flag', class: 'my-flag' })
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('data-testid')).toBe('flag')
    expect(svg.getAttribute('class')).toBe('my-flag')
  })
})
