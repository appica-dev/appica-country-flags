<script lang="ts">
  import FlagSvg from '../FlagSvg.svelte'

  interface Props {
    svgContent: string
    title?: string
    onref: (el: SVGSVGElement) => void
  }

  let { svgContent, title, onref }: Props = $props()
  let ref = $state<SVGSVGElement | null>(null)

  $effect(() => {
    if (ref) onref(ref)
  })
</script>

<FlagSvg {svgContent} {title} bind:ref />
