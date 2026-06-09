import { describe, it, expect } from 'vitest'
import { findClosestColor, clearPaletteCache } from '@/utils/colorMatching'
import type { BeadColor } from '@/data/perlerColors'

function makeBead(code: string, name: string, hex: string, r: number, g: number, b: number): BeadColor {
  return { code, name, hex, r, g, b, category: 'solid', family: 'white' }
}

describe('colorMatching', () => {
  describe('findClosestColor', () => {
    it('finds exact match in palette', () => {
      clearPaletteCache()
      const palette: BeadColor[] = [
        makeBead('W', 'White', '#FFFFFF', 255, 255, 255),
        makeBead('B', 'Black', '#000000', 0, 0, 0),
        makeBead('R', 'Red', '#FF0000', 255, 0, 0),
      ]
      const result = findClosestColor(255, 0, 0, palette)
      expect(result.code).toBe('R')
    })

    it('finds closest color by perceptual distance', () => {
      clearPaletteCache()
      const palette: BeadColor[] = [
        makeBead('W', 'White', '#FFFFFF', 255, 255, 255),
        makeBead('B', 'Black', '#000000', 0, 0, 0),
      ]
      const result = findClosestColor(240, 240, 240, palette)
      expect(result.code).toBe('W')
    })

    it('throws on empty palette', () => {
      clearPaletteCache()
      expect(() => findClosestColor(128, 128, 128, [])).toThrow('Palette is empty')
    })

    it('perceptually matches dark colors better than RGB distance', () => {
      clearPaletteCache()
      const palette: BeadColor[] = [
        makeBead('D1', 'Dark Blue', '#00008B', 0, 0, 139),
        makeBead('D2', 'Dark Red', '#8B0000', 139, 0, 0),
      ]
      const result = findClosestColor(50, 0, 100, palette)
      expect(result.code).toBe('D1')
    })

    it('handles mid-range colors correctly', () => {
      clearPaletteCache()
      const palette: BeadColor[] = [
        makeBead('G', 'Green', '#00FF00', 0, 255, 0),
        makeBead('Y', 'Yellow', '#FFFF00', 255, 255, 0),
        makeBead('C', 'Cyan', '#00FFFF', 0, 255, 255),
      ]
      const result = findClosestColor(128, 255, 0, palette)
      expect(result.code).toBe('G')
    })

    it('returns first palette color for equidistant input', () => {
      clearPaletteCache()
      const palette: BeadColor[] = [
        makeBead('R', 'Red', '#FF0000', 255, 0, 0),
        makeBead('B', 'Blue', '#0000FF', 0, 0, 255),
      ]
      const result = findClosestColor(128, 0, 128, palette)
      expect(['R', 'B']).toContain(result.code)
    })
  })
})
