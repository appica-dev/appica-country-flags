import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateFlags } from '../../../scripts/codegen/index.js'
import type { FlagRecord } from '../../../scripts/codegen/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PACKAGE_DIR = join(__dirname, '..')

function renderFlagFile(record: FlagRecord): string {
  return (
    `<script lang="ts">\n` +
    `  import FlagSvg from "../../FlagSvg.svelte";\n` +
    `  import type { FlagComponentProps } from "../../types.js";\n\n` +
    // Without an annotation, svelte-package emits a .d.ts that references an undeclared
    // $$ComponentProps type, leaving every flag's props untyped for consumers.
    `  let { ref = $bindable(null), ...props }: FlagComponentProps = $props();\n\n` +
    // Instance-level on purpose: exported from <script module>, the markup would be copied into
    // the flag's .d.ts as a string literal type, doubling the published size.
    `  const svgContent = ${JSON.stringify(record.innerSvg)};\n` +
    `</script>\n\n` +
    `<FlagSvg {svgContent} bind:ref {...props} />\n`
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
