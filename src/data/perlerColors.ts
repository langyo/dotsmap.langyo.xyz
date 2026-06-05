import type { BrandDef, BeadColor, ColorFamily } from './brands/types'
import { perler } from './brands/perler'
import { hama } from './brands/hama'
import { artkal } from './brands/artkal'
import { nabbi } from './brands/nabbi'
import { artkalc } from './brands/artkalc'
import { pyssla } from './brands/pyssla'

export type { BeadColor, BrandDef, ColorFamily }
export { perler, hama, artkal, nabbi, artkalc, pyssla }

export const allBrands: BrandDef[] = [perler, hama, artkal, nabbi, artkalc, pyssla]

export const familyOrder: ColorFamily[] = [
  'white', 'gray', 'black',
  'red', 'pink', 'orange', 'yellow',
  'green', 'blue', 'purple', 'brown',
  'skin', 'metal', 'special',
]

export const familyLabel: Record<ColorFamily, string> = {
  white: '白', gray: '灰', black: '黑',
  red: '红', pink: '粉', orange: '橙', yellow: '黄',
  green: '绿', blue: '蓝', purple: '紫', brown: '棕',
  skin: '肤色', metal: '金属', special: '特效',
}

export type BeadCategory = BeadColor['category']

export const categoryLabel: Record<BeadCategory, string> = {
  solid: '标准色',
  pearl: '珠光',
  neon: '荧光',
  glow: '夜光',
  metallic: '金属',
  glitter: '闪粉',
  striped: '条纹',
}

export interface PaletteSet {
  label: string
  count: number
  colors: BeadColor[]
}

function rgbDist(a: BeadColor, b: BeadColor): number {
  const dr = a.r - b.r
  const dg = a.g - b.g
  const db = a.b - b.b
  return dr * dr + dg * dg + db * db
}

function selectDiverse(colors: BeadColor[], count: number): BeadColor[] {
  if (colors.length <= count) return [...colors]

  const essentialFamilies = new Set<ColorFamily>(['white', 'black', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'brown', 'gray'])
  const selected: BeadColor[] = []
  const selectedCodes = new Set<string>()

  for (const col of colors) {
    if (essentialFamilies.has(col.family) && !selectedCodes.has(col.code) && selected.length < Math.min(count, 15)) {
      selected.push(col)
      selectedCodes.add(col.code)
    }
  }

  const remaining = colors.filter((c) => !selectedCodes.has(c.code))

  while (selected.length < count && remaining.length > 0) {
    let best: BeadColor | null = null
    let bestMinDist = -1

    for (const c of remaining) {
      if (selectedCodes.has(c.code)) continue
      let minDist = Infinity
      for (const s of selected) {
        const d = rgbDist(c, s)
        if (d < minDist) minDist = d
      }
      if (minDist > bestMinDist) {
        bestMinDist = minDist
        best = c
      }
    }

    if (!best) break
    selected.push(best)
    selectedCodes.add(best.code)
  }

  return selected
}

export function buildPalettes(brand: BrandDef): PaletteSet[] {
  const max = brand.colors.length
  return [
    { label: '24色', count: 24, colors: selectDiverse(brand.colors, 24) },
    { label: '36色', count: 36, colors: selectDiverse(brand.colors, 36) },
    { label: '48色', count: 48, colors: selectDiverse(brand.colors, 48) },
    { label: '72色', count: 72, colors: selectDiverse(brand.colors, Math.min(72, max)) },
    { label: '144色', count: 144, colors: selectDiverse(brand.colors, Math.min(144, max)) },
    { label: '全部', count: max, colors: [...brand.colors] },
  ].filter((p) => p.colors.length >= Math.min(p.count, 24))
}

export function getPaletteByCount(brand: BrandDef, count: number): BeadColor[] {
  const palettes = buildPalettes(brand)
  const found = palettes.find((p) => p.count === count)
  return found ? found.colors : selectDiverse(brand.colors, count)
}

export function groupByFamily(colors: BeadColor[]): Map<ColorFamily, BeadColor[]> {
  const map = new Map<ColorFamily, BeadColor[]>()
  for (const col of colors) {
    const arr = map.get(col.family) ?? []
    arr.push(col)
    map.set(col.family, arr)
  }
  return map
}
