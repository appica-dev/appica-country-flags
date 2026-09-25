import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/svelte'
import { GBSCTCircle, USRounded } from '../index.js'
import RefProbe from './RefProbe.svelte'

// The generated components are thin wrappers around FlagSvg: these check that every prop makes it
// through the wrapper, on real flags from both shapes.
describe.each([
  { name: 'USRounded', Flag: USRounded },
  { name: 'GBSCTCircle', Flag: GBSCTCircle },
])('generated $name', ({ Flag }) => {
  it('renders a decorative 1em flag by default', () => {
    const svg = render(Flag).container.querySelector('svg')!
    expect(svg.getAttribute('viewBox')).toBe('0 0 40 40')
    expect(svg.getAttribute('width')).toBe('1em')
    expect(svg.getAttribute('height')).toBe('1em')
    expect(svg.getAttribute('aria-hidden')).toBe('true')
    expect(svg.hasAttribute('role')).toBe(false)
    expect(svg.querySelector('path')).not.toBeNull()
  })

  it('applies size, and explicit width/height over it', () => {
    const svg = render(Flag, { size: '2rem', width: 48 }).container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe('48')
    expect(svg.getAttribute('height')).toBe('2rem')
  })

  it('renders an accessible title', () => {
    const svg = render(Flag, { title: 'Flag' }).container.querySelector('svg')!
    expect(svg.getAttribute('role')).toBe('img')
    expect(svg.hasAttribute('aria-hidden')).toBe(false)
    expect(svg.firstElementChild?.tagName.toLowerCase()).toBe('title')
    expect(svg.firstElementChild?.textContent).toBe('Flag')
  })

  it('forwards class, style, aria and data attributes, and events', () => {
    const onclick = vi.fn()
    const svg = render(Flag, {
      class: 'size-6',
      style: 'border-radius: 4px',
      'aria-hidden': false,
      'aria-label': 'Flag',
      'data-code': 'x',
      onclick,
    }).container.querySelector('svg')!
    expect(svg.getAttribute('class')).toBe('size-6')
    expect(svg.style.borderRadius).toBe('4px')
    expect(svg.getAttribute('aria-hidden')).toBe('false')
    expect(svg.getAttribute('aria-label')).toBe('Flag')
    expect(svg.getAttribute('data-code')).toBe('x')
    svg.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(onclick).toHaveBeenCalledOnce()
  })

  it('binds ref to the svg', () => {
    const onref = vi.fn()
    const { container } = render(RefProbe, { component: Flag, onref })
    expect(onref).toHaveBeenLastCalledWith(container.querySelector('svg'))
  })

  it('updates props reactively', async () => {
    const { container, rerender } = render(Flag, { size: 16 })
    await rerender({ size: 64, class: 'flag' })
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe('64')
    expect(svg.getAttribute('class')).toBe('flag')
  })
})
