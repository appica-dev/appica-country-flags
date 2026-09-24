import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateFlags } from '../../../scripts/codegen/index.js'
import type { FlagRecord } from '../../../scripts/codegen/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PACKAGE_DIR = join(__dirname, '..')

function renderFlagFile(record: FlagRecord): string {
  const { innerSvg } = record
  return (
    `<script lang="ts" module>\n` +
    `  export const svgContent = ${JSON.stringify(innerSvg)}\n` +
    `</script>\n` +
    `<script lang="ts">\n` +
    `  import FlagSvg from '../../FlagSvg.svelte'\n` +
    `  import type { FlagComponentProps } from '../../types.js'\n` +
    `\n` +
    `  let { ref = $bindable(null), ...rest }: FlagComponentProps = $props()\n` +
    `</script>\n` +
    `\n` +
    `<FlagSvg {svgContent} bind:ref {...rest} />\n`
  )
}

function renderShapeBarrel(records: FlagRecord[]): string {
  return (
    records
      .map((record) => `export { default as ${record.componentName} } from "./${record.code}.svelte";`)
      .sort()
      .join('\n') + '\n'
  )
}

generateFlags({
  packageDir: PACKAGE_DIR,
  extension: '.svelte',
  renderFlagFile,
  renderShapeBarrel,
}).catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
