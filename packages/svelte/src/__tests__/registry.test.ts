import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import type { Component } from 'svelte'
import { extractCode } from '../../../../scripts/codegen/extractCode.js'
import * as RootExports from '../index.js'
import * as RoundedExports from '../flags/rounded/index.js'
import * as CircleExports from '../flags/circle/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PACKAGE_DIR = join(__dirname, '..', '..')
const ASSETS_DIR = join(PACKAGE_DIR, '..', '..', 'assets')

const SHAPES = {
  rounded: { suffix: 'Rounded', barrel: RoundedExports as Record<string, unknown> },
  circle: { suffix: 'Circle', barrel: CircleExports as Record<string, unknown> },
}

type Shape = keyof typeof SHAPES

const SHAPE_NAMES = Object.keys(SHAPES) as Shape[]

const flagModules = import.meta.glob('../flags/*/*.svelte', { eager: true }) as Record<string, { default: Component }>

const flags = Object.entries(flagModules).map(([path, module]) => {
  const match = path.match(/^\.\.\/flags\/([^/]+)\/([^/]+)\.svelte$/)
  if (!match || !Object.hasOwn(SHAPES, match[1])) {
    throw new Error(`Unexpected generated module "${path}"`)
  }
  const shape = match[1] as Shape
  const code = match[2]
  return {
    path,
    shape,
    code,
    // The documented naming rule: uppercased code without hyphens, plus the shape suffix.
    exportName: `${code.toUpperCase().replace(/-/g, '')}${SHAPES[shape].suffix}`,
    component: module.default,
  }
})

function flagsOf(shape: Shape) {
  return flags.filter((flag) => flag.shape === shape)
}

async function listSvgs(dir: string): Promise<string[]> {
  return (await readdir(dir)).filter((file) => file.endsWith('.svg')).sort()
}

/** Maps a published dist/ file to the src/ file svelte-package emits it from. */
function sourceOf(distFile: string): string {
  const file = distFile.replace(/^\.\/dist\//, '')
  if (file.endsWith('.svelte.d.ts')) return file.slice(0, -'.d.ts'.length)
  if (file.endsWith('.svelte')) return file
  if (file.endsWith('.d.ts')) return `${file.slice(0, -'.d.ts'.length)}.ts`
  if (file.endsWith('.js')) return `${file.slice(0, -'.js'.length)}.ts`
  throw new Error(`Unexpected export target "${distFile}"`)
}

/** Serializes markup the way `{@html}` parses it inside an <svg>, without Svelte's comment anchors. */
function svgMarkup(markup: string): string {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.innerHTML = markup
  return svg.innerHTML
}

describe('registry: structural integrity', () => {
  it('generates one module per source SVG in each shape', async () => {
    for (const shape of SHAPE_NAMES) {
      const svgs = await listSvgs(join(ASSETS_DIR, shape))
      expect(svgs.length, `No source SVGs in assets/${shape}`).toBeGreaterThan(0)
      expect(flagsOf(shape), `Generated ${shape} modules vs assets/${shape}`).toHaveLength(svgs.length)
    }
  })

  it('ships every flag in both shapes', () => {
    const codes = (shape: Shape) => flagsOf(shape).map((flag) => flag.code)
    expect(codes('rounded').sort()).toEqual(codes('circle').sort())
  })

  it('exports every flag from its shape barrel under its documented name', () => {
    for (const shape of SHAPE_NAMES) {
      const { barrel } = SHAPES[shape]
      for (const flag of flagsOf(shape)) {
        expect(barrel[flag.exportName], `Missing "${flag.exportName}" in the ${shape} barrel`).toBe(flag.component)
      }
      expect(new Set(Object.keys(barrel))).toEqual(new Set(flagsOf(shape).map((flag) => flag.exportName)))
    }
  })

  it('re-exports every flag and the dynamic components from the package root', () => {
    const rootExports = RootExports as Record<string, unknown>
    const expected = new Set<string>(['CountryFlagRounded', 'CountryFlagCircle'])

    for (const flag of flags) {
      expected.add(flag.exportName)
      expect(rootExports[flag.exportName], `Missing root export "${flag.exportName}"`).toBe(flag.component)
    }

    expect(rootExports.CountryFlagRounded).toBeTypeOf('function')
    expect(rootExports.CountryFlagCircle).toBeTypeOf('function')
    expect(new Set(Object.keys(rootExports))).toEqual(expected)
  })

  it('points every package.json export condition at a file svelte-package emits', async () => {
    const pkg = JSON.parse(await readFile(join(PACKAGE_DIR, 'package.json'), 'utf-8'))
    const targets: [string, string][] = [
      ['svelte', pkg.svelte],
      ['types', pkg.types],
    ]
    for (const [subpath, conditions] of Object.entries<Record<string, string>>(pkg.exports)) {
      for (const [condition, target] of Object.entries(conditions)) {
        targets.push([`"${subpath}" [${condition}]`, target])
      }
    }
    for (const [label, target] of targets) {
      expect(existsSync(join(PACKAGE_DIR, 'src', sourceOf(target))), `${label} → ${target}`).toBe(true)
    }
  })
})

describe('registry: rendering', () => {
  it('renders every flag with the markup of its source SVG', async () => {
    let rendered = 0
    for (const shape of SHAPE_NAMES) {
      for (const file of await listSvgs(join(ASSETS_DIR, shape))) {
        const code = extractCode(file)
        const flag = flagsOf(shape).find((candidate) => candidate.code === code)
        expect(flag, `No generated ${shape} flag for ${file}`).toBeDefined()

        const source = (await readFile(join(ASSETS_DIR, shape, file), 'utf-8')).trim()
        const inner = source.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')

        const { container, unmount } = render(flag!.component)
        const svg = container.querySelector('svg')!
        expect(svg.getAttribute('viewBox'), flag!.path).toBe('0 0 40 40')
        expect(svg.innerHTML.replace(/<!--[\s\S]*?-->/g, ''), flag!.path).toBe(svgMarkup(inner))
        unmount()
        rendered++
      }
    }
    expect(rendered).toBe(flags.length)
  })
})
