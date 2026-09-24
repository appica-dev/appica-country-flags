<script lang="ts">
  import type { Component } from 'svelte'
  import * as CircleFlags from './flags/circle/index.js'
  import type { CountryFlagProps } from './types.js'
  import { warnUnknownCode } from './warnUnknownCode.js'

  let { code, ref = $bindable(null), ...rest }: CountryFlagProps = $props()

  const registry = CircleFlags as unknown as Record<string, Component<Record<string, unknown>>>
  const Flag = $derived(registry[`${code.toUpperCase().replace(/-/g, '')}Circle`])

  $effect(() => {
    if (!Flag) warnUnknownCode('CountryFlagCircle', code)
  })
</script>

{#if Flag}
  <Flag bind:ref {...rest} />
{/if}
