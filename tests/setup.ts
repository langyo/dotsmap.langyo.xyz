import { beforeAll } from 'vitest'

beforeAll(() => {
  if (typeof ImageData === 'undefined') {
    (globalThis as any).ImageData = class ImageData {
      data: Uint8ClampedArray
      width: number
      height: number
      colorSpace: string = 'srgb'

      constructor(data: Uint8ClampedArray, width: number, height?: number) {
        this.data = data
        this.width = width
        this.height = height ?? Math.floor(data.length / (4 * width))
      }
    }
  }
})
