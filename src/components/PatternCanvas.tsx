import { defineComponent, ref, watch, onMounted, nextTick } from 'vue'
import { useAppStore } from '@/stores/app'

export default defineComponent({
  name: 'PatternCanvas',
  setup() {
    const store = useAppStore()
    const canvasRef = ref<HTMLCanvasElement>()
    const showGrid = ref(true)
    const showNumbers = ref(false)
    const canvasScale = ref(1)

    function drawPattern() {
      const canvas = canvasRef.value
      if (!canvas) return

      const ctx = canvas.getContext('2d')!
      const pattern = store.beadPattern
      const imageData = store.beadedImageData

      if (imageData) {
        canvas.width = imageData.width
        canvas.height = imageData.height
        ctx.putImageData(imageData, 0, 0)
      } else if (store.processedDataURL || store.sourceDataURL) {
        const img = new Image()
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
        }
        img.src = store.processedDataURL || store.sourceDataURL!
      } else {
        return
      }

      if (pattern && showGrid.value) {
        const cellW = canvas.width / pattern.gridWidth
        const cellH = canvas.height / pattern.gridHeight
        ctx.strokeStyle = 'rgba(0,0,0,0.15)'
        ctx.lineWidth = 0.5

        for (let x = 0; x <= pattern.gridWidth; x++) {
          ctx.beginPath()
          ctx.moveTo(x * cellW, 0)
          ctx.lineTo(x * cellW, canvas.height)
          ctx.stroke()
        }
        for (let y = 0; y <= pattern.gridHeight; y++) {
          ctx.beginPath()
          ctx.moveTo(0, y * cellH)
          ctx.lineTo(canvas.width, y * cellH)
          ctx.stroke()
        }
      }
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
        const cx = cell.x * bs
        const cy = cell.y * bs
        svg += `<rect x="${cx}" y="${cy}" width="${bs}" height="${bs}" fill="${cell.hex}" stroke="#ccc" stroke-width="0.5"/>\n`
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

      let csv = grid.map((row) => row.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = 'dotsmap-pattern.csv'
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
    }

    watch(
      () => [store.beadPattern, store.beadedDataURL, store.processedDataURL, showGrid.value],
      () => {
        nextTick(drawPattern)
      },
      { deep: true },
    )

    onMounted(() => {
      nextTick(drawPattern)
    })

    return () => (
      <div class="rounded-xl border border-border bg-surface/50 p-4 space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <h3 class="text-sm font-semibold">
            {store.beadPattern ? `拼豆图纸 (${store.beadPattern.gridWidth}×${store.beadPattern.gridHeight})` : '预览'}
          </h3>
          <div class="flex items-center gap-2 flex-wrap">
            {store.beadPattern && (
              <>
                <label class="flex items-center gap-1 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showGrid.value}
                    onChange={(e: Event) => (showGrid.value = (e.target as HTMLInputElement).checked)}
                  />
                  网格线
                </label>
                <div class="flex gap-1">
                  <button
                    class="px-2 py-1 text-xs rounded-lg bg-surface border border-border hover:bg-primary/10 transition-colors"
                    onClick={downloadPNG}
                  >
                    导出PNG
                  </button>
                  <button
                    class="px-2 py-1 text-xs rounded-lg bg-surface border border-border hover:bg-primary/10 transition-colors"
                    onClick={downloadGridSVG}
                  >
                    导出SVG
                  </button>
                  <button
                    class="px-2 py-1 text-xs rounded-lg bg-surface border border-border hover:bg-primary/10 transition-colors"
                    onClick={downloadCSV}
                  >
                    导出CSV
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div class="rounded-lg overflow-hidden bg-checkerboard border border-border min-h-32 flex items-center justify-center">
          {(store.beadedDataURL || store.processedDataURL || store.sourceDataURL) ? (
            <canvas
              ref={canvasRef}
              class="max-w-full h-auto"
              style={{ imageRendering: 'pixelated' }}
            />
          ) : (
            <p class="text-xs text-text-secondary p-8">上传图片并点击生成图纸</p>
          )}
        </div>
      </div>
    )
  },
})
