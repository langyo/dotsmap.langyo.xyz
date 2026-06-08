import { describe, it, expect } from 'vitest'
import { allBrands, buildPalettes, contrastTextColor, getPaletteByCount } from '@/data/perlerColors'

describe('perlerColors', () => {
  describe('allBrands', () => {
    it('has 11 brands', () => {
      expect(allBrands).toHaveLength(11)
    })

    it('each brand has required properties', () => {
      for (const brand of allBrands) {
        expect(brand.id).toBeTruthy()
        expect(brand.name).toBeTruthy()
        expect(brand.shortName).toBeTruthy()
        expect(brand.colors.length).toBeGreaterThan(0)
        for (const c of brand.colors) {
          expect(c.code).toBeTruthy()
          expect(c.name).toBeTruthy()
          expect(c.hex).toMatch(/^#[0-9a-fA-F]{6}$/)
          expect(c.r).toBeGreaterThanOrEqual(0)
          expect(c.r).toBeLessThanOrEqual(255)
          expect(c.g).toBeGreaterThanOrEqual(0)
          expect(c.g).toBeLessThanOrEqual(255)
          expect(c.b).toBeGreaterThanOrEqual(0)
          expect(c.b).toBeLessThanOrEqual(255)
          expect(c.category).toBeTruthy()
          expect(c.family).toBeTruthy()
        }
      }
    })

    it('brand ids are unique', () => {
      const ids = allBrands.map(b => b.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('color codes within each brand are unique', () => {
      for (const brand of allBrands) {
        const codes = brand.colors.map(c => c.code)
        expect(new Set(codes).size).toBe(codes.length)
      }
    })
  })

  describe('buildPalettes', () => {
    it('returns palettes for each brand', () => {
      for (const brand of allBrands) {
        const palettes = buildPalettes(brand)
        expect(palettes.length).toBeGreaterThan(0)
        const lastPalette = palettes[palettes.length - 1]
        expect(lastPalette.count).toBe(brand.colors.length)
        expect(lastPalette.colors.length).toBe(brand.colors.length)
      }
    })

    it('palette colors are subset of brand colors', () => {
      const brand = allBrands[0]
      const palettes = buildPalettes(brand)
      for (const p of palettes) {
        const brandCodes = new Set(brand.colors.map(c => c.code))
        for (const c of p.colors) {
          expect(brandCodes.has(c.code)).toBe(true)
        }
      }
    })

    it('smaller palettes have fewer colors', () => {
      const brand = allBrands[0]
      const palettes = buildPalettes(brand)
      for (let i = 0; i < palettes.length - 1; i++) {
        expect(palettes[i].count).toBeLessThan(palettes[i + 1].count)
      }
    })
  })

  describe('getPaletteByCount', () => {
    it('returns full palette for full count', () => {
      const brand = allBrands[0]
      const palette = getPaletteByCount(brand, brand.colors.length)
      expect(palette.length).toBe(brand.colors.length)
    })
  })

  describe('contrastTextColor', () => {
    it('returns dark text for light backgrounds', () => {
      expect(contrastTextColor('#FFFFFF')).toContain('0,0,0')
    })

    it('returns light text for dark backgrounds', () => {
      expect(contrastTextColor('#000000')).toContain('255,255,255')
    })

    it('returns dark text for bright yellow', () => {
      expect(contrastTextColor('#FFFF00')).toContain('0,0,0')
    })
  })
})
