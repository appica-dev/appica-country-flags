import { readdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import * as RootExports from '../index.js'
import * as RoundedExports from '../flags/rounded/index.js'
import * as CircleExports from '../flags/circle/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..', '..', '..')
const ASSETS_DIR = join(REPO_ROOT, 'assets')

const SHAPES = {
  rounded: { suffix: 'Rounded', barrel: RoundedExports as Record<string, unknown> },
  circle: { suffix: 'Circle', barrel: CircleExports as Record<string, unknown> },
}

type Shape = keyof typeof SHAPES

const SHAPE_NAMES = Object.keys(SHAPES) as Shape[]

const flagModules = import.meta.glob('../flags/*/*.tsx', { eager: true }) as Record<string, { default: unknown }>

const flags = Object.entries(flagModules).map(([path, module]) => {
  const match = path.match(/^\.\.\/flags\/([^/]+)\/([^/]+)\.tsx$/)
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

  it('gives every flag its inner SVG markup without the outer <svg> element', () => {
    for (const flag of flags) {
      const { svgContent } = flag.component as { svgContent?: string }
      expect(svgContent, flag.path).toBeTruthy()
      expect(svgContent, flag.path).not.toMatch(/<svg[\s>]/i)
    }
  })
})
