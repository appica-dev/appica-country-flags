import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, it, expect } from 'vitest'
import { generateFlags } from '../index'
import type { CodegenTarget, FlagRecord } from '../index'

const FLAG_BODY = '<path fill="#f00" d="M0 0h40v40H0z"/>'

function svg(body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">${body}</svg>`
}

interface Fixture {
  root: string
  packageDir: string
  assetsDir: string
}

/** Creates tmp/<shape>/<file>.svg trees: svgs[shape][filename] = svg source string. */
async function makeFixture(svgs: Record<string, Record<string, string>>): Promise<Fixture> {
  const root = await mkdtemp(join(tmpdir(), 'appica-codegen-'))
  const packageDir = join(root, 'pkg')
  const assetsDir = join(root, 'assets')
  for (const [shape, files] of Object.entries(svgs)) {
    const dir = join(assetsDir, shape)
    await mkdir(dir, { recursive: true })
    for (const [file, source] of Object.entries(files)) {
      await writeFile(join(dir, file), source, 'utf-8')
    }
  }
  return { root, packageDir, assetsDir }
}

function baseTarget(fixture: Fixture): CodegenTarget {
  return {
    packageDir: fixture.packageDir,
    assetsDir: fixture.assetsDir,
    extension: '.tsx',
    renderFlagFile: (record) => `${record.componentName}\n`,
    renderShapeBarrel: (records) =>
      records
        .map((record) => `export { default as ${record.componentName} } from "./${record.code}.js";`)
        .sort()
        .join('\n') + '\n',
  }
}

describe('generateFlags', () => {
  it('writes one component per SVG plus a shape barrel, and wipes stale output', async () => {
    const fixture = await makeFixture({
      circle: { 'us.svg': svg(FLAG_BODY), 'gb-sct.svg': svg(FLAG_BODY) },
      rounded: { 'us.svg': svg(FLAG_BODY) },
    })
    const outRoot = join(fixture.packageDir, 'src', 'flags')
    try {
      await mkdir(outRoot, { recursive: true })
      await writeFile(join(outRoot, 'stale.tsx'), 'stale', 'utf-8')

      await generateFlags(baseTarget(fixture))

      await expect(readFile(join(outRoot, 'circle', 'us.tsx'), 'utf-8')).resolves.toBe('USCircle\n')
      await expect(readFile(join(outRoot, 'circle', 'gb-sct.tsx'), 'utf-8')).resolves.toBe('GBSCTCircle\n')
      await expect(readFile(join(outRoot, 'rounded', 'us.tsx'), 'utf-8')).resolves.toBe('USRounded\n')
      await expect(readFile(join(outRoot, 'circle', 'index.ts'), 'utf-8')).resolves.toBe(
        'export { default as GBSCTCircle } from "./gb-sct.js";\nexport { default as USCircle } from "./us.js";\n',
      )
      await expect(readFile(join(outRoot, 'rounded', 'index.ts'), 'utf-8')).resolves.toBe(
        'export { default as USRounded } from "./us.js";\n',
      )
      await expect(readFile(join(outRoot, 'stale.tsx'), 'utf-8')).rejects.toThrow()
    } finally {
      await rm(fixture.root, { recursive: true, force: true })
    }
  })

  it('passes full parsed records to the flag renderer', async () => {
    const fixture = await makeFixture({
      circle: { 'maldives-mv.svg': svg('<path d="M0 0h40v40H0z"/>') },
    })
    const seen: FlagRecord[] = []
    try {
      const target = baseTarget(fixture)
      target.renderFlagFile = (record) => {
        seen.push(record)
        return ''
      }
      await generateFlags(target)
      expect(seen).toHaveLength(1)
      expect(seen[0]).toEqual({
        shape: 'circle',
        code: 'mv',
        componentName: 'MVCircle',
        innerSvg: '<path d="M0 0h40v40H0z"/>',
      })
    } finally {
      await rm(fixture.root, { recursive: true, force: true })
    }
  })

  it('rejects a shape containing a malformed SVG, naming the shape and file', async () => {
    const fixture = await makeFixture({
      circle: { 'broken.svg': 'not an svg at all' },
    })
    try {
      await expect(generateFlags(baseTarget(fixture))).rejects.toThrow('Failed to process flags in "circle"')
      await expect(generateFlags(baseTarget(fixture))).rejects.toThrow(
        'circle/broken.svg: Source <svg> element is malformed.',
      )
    } finally {
      await rm(fixture.root, { recursive: true, force: true })
    }
  })

  it('rejects two files in one shape that map to the same code', async () => {
    const fixture = await makeFixture({
      circle: { 'us.svg': svg(FLAG_BODY), 'united-states-us.svg': svg(FLAG_BODY) },
    })
    try {
      await expect(generateFlags(baseTarget(fixture))).rejects.toThrow('duplicate code "us"')
    } finally {
      await rm(fixture.root, { recursive: true, force: true })
    }
  })

  it('rejects an unknown shape directory', async () => {
    const fixture = await makeFixture({
      square: { 'us.svg': svg(FLAG_BODY) },
    })
    try {
      await expect(generateFlags(baseTarget(fixture))).rejects.toThrow('Unknown shape directory "square"')
    } finally {
      await rm(fixture.root, { recursive: true, force: true })
    }
  })
})