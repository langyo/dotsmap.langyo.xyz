import { describe, it, expect } from 'vitest'

describe('imageProcessing', () => {
  describe('downsampleToGrid', () => {
    it('downsamples a simple image to grid cells', async () => {
      const { downsampleToGrid } = await import('@/utils/imageProcessing')
      const data = new Uint8ClampedArray([
        255, 0, 0, 255,  0, 255, 0, 255,
        0, 0, 255, 255,  255, 255, 0, 255,
      ])
      const imageData = new ImageData(data, 2, 2)
      const cells = downsampleToGrid(imageData, 2, 2)
      expect(cells).toHaveLength(4)
      expect(cells[0]).toEqual({ x: 0, y: 0, r: 255, g: 0, b: 0, a: 255 })
      expect(cells[1]).toEqual({ x: 1, y: 0, r: 0, g: 255, b: 0, a: 255 })
      expect(cells[2]).toEqual({ x: 0, y: 1, r: 0, g: 0, b: 255, a: 255 })
      expect(cells[3]).toEqual({ x: 1, y: 1, r: 255, g: 255, b: 0, a: 255 })
    })

    it('averages pixels in larger cells', async () => {
      const { downsampleToGrid } = await import('@/utils/imageProcessing')
      const data = new Uint8ClampedArray([
        100, 0, 0, 255,  200, 0, 0, 255,
        100, 0, 0, 255,  200, 0, 0, 255,
      ])
      const imageData = new ImageData(data, 4, 1)
      const cells = downsampleToGrid(imageData, 2, 1)
      expect(cells).toHaveLength(2)
      expect(cells[0].r).toBe(150)
      expect(cells[1].r).toBe(150)
    })

    it('returns empty for 0x0 grid', async () => {
      const { downsampleToGrid } = await import('@/utils/imageProcessing')
      const data = new Uint8ClampedArray([])
      const imageData = new ImageData(data, 0, 0)
      const cells = downsampleToGrid(imageData, 0, 0)
      expect(cells).toHaveLength(0)
    })
  })

  describe('removeBackground', () => {
    it('removes uniform background from edges', async () => {
      const { removeBackground } = await import('@/utils/imageProcessing')
      const data = new Uint8ClampedArray([
        255, 255, 255, 255,  255, 255, 255, 255,  255, 255, 255, 255,
        255, 255, 255, 255,  0, 0, 0, 255,        255, 255, 255, 255,
        255, 255, 255, 255,  255, 255, 255, 255,  255, 255, 255, 255,
      ])
      const imageData = new ImageData(data, 3, 3)
      const result = removeBackground(imageData, 10)
      expect(result.data[(0 * 3 + 0) * 4 + 3]).toBe(0)
      expect(result.data[(0 * 3 + 1) * 4 + 3]).toBe(0)
      expect(result.data[(0 * 3 + 2) * 4 + 3]).toBe(0)
      expect(result.data[(1 * 3 + 0) * 4 + 3]).toBe(0)
      expect(result.data[(1 * 3 + 1) * 4 + 3]).toBe(255)
      expect(result.data[(1 * 3 + 2) * 4 + 3]).toBe(0)
      expect(result.data[(2 * 3 + 0) * 4 + 3]).toBe(0)
      expect(result.data[(2 * 3 + 1) * 4 + 3]).toBe(0)
      expect(result.data[(2 * 3 + 2) * 4 + 3]).toBe(0)
    })

    it('does not remove when threshold is 0 for exact match only', async () => {
      const { removeBackground } = await import('@/utils/imageProcessing')
      const data = new Uint8ClampedArray([
        255, 255, 255, 255,  255, 255, 255, 255,
        255, 255, 255, 255,  255, 255, 255, 255,
      ])
      const imageData = new ImageData(data, 2, 2)
      const result = removeBackground(imageData, 0)
      for (let i = 0; i < 4; i++) {
        expect(result.data[i * 4 + 3]).toBe(0)
      }
    })
  })

  describe('resizeImage', () => {
    it('returns original when within maxDimension', async () => {
      const { resizeImage } = await import('@/utils/imageProcessing')
      const data = new Uint8ClampedArray(4)
      data[0] = 255; data[1] = 0; data[2] = 0; data[3] = 255
      const imageData = new ImageData(data, 1, 1)
      const result = resizeImage(imageData, 512)
      expect(result).toBe(imageData)
    })
  })
})
