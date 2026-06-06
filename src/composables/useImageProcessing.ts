import { useAppStore } from '@/stores/app'
import {
  removeBackground,
  resizeImage,
  loadImage,
  imageToImageData,
  imageDataToCanvas,
  downsampleToGrid,
} from '@/utils/imageProcessing'
import { findClosestColor, clearPaletteCache } from '@/utils/colorMatching'
import type { BeadPattern } from '@/types'

export function useImageProcessing() {
  const store = useAppStore()

  function dataURLFromImageData(imageData: ImageData): string {
    return imageDataToCanvas(imageData).toDataURL()
  }

  function handleError(err: unknown, fallback: string) {
    const msg = err instanceof Error ? err.message : String(err)
    store.setError(fallback ? `${fallback}: ${msg}` : msg)
    store.isProcessing = false
  }

  async function handleFileUpload(file: File) {
    store.isProcessing = true
    store.setError(null)
    try {
      const img = await loadImage(file)
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas not supported')
      ctx.drawImage(img, 0, 0)
      store.setSourceImage(img, canvas.toDataURL())
      applyPreprocessing()
    } catch (err) {
      handleError(err, '图片加载失败')
    } finally {
      store.isProcessing = false
    }
  }

  function applyPreprocessing() {
    if (!store.sourceImage) return
    store.isProcessing = true
    store.setError(null)

    try {
      let imageData = imageToImageData(store.sourceImage)
      imageData = resizeImage(imageData, 512)

      if (store.preprocessMode === 'remove-bg' && imageData.width > 1 && imageData.height > 1) {
        imageData = removeBackground(imageData, store.bgThreshold)
      }

      store.setProcessedImage(imageData, dataURLFromImageData(imageData))
      generatePattern()
    } catch (err) {
      handleError(err, '预处理失败')
    } finally {
      store.isProcessing = false
    }
  }

  function generatePattern() {
    const source = store.processedImageData
      ?? (store.sourceImage ? imageToImageData(store.sourceImage) : null)

    if (!source) return
    store.isProcessing = true
    store.setError(null)
    clearPaletteCache()

    try {
      const gw = store.gridWidth
      const gh = store.gridHeight
      const resized = resizeImage(source, 512)
      const cells = downsampleToGrid(resized, gw, gh)

      const patternCells: Array<{ x: number; y: number; colorCode: string; colorName: string; hex: string }> = []
      const usage: Record<string, number> = {}

      const cellW = resized.width / gw
      const cellH = resized.height / gh
      const beadedData = new Uint8ClampedArray(gw * gh * 4)

      for (const cell of cells) {
        if (cell.a < 128) continue

        const nearest = findClosestColor(cell.r, cell.g, cell.b, store.selectedPalette)

        patternCells.push({
          x: cell.x,
          y: cell.y,
          colorCode: nearest.code,
          colorName: nearest.name,
          hex: nearest.hex,
        })

        usage[nearest.code] = (usage[nearest.code] ?? 0) + 1

        const idx = (cell.y * gw + cell.x) * 4
        beadedData[idx] = nearest.r
        beadedData[idx + 1] = nearest.g
        beadedData[idx + 2] = nearest.b
        beadedData[idx + 3] = 255
      }

      const beadedImageData = new ImageData(beadedData, gw, gh)
      store.setBeadedImage(beadedImageData, dataURLFromImageData(beadedImageData))

      const pattern: BeadPattern = {
        cells: patternCells,
        gridWidth: gw,
        gridHeight: gh,
        beadSize: store.beadSize,
        paletteLabel: store.selectedPaletteLabel,
        paletteCount: store.selectedPaletteCount,
        sourceWidth: resized.width,
        sourceHeight: resized.height,
      }
      store.setBeadPattern(pattern, usage)
    } catch (err) {
      handleError(err, '图纸生成失败')
    } finally {
      store.isProcessing = false
    }
  }

  function resetAll() {
    store.resetAll()
  }

  function resetAndRegenerate() {
    store.resetPreprocess()
    generatePattern()
  }

  return { handleFileUpload, applyPreprocessing, generatePattern, resetAll, resetAndRegenerate }
}
