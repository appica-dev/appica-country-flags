// Compile-time assertions for the public prop types — checked by `pnpm typecheck`, not vitest.
import type { ComponentProps } from 'svelte'
import type { CountryFlagProps, CountryFlagRounded, USRounded } from '../index.js'

type DynamicProps = ComponentProps<typeof CountryFlagRounded>
type StaticProps = ComponentProps<typeof USRounded>

export const dynamicProps: DynamicProps[] = [
  { code: 'us' },
  { code: 'gb-sct', size: 32, title: 'Scotland', class: 'size-6', style: 'vertical-align: middle' },
  { code: 'fr', size: '2rem', width: 48, height: '1.5rem', 'aria-hidden': false, role: 'img', ref: null },
  { code: 'de', class: ['flag', { active: true }], onclick: () => {}, 'data-testid': 'flag' },
]

export const staticProps: StaticProps[] = [{}, { size: 24, title: 'United States', class: 'size-6', ref: null }]

// CountryFlagProps, exported for typing wrappers, is exactly the dynamic components' props.
export const toExported: CountryFlagProps = {} as DynamicProps
export const fromExported: DynamicProps = {} as CountryFlagProps

// @ts-expect-error code is required on the dynamic components
export const missingCode: DynamicProps = { size: 24 }

// @ts-expect-error static flags take no code
export const staticCode: StaticProps = { code: 'us' }

// @ts-expect-error size takes a number or a string
export const invalidSize: StaticProps = { size: true }

// @ts-expect-error ref is the svg element
export const invalidRef: StaticProps = { ref: {} as HTMLDivElement }

// @ts-expect-error unknown props are rejected
export const unknownProp: StaticProps = { notAProp: 1 }
