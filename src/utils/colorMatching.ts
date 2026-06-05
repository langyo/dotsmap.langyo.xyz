import type { PerlerColor } from '@/data/perlerColors'

function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  let rr = r / 255
  let gg = g / 255
  let bb = b / 255

  rr = rr > 0.04045 ? Math.pow((rr + 0.055) / 1.055, 2.4) : rr / 12.92
  gg = gg > 0.04045 ? Math.pow((gg + 0.055) / 1.055, 2.4) : gg / 12.92
  bb = bb > 0.04045 ? Math.pow((bb + 0.055) / 1.055, 2.4) : bb / 12.92

  let x = (rr * 0.4124564 + gg * 0.3575761 + bb * 0.1804375) / 0.95047
  let y = (rr * 0.2126729 + gg * 0.7151522 + bb * 0.072175) / 1.0
  let z = (rr * 0.0193339 + gg * 0.119192 + bb * 0.9503041) / 1.08883

  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)

  const L = 116 * f(y) - 16
  const A = 500 * (f(x) - f(y))
  const Bi = 200 * (f(y) - f(z))

  return [L, A, Bi]
}

export function findClosestColor(
  r: number,
  g: number,
  b: number,
  palette: PerlerColor[],
): PerlerColor {
  if (palette.length === 0) throw new Error('Palette is empty')

  const [l, a, bl] = rgbToLab(r, g, b)

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

export function quantizeImage(
  imageData: ImageData,
  palette: PerlerColor[],
): { data: Uint8ClampedArray; colorMap: Map<string, PerlerColor> } {
  const { data, width, height } = imageData
  const result = new Uint8ClampedArray(data.length)
  const colorMap = new Map<string, PerlerColor>()

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3]
    if (alpha < 128) {
      result[i + 3] = 0
      continue
    }

    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    const nearest = findClosestColor(r, g, b, palette)
    colorMap.set(nearest.id, nearest)

    result[i] = nearest.r
    result[i + 1] = nearest.g
    result[i + 2] = nearest.b
    result[i + 3] = 255
  }

  return { data: result, colorMap }
}
