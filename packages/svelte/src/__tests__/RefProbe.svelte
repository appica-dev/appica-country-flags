<script lang="ts">
  import type { Component } from 'svelte'

  // Renders `component` with `bind:ref` and reports every value the binding takes.
  interface Props {
    component: Component<any, any, 'ref'>
    onref: (el: SVGSVGElement | null) => void
    [prop: string]: unknown
  }

  let { component: Flag, onref, ...props }: Props = $props()
  let ref = $state<SVGSVGElement | null>(null)

  $effect(() => {
    onref(ref)
  })
</script>

<Flag bind:ref {...props} />
