<script lang="ts">
  import type { FlagComponentProps } from './types.js'

  interface Props extends FlagComponentProps {
    svgContent: string
  }

  let {
    svgContent,
    size = '1em',
    title,
    width,
    height,
    ref = $bindable(null),
    'aria-hidden': ariaHidden,
    role,
    ...rest
  }: Props = $props()

  const resolvedWidth = $derived(width ?? size)
  const resolvedHeight = $derived(height ?? size)
</script>

<svg
  bind:this={ref}
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 40 40"
  role={title ? (role ?? 'img') : role}
  aria-hidden={title ? ariaHidden : (ariaHidden ?? true)}
  width={resolvedWidth}
  height={resolvedHeight}
  {...rest}
>
  {#if title}
    <title>{title}</title>
  {/if}
  {@html svgContent}
</svg>
