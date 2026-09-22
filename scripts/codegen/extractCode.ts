export type FlagShape = 'circle' | 'rounded'

const SHAPE_SUFFIXES: Record<FlagShape, string> = {
  circle: 'Circle',
  rounded: 'Rounded',
}

export function isFlagShape(value: string): value is FlagShape {
  return Object.hasOwn(SHAPE_SUFFIXES, value)
}

export function extractCode(filename: string): string {
  const name = filename.replace('.svg', '')
  const parts = name.split('-')
  const last = parts[parts.length - 1]
  const secondLast = parts[parts.length - 2]

  if (/^[a-z]{2}$/.test(last)) {
    if (/^[a-z]{2}$/.test(secondLast)) {
      return `${secondLast}-${last}`
    }
    return last
  }

  if (secondLast && /^[a-z]{2}$/.test(secondLast)) {
    return `${secondLast}-${last}`
  }

  return last
}

export function codeToComponentName(code: string, shape: FlagShape): string {
  const upper = code.toUpperCase().replace(/-/g, '')
  return `${upper}${SHAPE_SUFFIXES[shape]}`
}