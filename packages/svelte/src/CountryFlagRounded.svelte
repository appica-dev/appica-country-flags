<script lang="ts">
  import type { Component } from 'svelte'
  import * as RoundedFlags from './flags/rounded/index.js'
  import type { CountryFlagProps } from './types.js'
  import { warnUnknownCode } from './warnUnknownCode.js'

  let { code, ref = $bindable(null), ...rest }: CountryFlagProps = $props()

  const registry = RoundedFlags as unknown as Record<string, Component<Record<string, unknown>>>
  const Flag = $derived(registry[`${code.toUpperCase().replace(/-/g, '')}Rounded`])

  $effect(() => {
    if (!Flag) warnUnknownCode('CountryFlagRounded', code)
  })
</script>

{#if Flag}
  <Flag bind:ref {...rest} />
{/if}
