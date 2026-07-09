import { readdir, readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { extractCode, codeToComponentName } from './extractCode'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const ASSETS_ROOT = join(__dirname, '..', '..', '..')

function extractInnerSvg(svgContent: string): string {
  const match = svgContent.trim().match(/^<svg[^>]*>([\s\S]*)<\/svg>$/)
  return match ? match[1] : ''
}

async function generateFlagFile(svgPath: string, outPath: string, code: string, componentName: string): Promise<void> {
  const svgContent = await readFile(svgPath, 'utf-8')
  const innerHtml = extractInnerSvg(svgContent)
  const content = `import { createCountryFlag } from "../../createCountryFlag.js";
const ${componentName} = createCountryFlag(${JSON.stringify(code)}, ${JSON.stringify(innerHtml)});
export default ${componentName};
`
  await writeFile(outPath, content, 'utf-8')
}

async function processShape(shape: 'rounded' | 'circle'): Promise<void> {
  const flagsDir = join(ASSETS_ROOT, 'assets', shape)
  const outDir = join(ROOT, 'src', 'flags', shape)

  await mkdir(outDir, { recursive: true })

  const files = (await readdir(flagsDir)).filter((f) => f.endsWith('.svg')).sort()

  await Promise.all(
    files.map(async (file) => {
      const code = extractCode(file)
      const componentName = codeToComponentName(code, shape)
      const svgPath = join(flagsDir, file)
      const outPath = join(outDir, `${code}.tsx`)
      await generateFlagFile(svgPath, outPath, code, componentName)
    }),
  )

  const barrelLines = files
    .map((file) => {
      const code = extractCode(file)
      const componentName = codeToComponentName(code, shape)
      return `export { default as ${componentName} } from "./${code}.js";`
    })
    .sort()

  await writeFile(join(outDir, 'index.ts'), barrelLines.join('\n') + '\n', 'utf-8')
  console.log(`✓ Generated ${files.length} ${shape} flag components`)
}

async function main(): Promise<void> {
  await mkdir(join(ROOT, 'src', 'flags'), { recursive: true })
  await Promise.all([processShape('rounded'), processShape('circle')])
  console.log('✓ Codegen complete')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
