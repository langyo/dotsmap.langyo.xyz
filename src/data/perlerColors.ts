import type { BrandDef, BeadColor, ColorFamily } from './brands/types'
import { perler } from './brands/perler'
import { hama } from './brands/hama'
import { artkal } from './brands/artkal'
import { nabbi } from './brands/nabbi'
import { artkalc } from './brands/artkalc'
import { pyssla } from './brands/pyssla'
import { mard } from './brands/mard'
import { coco } from './brands/coco'
import { manman } from './brands/manman'
import { panpan } from './brands/panpan'
import { mixiaowo } from './brands/mixiaowo'
import { rgbToLab } from '@/utils/colorMatching'

export type { BeadColor, BrandDef }
export { perler, hama, artkal, nabbi, artkalc, pyssla, mard, coco, manman, panpan, mixiaowo }

export const allBrands: BrandDef[] = [mard, coco, manman, panpan, mixiaowo, perler, hama, artkal, nabbi, artkalc, pyssla]

export type BeadCategory = BeadColor['category']

export interface PaletteSet {
  label: string
  count: number
  colors: BeadColor[]
}

const labCache = new Map<string, [number, number, number]>()

function cachedLab(color: BeadColor): [number, number, number] {
  const cached = labCache.get(color.code)
  if (cached) return cached
  const lab = rgbToLab(color.r, color.g, color.b)
  labCache.set(color.code, lab)
  return lab
}

function labDist(a: BeadColor, b: BeadColor): number {
  const [l1, a1, b1] = cachedLab(a)
  const [l2, a2, b2] = cachedLab(b)
  const dl = l1 - l2
  const da = a1 - a2
  const db = b1 - b2
  return dl * dl + da * da + db * db
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
        const d = labDist(c, s)
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
  const sizes = brand.paletteSizes ?? [24, 36, 48, 72, 144]
  const palettes: PaletteSet[] = sizes
    .filter((s) => s < max)
    .map((s) => ({ label: `${s}色`, count: s, colors: selectDiverse(brand.colors, s) }))
  palettes.push({ label: '全部', count: max, colors: [...brand.colors] })
  return palettes.filter((p) => p.colors.length >= Math.min(p.count, 24))
}

export function getPaletteByCount(brand: BrandDef, count: number): BeadColor[] {
  const palettes = buildPalettes(brand)
  const found = palettes.find((p) => p.count === count)
  return found ? found.colors : selectDiverse(brand.colors, count)
}

export function contrastTextColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const lum = 0.299 * r + 0.587 * g + 0.114 * b
  return lum > 0.45 ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.9)'
}
