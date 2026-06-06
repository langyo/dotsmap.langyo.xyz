import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BeadColor, BrandDef, PaletteSet } from '@/data/perlerColors'
import { allBrands, buildPalettes, getPaletteByCount } from '@/data/perlerColors'
import type { BeadPattern, PreprocessMode } from '@/types'

function getInitialState() {
  const brand = allBrands[0]
  const palettes = buildPalettes(brand)
  const mid = palettes[Math.min(2, palettes.length - 1)] ?? palettes[0]
  return { brand, palettes, mid }
}

export const useAppStore = defineStore('app', () => {
  const sourceImage = ref<HTMLImageElement | null>(null)
  const sourceDataURL = ref<string | null>(null)
  const processedImageData = ref<ImageData | null>(null)
  const processedDataURL = ref<string | null>(null)

  const initial = getInitialState()
  const currentBrand = ref<BrandDef>(initial.brand)
  const paletteOptions = ref<PaletteSet[]>(initial.palettes)
  const selectedPalette = ref<BeadColor[]>(initial.mid.colors)
  const selectedPaletteLabel = ref<string>(initial.mid.label)
  const selectedPaletteCount = ref<number>(initial.mid.count)

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
  const highlightCode = ref<string | null>(null)
  const error = ref<string | null>(null)
  const isRestoring = ref<boolean>(false)

  const brands = computed(() => allBrands)

  function setSourceImage(img: HTMLImageElement, dataURL: string) {
    sourceImage.value = img
    sourceDataURL.value = dataURL
    const w = Math.max(1, img.width)
    gridWidth.value = Math.min(50, w)
    gridHeight.value = Math.round(img.height * (gridWidth.value / w))
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

  function setBrand(brand: BrandDef) {
    currentBrand.value = brand
    paletteOptions.value = buildPalettes(brand)
    const opts = paletteOptions.value
    const idx = Math.max(0, Math.min(2, opts.length - 1))
    const mid = opts[idx]
    if (!mid) return
    selectedPalette.value = mid.colors
    selectedPaletteCount.value = mid.count
    selectedPaletteLabel.value = mid.label
    resetGeneratedState()
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
    const colors = getPaletteByCount(currentBrand.value, count)
    selectedPalette.value = colors
    selectedPaletteCount.value = count
    selectedPaletteLabel.value = count === currentBrand.value.colors.length ? '全部' : `${count}色`
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

  function setError(msg: string | null) {
    error.value = msg
  }

  function restoreFromPersisted(
    data: {
      sourceDataURL: string
      brandId: string
      paletteCount: number
      gridWidth: number
      gridHeight: number
      preprocessMode: string
      bgThreshold: number
      magicTolerance: number
      magicX: number
      magicY: number
    },
    img: HTMLImageElement,
  ) {
    const brand = allBrands.find(b => b.id === data.brandId) ?? allBrands[0]
    currentBrand.value = brand
    paletteOptions.value = buildPalettes(brand)
    const colors = getPaletteByCount(brand, data.paletteCount)
    selectedPalette.value = colors
    selectedPaletteCount.value = data.paletteCount
    selectedPaletteLabel.value = data.paletteCount === brand.colors.length ? '全部' : `${data.paletteCount}色`
    gridWidth.value = data.gridWidth
    gridHeight.value = data.gridHeight
    preprocessMode.value = data.preprocessMode as PreprocessMode
    bgThreshold.value = data.bgThreshold
    magicTolerance.value = data.magicTolerance
    magicX.value = data.magicX
    magicY.value = data.magicY
    sourceImage.value = img
    sourceDataURL.value = data.sourceDataURL
  }

  function resetAll() {
    sourceImage.value = null
    sourceDataURL.value = null
    const fresh = getInitialState()
    currentBrand.value = fresh.brand
    paletteOptions.value = fresh.palettes
    selectedPalette.value = fresh.mid.colors
    selectedPaletteLabel.value = fresh.mid.label
    selectedPaletteCount.value = fresh.mid.count
    beadedImageData.value = null
    beadedDataURL.value = null
    beadPattern.value = null
    gridWidth.value = 50
    gridHeight.value = 50
    preprocessMode.value = 'none'
    bgThreshold.value = 30
    magicTolerance.value = 32
    magicX.value = 0
    magicY.value = 0
    isProcessing.value = false
    colorUsage.value = {}
    error.value = null
  }

  return {
    sourceImage, sourceDataURL,
    processedImageData, processedDataURL,
    currentBrand, paletteOptions,
    selectedPalette, selectedPaletteLabel, selectedPaletteCount,
    beadedImageData, beadedDataURL, beadPattern,
    gridWidth, gridHeight, beadSize,
    preprocessMode, bgThreshold, magicTolerance, magicX, magicY,
    isProcessing, colorUsage, highlightCode, brands, error,
    isRestoring,
    setSourceImage, setBrand,
    setProcessedImage, setBeadedImage, setBeadPattern,
    setPalette, setPreprocessMode, setGridSize, resetPreprocess,
    setError, resetAll, restoreFromPersisted,
  }
})
