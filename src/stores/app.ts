import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PerlerColor } from '@/data/perlerColors'
import { paletteSets, getPaletteByCount } from '@/data/perlerColors'
import type { BeadPattern, PreprocessMode } from '@/types'

export const useAppStore = defineStore('app', () => {
  const sourceImage = ref<HTMLImageElement | null>(null)
  const sourceDataURL = ref<string | null>(null)
  const processedImageData = ref<ImageData | null>(null)
  const processedDataURL = ref<string | null>(null)
  const selectedPalette = ref<PerlerColor[]>(paletteSets[2].colors)
  const selectedPaletteLabel = ref<string>(paletteSets[2].label)
  const selectedPaletteCount = ref<number>(paletteSets[2].count)
  const beadedImageData = ref<ImageData | null>(null)
  const beadedDataURL = ref<string | null>(null)
  const beadPattern = ref<BeadPattern | null>(null)
  const gridWidth = ref<number>(50)
  const gridHeight = ref<number>(50)
  const beadSize = ref<number>(10)
  const preprocessMode = ref<PreprocessMode>('none')
  const bgThreshold = ref<number>(30)
  const magicTolerance = ref<number>(32)
  const magicX = ref<number>(0)
  const magicY = ref<number>(0)
  const isProcessing = ref<boolean>(false)
  const colorUsage = ref<Record<string, number>>({})

  const paletteOptions = computed(() => paletteSets)

  function setSourceImage(img: HTMLImageElement, dataURL: string) {
    sourceImage.value = img
    sourceDataURL.value = dataURL
    gridWidth.value = Math.min(50, img.width)
    gridHeight.value = Math.round(img.height * (gridWidth.value / img.width))
    resetGeneratedState()
  }

  function resetGeneratedState() {
    beadPattern.value = null
    beadedImageData.value = null
    beadedDataURL.value = null
    processedImageData.value = null
    processedDataURL.value = null
    colorUsage.value = {}
  }

  function setProcessedImage(imageData: ImageData, dataURL: string) {
    processedImageData.value = imageData
    processedDataURL.value = dataURL
  }

  function setBeadedImage(imageData: ImageData, dataURL: string) {
    beadedImageData.value = imageData
    beadedDataURL.value = dataURL
  }

  function setBeadPattern(pattern: BeadPattern, usage: Record<string, number>) {
    beadPattern.value = pattern
    colorUsage.value = usage
  }

  function setPalette(count: number) {
    const colors = getPaletteByCount(count)
    selectedPalette.value = colors
    selectedPaletteCount.value = count
    selectedPaletteLabel.value = count + '色'
  }

  function setPreprocessMode(mode: PreprocessMode) {
    preprocessMode.value = mode
  }

  function setGridSize(w: number, h: number) {
    gridWidth.value = Math.max(1, Math.min(200, w))
    gridHeight.value = Math.max(1, Math.min(200, h))
  }

  function resetPreprocess() {
    processedImageData.value = null
    processedDataURL.value = null
    preprocessMode.value = 'none'
  }

  return {
    sourceImage,
    sourceDataURL,
    processedImageData,
    processedDataURL,
    selectedPalette,
    selectedPaletteLabel,
    selectedPaletteCount,
    beadedImageData,
    beadedDataURL,
    beadPattern,
    gridWidth,
    gridHeight,
    beadSize,
    preprocessMode,
    bgThreshold,
    magicTolerance,
    magicX,
    magicY,
    isProcessing,
    colorUsage,
    paletteOptions,
    setSourceImage,
    setProcessedImage,
    setBeadedImage,
    setBeadPattern,
    setPalette,
    setPreprocessMode,
    setGridSize,
    resetPreprocess,
  }
})
