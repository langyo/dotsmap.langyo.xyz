import { useAppStore } from '@/stores/app'
import {
  removeBackground,
  magicWandSelect,
  resizeImage,
  loadImage,
  imageToImageData,
  imageDataToCanvas,
  downsampleToGrid,
} from '@/utils/imageProcessing'
import { findClosestColor } from '@/utils/colorMatching'
import type { BeadPattern, PatternCell } from '@/types'

export function useImageProcessing() {
  const store = useAppStore()

  function dataURLFromImageData(imageData: ImageData): string {
    const canvas = imageDataToCanvas(imageData)
    return canvas.toDataURL()
  }

  async function handleFileUpload(file: File) {
    store.isProcessing = true
    try {
      const img = await loadImage(file)
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const dataURL = canvas.toDataURL()
      store.setSourceImage(img, dataURL)
    } finally {
      store.isProcessing = false
    }
  }

  function applyPreprocessing() {
    if (!store.sourceImage) return
    store.isProcessing = true

    try {
      let imageData = imageToImageData(store.sourceImage!)

      imageData = resizeImage(imageData, 512)

      if (store.preprocessMode === 'remove-bg') {
        imageData = removeBackground(imageData, store.bgThreshold)
      } else if (store.preprocessMode === 'magic-wand') {
        imageData = magicWandSelect(imageData, store.magicX, store.magicY, store.magicTolerance)
      }

      const dataURL = dataURLFromImageData(imageData)
      store.setProcessedImage(imageData, dataURL)
    } finally {
      store.isProcessing = false
    }
  }

  function generatePattern() {
    const source = store.processedImageData
      ? store.processedImageData
      : store.sourceImage
        ? imageToImageData(store.sourceImage!)
        : null

    if (!source) return
    store.isProcessing = true

    try {
      const resized = resizeImage(source, 512)

      const cells = downsampleToGrid(resized, store.gridWidth, store.gridHeight)

      const patternCells: PatternCell[] = []
      const usage = new Map<string, number>()

      const beadedData = new Uint8ClampedArray(resized.width * resized.height * 4)
      const opacityData = new Uint8ClampedArray(resized.width * resized.height * 4)

      for (const cell of cells) {
        if (cell.a < 128) continue

        const nearest = findClosestColor(cell.r, cell.g, cell.b, store.selectedPalette)

        patternCells.push({
          x: cell.x,
          y: cell.y,
          colorId: nearest.id,
          colorName: nearest.name,
          hex: nearest.hex,
        })

        usage.set(nearest.id, (usage.get(nearest.id) ?? 0) + 1)

        const cellW = Math.ceil(resized.width / store.gridWidth)
        const cellH = Math.ceil(resized.height / store.gridHeight)
        for (let py = cell.y * cellH; py < Math.min((cell.y + 1) * cellH, resized.height); py++) {
          for (let px = cell.x * cellW; px < Math.min((cell.x + 1) * cellW, resized.width); px++) {
            const idx = (py * resized.width + px) * 4
            beadedData[idx] = nearest.r
            beadedData[idx + 1] = nearest.g
            beadedData[idx + 2] = nearest.b
            beadedData[idx + 3] = 255
          }
        }
      }

      const beadedImageData = new ImageData(beadedData, resized.width, resized.height)
      store.setBeadedImage(beadedImageData, dataURLFromImageData(beadedImageData))

      const pattern: BeadPattern = {
        cells: patternCells,
        gridWidth: store.gridWidth,
        gridHeight: store.gridHeight,
        beadSize: store.beadSize,
        paletteLabel: store.selectedPaletteLabel,
        paletteCount: store.selectedPaletteCount,
        sourceWidth: resized.width,
        sourceHeight: resized.height,
      }
      store.setBeadPattern(pattern, usage)
    } finally {
      store.isProcessing = false
    }
  }

  function resetAll() {
    store.$reset()
  }

  return {
    handleFileUpload,
    applyPreprocessing,
    generatePattern,
    resetAll,
  }
}
