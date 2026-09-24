/// <reference types="vite/client" />
import { describe, it, expect } from 'vitest'
import * as Rounded from '../flags/rounded/index.js'
import * as Circle from '../flags/circle/index.js'

const roundedKeys = Object.keys(Rounded)
const circleKeys = Object.keys(Circle)

const roundedModules = import.meta.glob('../flags/rounded/*.svelte', { eager: true })
const circleModules = import.meta.glob('../flags/circle/*.svelte', { eager: true })

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
    expect(Object.keys(roundedModules).length).toBe(261)
    for (const [key, mod] of Object.entries(roundedModules)) {
      const svgContent = (mod as { svgContent: string }).svgContent
      expect(svgContent, key).toBeTruthy()
      expect(svgContent, key).not.toMatch(/<svg[\s>]/i)
    }
  })

  it('every circle component has non-empty inner svgContent', () => {
    expect(Object.keys(circleModules).length).toBe(261)
    for (const [key, mod] of Object.entries(circleModules)) {
      const svgContent = (mod as { svgContent: string }).svgContent
      expect(svgContent, key).toBeTruthy()
      expect(svgContent, key).not.toMatch(/<svg[\s>]/i)
    }
  })
})
