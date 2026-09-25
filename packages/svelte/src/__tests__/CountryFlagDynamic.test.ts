import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/svelte'
import type { Component } from 'svelte'
import CountryFlagRounded from '../CountryFlagRounded.svelte'
import CountryFlagCircle from '../CountryFlagCircle.svelte'
import { GBCircle, GBRounded, USCircle, USRounded } from '../index.js'
import type { CountryFlagProps, FlagComponentProps } from '../types.js'
import RefProbe from './RefProbe.svelte'

type StaticFlag = Component<FlagComponentProps, {}, 'ref'>

const cases: { name: string; Comp: Component<CountryFlagProps, {}, 'ref'>; US: StaticFlag; GB: StaticFlag }[] = [
  { name: 'CountryFlagRounded', Comp: CountryFlagRounded, US: USRounded, GB: GBRounded },
  { name: 'CountryFlagCircle', Comp: CountryFlagCircle, US: USCircle, GB: GBCircle },
]

function markupOf(Flag: StaticFlag): string {
  return render(Flag).container.querySelector('svg')!.innerHTML
}

describe.each(cases)('$name', ({ name, Comp, US, GB }) => {
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
    expect(warn).toHaveBeenCalledExactlyOnceWith(`[@appica/country-flags-svelte] ${name}: unknown country code "zz"`)
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
    const onref = vi.fn()
    const { container } = render(RefProbe, { component: Comp, code: 'us', onref })
    const svg = container.querySelector('svg')
    expect(svg).toBeInstanceOf(SVGSVGElement)
    expect(onref).toHaveBeenLastCalledWith(svg)
  })

  it('forwards ref on the title path too', () => {
    const onref = vi.fn()
    const { container } = render(RefProbe, { component: Comp, code: 'us', title: 'United States', onref })
    const svg = container.querySelector('svg')
    expect(svg).toBeInstanceOf(SVGSVGElement)
    expect(onref).toHaveBeenLastCalledWith(svg)
  })

  it('forwards arbitrary svg props', () => {
    const { container } = render(Comp, { code: 'us', 'data-testid': 'flag', class: 'my-flag' })
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('data-testid')).toBe('flag')
    expect(svg.getAttribute('class')).toBe('my-flag')
  })

  it('forwards event handlers', () => {
    const onclick = vi.fn()
    const { container } = render(Comp, { code: 'us', onclick })
    container.querySelector('svg')!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(onclick).toHaveBeenCalledOnce()
  })

  it('renders the same svg as the static component', () => {
    const props = { size: 24, title: 'United States', class: 'flag', 'aria-hidden': false }
    const dynamic = render(Comp, { code: 'us', ...props }).container.querySelector('svg')!
    const fromStatic = render(US, props).container.querySelector('svg')!
    expect(dynamic.outerHTML).toBe(fromStatic.outerHTML)
  })

  it('switches to the new flag when code changes', async () => {
    const { container, rerender } = render(Comp, { code: 'us' })
    expect(container.querySelector('svg')!.innerHTML).toBe(markupOf(US))
    await rerender({ code: 'gb' })
    expect(container.querySelectorAll('svg')).toHaveLength(1)
    expect(container.querySelector('svg')!.innerHTML).toBe(markupOf(GB))
  })

  it('updates forwarded props reactively', async () => {
    const { container, rerender } = render(Comp, { code: 'us', size: 24 })
    await rerender({ size: 40, title: 'United States' })
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe('40')
    expect(svg.getAttribute('role')).toBe('img')
    expect(svg.querySelector('title')!.textContent).toBe('United States')
  })

  it('points the bound ref at the new svg when code changes', async () => {
    const onref = vi.fn()
    const { container, rerender } = render(RefProbe, { component: Comp, code: 'us', onref })
    const first = container.querySelector('svg')
    await rerender({ code: 'gb' })
    const second = container.querySelector('svg')
    expect(second).not.toBe(first)
    expect(onref).toHaveBeenLastCalledWith(second)
  })

  it('clears the bound ref, warns, and recovers when code turns unknown and back', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const onref = vi.fn()
    const { container, rerender } = render(RefProbe, { component: Comp, code: 'us', onref })

    await rerender({ code: 'zz' })
    expect(container.querySelector('svg')).toBeNull()
    expect(onref).toHaveBeenLastCalledWith(null)
    expect(warn).toHaveBeenCalledExactlyOnceWith(`[@appica/country-flags-svelte] ${name}: unknown country code "zz"`)

    await rerender({ code: 'fr' })
    expect(onref).toHaveBeenLastCalledWith(container.querySelector('svg'))
    expect(warn).toHaveBeenCalledOnce()
    warn.mockRestore()
  })
})
