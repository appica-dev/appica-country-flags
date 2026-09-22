import { describe, it, expect } from 'vitest'
import { extractCode, codeToComponentName } from '../extractCode'

describe('extractCode', () => {
  it('extracts a plain ISO alpha-2 code', () => {
    expect(extractCode('us.svg')).toBe('us')
  })

  it('extracts an alpha-2 + alpha-2 subcode', () => {
    expect(extractCode('gb-sct.svg')).toBe('gb-sct')
    expect(extractCode('bq-ba.svg')).toBe('bq-ba')
    expect(extractCode('es-pv.svg')).toBe('es-pv')
  })

  it('extracts a subcode with digits', () => {
    expect(extractCode('pt-20.svg')).toBe('pt-20')
    expect(extractCode('it-88.svg')).toBe('it-88')
    expect(extractCode('fr-2b.svg')).toBe('fr-2b')
  })

  it('extracts a subcode with a single letter', () => {
    expect(extractCode('ec-w.svg')).toBe('ec-w')
  })
})

describe('codeToComponentName', () => {
  it('uppercases and strips hyphens, appending suffix', () => {
    expect(codeToComponentName('us', 'rounded')).toBe('USRounded')
    expect(codeToComponentName('gb-sct', 'rounded')).toBe('GBSCTRounded')
    expect(codeToComponentName('us', 'circle')).toBe('USCircle')
    expect(codeToComponentName('bq-ba', 'circle')).toBe('BQBACircle')
  })
})
