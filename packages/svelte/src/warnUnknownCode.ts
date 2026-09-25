import { DEV } from 'esm-env'

// esm-env resolves DEV through the bundler's development/production export conditions. A
// `process.env.NODE_ENV` check would never warn in the browser under Vite, where `process` is
// undefined, and the dynamic components only warn in the browser (from an $effect).
export function warnUnknownCode(displayName: string, code: string): void {
  if (DEV) {
    console.warn(`[@appica/country-flags-svelte] ${displayName}: unknown country code "${code}"`)
  }
}
