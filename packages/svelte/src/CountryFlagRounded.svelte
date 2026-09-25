<script lang="ts">
  import type { Component } from 'svelte'
  import * as RoundedFlags from './flags/rounded/index.js'
  import type { CountryFlagProps, FlagComponentProps } from './types.js'
  import { warnUnknownCode } from './warnUnknownCode.js'

  let { code, ref = $bindable(null), ...rest }: CountryFlagProps = $props()

  const registry: Record<string, Component<FlagComponentProps, {}, 'ref'> | undefined> = RoundedFlags
  const Flag = $derived(registry[`${code.toUpperCase().replace(/-/g, '')}Rounded`])

  $effect(() => {
    if (!Flag) warnUnknownCode('CountryFlagRounded', code)
  })
</script>

{#if Flag}
  <Flag bind:ref {...rest} />
{/if}
