import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/svelte'
import CountryFlagRounded from '../CountryFlagRounded.svelte'
import CountryFlagCircle from '../CountryFlagCircle.svelte'

// Bundlers resolve esm-env's DEV to false in production builds.
vi.mock('esm-env', async (importOriginal) => ({ ...(await importOriginal<typeof import('esm-env')>()), DEV: false }))

describe('in production', () => {
  it.each([
    { name: 'CountryFlagRounded', Comp: CountryFlagRounded },
    { name: 'CountryFlagCircle', Comp: CountryFlagCircle },
  ])('$name renders nothing for unknown codes, silently', ({ Comp }) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { container } = render(Comp, { code: 'zz' })
    expect(container.querySelector('svg')).toBeNull()
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })
})
