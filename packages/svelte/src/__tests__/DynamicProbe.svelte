<script lang="ts">
  import type { Component } from 'svelte'
  import type { CountryFlagProps } from '../types.js'

  interface Props {
    component: Component<CountryFlagProps>
    code: string
    title?: string
    onref: (el: SVGSVGElement) => void
  }

  let { component: Flag, code, title, onref }: Props = $props()
  let ref = $state<SVGSVGElement | null>(null)

  $effect(() => {
    if (ref) onref(ref)
  })
</script>

<Flag {code} {title} bind:ref />
