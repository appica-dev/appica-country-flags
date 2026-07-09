import { describe, it, expect } from 'vitest'
import * as Rounded from '../flags/rounded/index.js'
import * as Circle from '../flags/circle/index.js'

const roundedKeys = Object.keys(Rounded)
const circleKeys = Object.keys(Circle)

describe('flag registry', () => {
  it('rounded export count is 261', () => {
    expect(roundedKeys.length).toBe(261)
  })

  it('circle export count is 261', () => {
    expect(circleKeys.length).toBe(261)
  })

  it('rounded export names match /^[A-Z0-9]+Rounded$/', () => {
    for (const key of roundedKeys) {
      expect(key, key).toMatch(/^[A-Z0-9]+Rounded$/)
    }
  })

  it('circle export names match /^[A-Z0-9]+Circle$/', () => {
    for (const key of circleKeys) {
      expect(key, key).toMatch(/^[A-Z0-9]+Circle$/)
    }
  })

  it('rounded and circle cover the same set of country codes', () => {
    const roundedCodes = roundedKeys.map((k) => k.replace(/Rounded$/, '')).sort()
    const circleCodes = circleKeys.map((k) => k.replace(/Circle$/, '')).sort()
    expect(roundedCodes).toEqual(circleCodes)
  })

  it('every rounded component has non-empty inner svgContent', () => {
    for (const [key, Comp] of Object.entries(Rounded)) {
      const c = (Comp as unknown as { svgContent: string }).svgContent
      expect(c, key).toBeTruthy()
      expect(c, key).not.toMatch(/<svg[\s>]/i)
    }
  })

  it('every circle component has non-empty inner svgContent', () => {
    for (const [key, Comp] of Object.entries(Circle)) {
      const c = (Comp as unknown as { svgContent: string }).svgContent
      expect(c, key).toBeTruthy()
      expect(c, key).not.toMatch(/<svg[\s>]/i)
    }
  })
})
