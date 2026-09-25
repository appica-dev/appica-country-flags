import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

export default {
  // `script: true` makes svelte-package ship plain-JS components (types still come from the
  // TypeScript sources). With current dependencies, Svelte before 5.14.3 can't compile TypeScript
  // in .svelte files for SSR, so shipping it would break server rendering on part of `^5.0.0`.
  preprocess: vitePreprocess({ script: true }),
}
