import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateFlags } from '../../../scripts/codegen/index.js'
import type { FlagRecord } from '../../../scripts/codegen/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PACKAGE_DIR = join(__dirname, '..')

function renderFlagFile(record: FlagRecord): string {
  const { componentName, code, innerSvg } = record
  return (
    `import { createCountryFlag } from "../../createCountryFlag.js";\n` +
    `const ${componentName} = createCountryFlag(${JSON.stringify(code)}, ${JSON.stringify(innerSvg)});\n` +
    `export default ${componentName};\n`
  )
}

function renderShapeBarrel(records: FlagRecord[]): string {
  return (
    records
      .map((record) => `export { default as ${record.componentName} } from "./${record.code}.js";`)
      .sort()
      .join('\n') + '\n'
  )
}

generateFlags({
  packageDir: PACKAGE_DIR,
  extension: '.tsx',
  renderFlagFile,
  renderShapeBarrel,
}).catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})