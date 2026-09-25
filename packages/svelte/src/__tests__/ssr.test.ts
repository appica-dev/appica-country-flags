// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { render } from 'svelte/server'
import { CountryFlagCircle, CountryFlagRounded, GBSCTCircle, USCircle, USRounded } from '../index.js'

// SvelteKit renders pages on the server first: in the node environment the components are
// compiled for SSR, as they are in an app.

function svgTag(body: string): string {
  const tag = body.match(/<svg\b[^>]*>/)?.[0]
  if (!tag) throw new Error(`No <svg> in:\n${body}`)
  return tag
}

function svgElement(body: string): string {
  return body.match(/<svg\b[\s\S]*<\/svg>/)?.[0] ?? ''
}

describe('server rendering', () => {
  it('renders a decorative static flag', () => {
    const { body } = render(USRounded, { props: { size: 24, class: 'flag' } })
    const tag = svgTag(body)
    expect(tag).toContain('viewBox="0 0 40 40"')
    expect(tag).toContain('width="24"')
    expect(tag).toContain('height="24"')
    expect(tag).toContain('aria-hidden="true"')
    expect(tag).toContain('class="flag"')
    expect(tag).not.toContain('role=')
    expect(body).toContain('<path')
  })

  it('renders an escaped title and role="img"', () => {
    const { body } = render(GBSCTCircle, { props: { title: `A&B<C>"D"'E` } })
    expect(svgTag(body)).toContain('role="img"')
    expect(svgTag(body)).not.toContain('aria-hidden')
    expect(body).toContain('<title>A&amp;B&lt;C>"D"\'E</title>')
  })

  it.each([
    { name: 'CountryFlagRounded', Comp: CountryFlagRounded, US: USRounded },
    { name: 'CountryFlagCircle', Comp: CountryFlagCircle, US: USCircle },
  ])('$name renders the same svg as the static flag', ({ Comp, US }) => {
    const { body } = render(Comp, { props: { code: 'US', size: '2rem' } })
    expect(svgTag(body)).toContain('width="2rem"')
    expect(svgElement(body)).toBe(svgElement(render(US, { props: { size: '2rem' } }).body))
  })

  it('renders nothing for an unknown code', () => {
    const { body } = render(CountryFlagRounded, { props: { code: 'zz' } })
    expect(body).not.toContain('<svg')
  })
})
