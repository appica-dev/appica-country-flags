declare const process: { env?: { NODE_ENV?: string } } | undefined

export function warnUnknownCode(displayName: string, code: string): void {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
    console.warn(`[@appica/country-flags-svelte] ${displayName}: unknown country code "${code}"`)
  }
}
