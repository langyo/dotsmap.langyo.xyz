import { defineComponent, ref, watch, nextTick } from 'vue'
import { useAppStore } from '@/stores/app'

export default defineComponent({
  name: 'PatternCanvas',
  setup() {
    const store = useAppStore()
    const canvasRef = ref<HTMLCanvasElement>()
    const showGrid = ref(true)

    function drawPattern() {
      const canvas = canvasRef.value
      if (!canvas) return

      const ctx = canvas.getContext('2d')!
      const imageData = store.beadedImageData
      const dataURL = store.beadedDataURL || store.processedDataURL || store.sourceDataURL

      if (imageData) {
        canvas.width = imageData.width
        canvas.height = imageData.height
        ctx.putImageData(imageData, 0, 0)

        if (showGrid.value && store.beadPattern) {
          drawGrid(ctx, canvas.width, canvas.height, store.beadPattern.gridWidth, store.beadPattern.gridHeight)
        }
      } else if (dataURL) {
        const img = new Image()
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
        }
        img.src = dataURL
      }
    }

    function drawGrid(
      ctx: CanvasRenderingContext2D,
      canvasW: number,
      canvasH: number,
      gridW: number,
      gridH: number,
    ) {
      const cellW = canvasW / gridW
      const cellH = canvasH / gridH
      ctx.strokeStyle = 'rgba(0,0,0,0.12)'
      ctx.lineWidth = 0.5

      ctx.beginPath()
      for (let x = 0; x <= gridW; x++) {
        ctx.moveTo(x * cellW, 0)
        ctx.lineTo(x * cellW, canvasH)
      }
      for (let y = 0; y <= gridH; y++) {
        ctx.moveTo(0, y * cellH)
        ctx.lineTo(canvasW, y * cellH)
      }
      ctx.stroke()

      ctx.strokeStyle = 'rgba(0,0,0,0.3)'
      ctx.lineWidth = 1
      const majorStep = 10
      ctx.beginPath()
      for (let x = 0; x <= gridW; x += majorStep) {
        ctx.moveTo(x * cellW, 0)
        ctx.lineTo(x * cellW, canvasH)
      }
      for (let y = 0; y <= gridH; y += majorStep) {
        ctx.moveTo(0, y * cellH)
        ctx.lineTo(canvasW, y * cellH)
      }
      ctx.stroke()
    }

    function downloadPNG() {
      const canvas = canvasRef.value
      if (!canvas) return
      const link = document.createElement('a')
      link.download = 'dotsmap-pattern.png'
      link.href = canvas.toDataURL()
      link.click()
    }

    function downloadGridSVG() {
      const pattern = store.beadPattern
      if (!pattern) return

      const bs = pattern.beadSize
      const w = pattern.gridWidth * bs
      const h = pattern.gridHeight * bs

      let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">\n`
      svg += `<rect width="${w}" height="${h}" fill="#f0f0f0"/>\n`

      for (const cell of pattern.cells) {
        svg += `<rect x="${cell.x * bs}" y="${cell.y * bs}" width="${bs}" height="${bs}" fill="${cell.hex}" stroke="#ccc" stroke-width="0.5"/>\n`
      }

      svg += '</svg>'

      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = 'dotsmap-grid.svg'
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
    }

    function downloadCSV() {
      const pattern = store.beadPattern
      if (!pattern) return

      const grid: string[][] = Array.from({ length: pattern.gridHeight }, () =>
        Array(pattern.gridWidth).fill(''),
      )
      for (const cell of pattern.cells) {
        grid[cell.y][cell.x] = cell.colorName
      }

      const csv = grid.map((row) => row.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = 'dotsmap-pattern.csv'
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
    }

    watch(
      () => [store.beadedDataURL, store.processedDataURL, store.sourceDataURL, showGrid.value, store.beadPattern],
      () => nextTick(drawPattern),
      { deep: true },
    )

    return () => (
      <div class="rounded-xl border border-border bg-surface/50 p-4 space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <h3 class="text-sm font-semibold">
            {store.beadPattern
              ? `图纸 ${store.beadPattern.gridWidth}×${store.beadPattern.gridHeight}`
              : '预览'}
          </h3>
          {store.beadPattern && (
            <div class="flex items-center gap-2 flex-wrap">
              <label class="flex items-center gap-1 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showGrid.value}
                  onChange={(e: Event) => (showGrid.value = (e.target as HTMLInputElement).checked)}
                />
                网格
              </label>
              <div class="flex gap-1">
                <button
                  class="px-2 py-1 text-xs rounded-lg bg-surface border border-border hover:bg-primary/10 transition-all duration-150 active:scale-95"
                  onClick={downloadPNG}
                >
                  PNG
                </button>
                <button
                  class="px-2 py-1 text-xs rounded-lg bg-surface border border-border hover:bg-primary/10 transition-all duration-150 active:scale-95"
                  onClick={downloadGridSVG}
                >
                  SVG
                </button>
                <button
                  class="px-2 py-1 text-xs rounded-lg bg-surface border border-border hover:bg-primary/10 transition-all duration-150 active:scale-95"
                  onClick={downloadCSV}
                >
                  CSV
                </button>
              </div>
            </div>
          )}
        </div>

        <div class="rounded-lg overflow-hidden bg-checkerboard border border-border min-h-48 flex items-center justify-center">
          {(store.beadedDataURL || store.processedDataURL || store.sourceDataURL) ? (
            <canvas
              ref={canvasRef}
              class="max-w-full h-auto block"
              style={{ imageRendering: store.beadedImageData ? 'pixelated' : 'auto' }}
            />
          ) : (
            <p class="text-xs text-text-secondary p-10 text-center">
              上传图片并生成图纸后在此预览
            </p>
          )}
        </div>
      </div>
    )
  },
})
