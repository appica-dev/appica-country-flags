import { readdir, readFile, writeFile, mkdir, stat, rm } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractCode, codeToComponentName, isFlagShape } from './extractCode.js'
import type { FlagShape } from './extractCode.js'

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const DEFAULT_ASSETS_DIR = join(REPO_ROOT, 'assets')

export interface FlagRecord {
  /** Shape variant directory the flag came from, e.g. "circle" or "rounded". */
  shape: FlagShape
  /** Flag code extracted from the asset filename, e.g. "us" or "gb-sct". */
  code: string
  /** PascalCase component name, e.g. "USCircle" or "GBSCTRounded". */
  componentName: string
  /** Inner SVG markup with the outer <svg> wrapper stripped. */
  innerSvg: string
}

export interface CodegenTarget {
  /** Absolute path to the framework package directory; output goes to <packageDir>/src/flags. */
  packageDir: string
  /** Source SVG directory containing one subdirectory per shape; defaults to the repository's <repo>/assets. */
  assetsDir?: string
  /** Output file extension for flag component files, e.g. ".tsx" or ".svelte". */
  extension: string
  /** Renders the full content of one flag component file from its record. */
  renderFlagFile(record: FlagRecord): string
  /** Renders a shape barrel ("index.ts") listing the shape's flag files. */
  renderShapeBarrel(records: FlagRecord[]): string
}

async function listShapes(assetsDir: string): Promise<FlagShape[]> {
  const entries = await readdir(assetsDir, { withFileTypes: true })
  const dirs = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
    .sort()

  const shapes: FlagShape[] = []
  for (const dir of dirs) {
    if (!isFlagShape(dir)) {
      throw new Error(
        `Unknown shape directory "${dir}" in ${assetsDir}; expected one of: circle, rounded. ` +
          `Add the shape to SHAPE_SUFFIXES in scripts/codegen/extractCode.ts before generating.`,
      )
    }
    shapes.push(dir)
  }
  return shapes
}

async function listSvgFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir)
  return entries.filter((file) => file.endsWith('.svg')).sort()
}

function extractInnerSvg(source: string): string {
  const match = source.trim().match(/^<svg[^>]*>([\s\S]*)<\/svg>$/)
  if (!match) {
    throw new Error('Source <svg> element is malformed.')
  }
  return match[1]
}

async function processShape(assetsDir: string, shape: FlagShape): Promise<FlagRecord[]> {
  const shapeDir = join(assetsDir, shape)
  const files = await listSvgFiles(shapeDir)
  const records: FlagRecord[] = []
  const errors: string[] = []
  const codeToFile = new Map<string, string>()

  for (const file of files) {
    try {
      const code = extractCode(file)
      const duplicateOf = codeToFile.get(code)
      if (duplicateOf) {
        throw new Error(`duplicate code "${code}" — maps to the same output file as ${duplicateOf}`)
      }
      codeToFile.set(code, file)

      const source = await readFile(join(shapeDir, file), 'utf-8')
      records.push({
        shape,
        code,
        componentName: codeToComponentName(code, shape),
        innerSvg: extractInnerSvg(source),
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      errors.push(`  - ${shape}/${file}: ${message}`)
    }
  }

  if (errors.length > 0) {
    throw new Error(`Failed to process flags in "${shape}":\n${errors.join('\n')}`)
  }

  return records
}

async function emitShape(
  target: CodegenTarget,
  outRoot: string,
  shape: FlagShape,
  records: FlagRecord[],
): Promise<void> {
  const outDir = join(outRoot, shape)
  await mkdir(outDir, { recursive: true })

  await Promise.all(
    records.map((record) =>
      writeFile(join(outDir, `${record.code}${target.extension}`), target.renderFlagFile(record), 'utf-8'),
    ),
  )

  await writeFile(join(outDir, 'index.ts'), target.renderShapeBarrel(records), 'utf-8')
}

async function checkExists(p: string): Promise<boolean> {
  try {
    await stat(p)
    return true
  } catch {
    return false
  }
}

export async function generateFlags(target: CodegenTarget): Promise<void> {
  const startedAt = Date.now()
  const assetsDir = target.assetsDir ?? DEFAULT_ASSETS_DIR
  const outRoot = join(target.packageDir, 'src', 'flags')
  console.log(`→ Reading source SVGs from ${assetsDir}`)

  if (await checkExists(outRoot)) {
    await rm(outRoot, { recursive: true, force: true })
  }
  await mkdir(outRoot, { recursive: true })

  const shapes = await listShapes(assetsDir)
  console.log(`→ Found ${shapes.length} shapes`)

  const allRecords: FlagRecord[] = []
  for (const shape of shapes) {
    const records = await processShape(assetsDir, shape)
    allRecords.push(...records)
    await emitShape(target, outRoot, shape, records)
  }

  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(2)
  console.log(`✓ Generated ${allRecords.length} flags across ${shapes.length} shapes in ${elapsed}s`)
}