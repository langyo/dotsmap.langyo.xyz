export interface BeadColor {
  code: string
  name: string
  hex: string
  r: number
  g: number
  b: number
  category: 'solid' | 'pearl' | 'neon' | 'glow' | 'glitter' | 'striped' | 'metallic'
  family: ColorFamily
}

export type ColorFamily =
  | 'white' | 'gray' | 'black'
  | 'red' | 'pink' | 'purple' | 'blue'
  | 'green' | 'yellow' | 'orange' | 'brown'
  | 'skin' | 'metal' | 'special'

export interface BrandDef {
  id: string
  name: string
  shortName: string
  prefix: string
  colors: BeadColor[]
}

function h(hex: string): [number, number, number] {
  const v = parseInt(hex.slice(1), 16)
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255]
}

function c(
  code: string, name: string, hex: string,
  category: BeadColor['category'] = 'solid',
  family: BeadColor['family'],
): BeadColor {
  const [r, g, b] = h(hex)
  return { code, name, hex, r, g, b, category, family }
}

export { c }
