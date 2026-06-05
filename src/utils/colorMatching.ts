import type { PerlerColor } from '@/data/perlerColors'

function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const rr = r / 255 > 0.04045 ? Math.pow((r / 255 + 0.055) / 1.055, 2.4) : r / 255 / 12.92
  const gg = g / 255 > 0.04045 ? Math.pow((g / 255 + 0.055) / 1.055, 2.4) : g / 255 / 12.92
  const bb = b / 255 > 0.04045 ? Math.pow((b / 255 + 0.055) / 1.055, 2.4) : b / 255 / 12.92

  const x = (rr * 0.4124564 + gg * 0.3575761 + bb * 0.1804375) / 0.95047
  const y = (rr * 0.2126729 + gg * 0.7151522 + bb * 0.072175)
  const z = (rr * 0.0193339 + gg * 0.119192 + bb * 0.9503041) / 1.08883

  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)

  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))]
}

const labCache = new Map<string, [number, number, number]>()

function cachedRgbToLab(r: number, g: number, b: number): [number, number, number] {
  const key = `${r},${g},${b}`
  const cached = labCache.get(key)
  if (cached) return cached
  const lab = rgbToLab(r, g, b)
  labCache.set(key, lab)
  return lab
}

export function findClosestColor(
  r: number,
  g: number,
  b: number,
  palette: PerlerColor[],
): PerlerColor {
  if (palette.length === 0) throw new Error('Palette is empty')

  const [l, a, bl] = cachedRgbToLab(r, g, b)

  let best = palette[0]
  let bestDist = Infinity

  for (const color of palette) {
    const [cl, ca, cb] = rgbToLab(color.r, color.g, color.b)
    const dl = l - cl
    const da = a - ca
    const db = bl - cb
    const dist = dl * dl + da * da + db * db

    if (dist < bestDist) {
      bestDist = dist
      best = color
    }
  }

  return best
}
