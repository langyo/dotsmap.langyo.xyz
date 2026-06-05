import { defineComponent, ref, watch, nextTick } from 'vue'
import { useAppStore } from '@/stores/app'
import { ZoomIn, ZoomOut, Maximize2, Grid3x3 } from 'lucide-vue-next'

const zoomLevels = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8]

export default defineComponent({
  name: 'PatternCanvas',
  setup() {
    const store = useAppStore()
    const canvasRef = ref<HTMLCanvasElement>()
    const showGrid = ref(true)
    const zoom = ref(1)
    const panX = ref(0)
    const panY = ref(0)
    const isPanning = ref(false)
    const lastMouse = ref({ x: 0, y: 0 })
    const hoverCell = ref<{ x: number; y: number; code: string; name: string } | null>(null)
    const patternVersion = ref(0)

    const cellIndex = ref<Map<string, { code: string; name: string; hex: string }>>(new Map())

    function buildCellIndex() {
      const map = new Map<string, { code: string; name: string; hex: string }>()
      const p = store.beadPattern
      if (!p) { cellIndex.value = map; return }
      for (const cell of p.cells) {
        map.set(`${cell.x},${cell.y}`, { code: cell.colorCode, name: cell.colorName, hex: cell.hex })
      }
      cellIndex.value = map
    }

    function cycleZoom(dir: number) {
      const idx = zoomLevels.indexOf(zoom.value)
      if (idx < 0) { zoom.value = 1; return }
      const next = idx + dir
      if (next >= 0 && next < zoomLevels.length) zoom.value = zoomLevels[next]
    }

    function resetView() {
      zoom.value = 1
      panX.value = 0
      panY.value = 0
    }

    function drawPattern() {
      const canvas = canvasRef.value
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const imageData = store.beadedImageData
      const dataURL = store.beadedDataURL || store.processedDataURL || store.sourceDataURL

      if (!imageData && !dataURL) return

      if (imageData) {
        const z = zoom.value
        const w = Math.round(imageData.width * z)
        const h = Math.round(imageData.height * z)
        canvas.width = w
        canvas.height = h

        ctx.imageSmoothingEnabled = z <= 2

        const src = document.createElement('canvas')
        src.width = imageData.width
        src.height = imageData.height
        src.getContext('2d')!.putImageData(imageData, 0, 0)
        ctx.drawImage(src, 0, 0, w, h)

        if (showGrid.value && store.beadPattern) {
          drawGrid(ctx, w, h, store.beadPattern.gridWidth, store.beadPattern.gridHeight)
        }
      } else if (dataURL) {
        const img = new Image()
        img.onload = () => {
          if (canvasRef.value !== canvas) return
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
        }
        img.src = dataURL
      }
    }

    function drawGrid(ctx: CanvasRenderingContext2D, cw: number, ch: number, gw: number, gh: number) {
      const cellW = cw / gw
      const cellH = ch / gh

      ctx.strokeStyle = 'rgba(128,128,128,0.15)'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      for (let x = 0; x <= gw; x++) { ctx.moveTo(x * cellW, 0); ctx.lineTo(x * cellW, ch) }
      for (let y = 0; y <= gh; y++) { ctx.moveTo(0, y * cellH); ctx.lineTo(cw, y * cellH) }
      ctx.stroke()

      ctx.strokeStyle = 'rgba(128,128,128,0.35)'
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let x = 0; x <= gw; x += 10) { ctx.moveTo(x * cellW, 0); ctx.lineTo(x * cellW, ch) }
      for (let y = 0; y <= gh; y += 10) { ctx.moveTo(0, y * cellH); ctx.lineTo(cw, y * cellH) }
      ctx.stroke()
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault()
      cycleZoom(e.deltaY < 0 ? 1 : -1)
    }

    function onMouseDown(e: MouseEvent) {
      if (e.button === 0 && (e.ctrlKey || e.metaKey)) {
        isPanning.value = true
        lastMouse.value = { x: e.clientX, y: e.clientY }
        e.preventDefault()
      }
    }

    function onMouseMove(e: MouseEvent) {
      if (isPanning.value) {
        panX.value += e.clientX - lastMouse.value.x
        panY.value += e.clientY - lastMouse.value.y
        lastMouse.value = { x: e.clientX, y: e.clientY }
      }

      if (store.beadPattern && zoom.value >= 2) {
        const canvas = canvasRef.value
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        const cx = e.clientX - rect.left
        const cy = e.clientY - rect.top
        const cellW = canvas.width / store.beadPattern.gridWidth
        const cellH = canvas.height / store.beadPattern.gridHeight
        const gx = Math.floor(cx / cellW)
        const gy = Math.floor(cy / cellH)
        const entry = cellIndex.value.get(`${gx},${gy}`)
        hoverCell.value = entry ? { x: gx, y: gy, code: entry.code, name: entry.name } : null
      } else {
        hoverCell.value = null
      }
    }

    function onMouseUp() {
      isPanning.value = false
    }

    function downloadPNG() {
      const canvas = canvasRef.value
      if (!canvas) return
      const dataURL = canvas.toDataURL()
      const link = document.createElement('a')
      link.download = 'dotsmap-pattern.png'
      link.href = dataURL
      link.click()
    }

    function downloadSVG() {
      const pattern = store.beadPattern
      if (!pattern) return
      const bs = pattern.beadSize
      const w = pattern.gridWidth * bs
      const h = pattern.gridHeight * bs
      const parts = ['<svg xmlns="http://www.w3.org/2000/svg" width="', String(w), '" height="', String(h), '" viewBox="0 0 ', String(w), ' ', String(h), '">\n']
      parts.push('<rect width="', String(w), '" height="', String(h), '" fill="#f0f0f0"/>\n')
      for (const cell of pattern.cells) {
        const hex = cell.hex
        parts.push(
          '<rect x="', String(cell.x * bs), '" y="', String(cell.y * bs),
          '" width="', String(bs), '" height="', String(bs),
          '" fill="', hex, '" stroke="#ccc" stroke-width="0.5"/>\n',
        )
      }
      parts.push('</svg>')
      const svg = parts.join('')
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = 'dotsmap-grid.svg'
      link.href = url
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 500)
    }

    function downloadCSV() {
      const pattern = store.beadPattern
      if (!pattern) return
      const grid: string[][] = Array.from({ length: pattern.gridHeight }, () => Array(pattern.gridWidth).fill(''))
      for (const cell of pattern.cells) {
        if (cell.y < grid.length && cell.x < grid[cell.y]!.length) {
          grid[cell.y][cell.x] = cell.colorName
        }
      }
      const blob = new Blob([grid.map((r) => r.join(',')).join('\n')], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = 'dotsmap-pattern.csv'
      link.href = url
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 500)
    }

    watch(
      () => [store.beadedDataURL, store.processedDataURL, store.sourceDataURL, showGrid.value, zoom.value],
      () => nextTick(drawPattern),
    )

    watch(() => store.beadPattern, (p) => {
      if (p) { buildCellIndex(); patternVersion.value++ }
    })

    return () => (
      <div class="panel">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <h3 class="panel-title">
            {store.beadPattern ? `图纸 ${store.beadPattern.gridWidth}×${store.beadPattern.gridHeight}` : '预览'}
          </h3>
          {store.beadPattern && (
            <div class="flex items-center gap-1.5 flex-wrap">
              <div class="flex items-center gap-0.5 bg-background rounded-lg border border-border px-1 py-0.5">
                <button class="btn-icon" onClick={() => cycleZoom(-1)} title="缩小" aria-label="缩小"><ZoomOut size={14} /></button>
                <span class="text-xs font-mono w-10 text-center select-none">{Math.round(zoom.value * 100)}%</span>
                <button class="btn-icon" onClick={() => cycleZoom(1)} title="放大" aria-label="放大"><ZoomIn size={14} /></button>
                <button class="btn-icon" onClick={resetView} title="重置视图" aria-label="重置视图"><Maximize2 size={14} /></button>
              </div>
              <label class="flex items-center gap-1 text-xs cursor-pointer select-none">
                <input type="checkbox" checked={showGrid.value} onChange={(e) => (showGrid.value = (e.target as HTMLInputElement).checked)} />
                <Grid3x3 size={14} />
              </label>
              <div class="flex gap-0.5">
                <button class="btn btn-sm" onClick={downloadPNG}>PNG</button>
                <button class="btn btn-sm" onClick={downloadSVG}>SVG</button>
                <button class="btn btn-sm" onClick={downloadCSV}>CSV</button>
              </div>
            </div>
          )}
        </div>

        <div class="canvas-container" onWheel={onWheel} onMousedown={onMouseDown} onMousemove={onMouseMove} onMouseup={onMouseUp} onMouseleave={onMouseUp}>
          <div style={{ transform: `translate(${panX.value}px, ${panY.value}px)` }}>
            {(store.beadedDataURL || store.processedDataURL || store.sourceDataURL) ? (
              <canvas ref={canvasRef} class="canvas-render" style={{ imageRendering: zoom.value > 2 ? 'pixelated' : 'auto' }} />
            ) : (
              <p class="text-xs text-text-secondary p-10 text-center">上传图片并生成图纸后在此预览</p>
            )}
          </div>
        </div>

        {hoverCell.value && (
          <div class="flex items-center gap-2 text-xs text-text-secondary mt-1">
            <div class="w-3 h-3 rounded-sm border border-black/10"
              style={{ backgroundColor: store.selectedPalette.find((c) => c.code === hoverCell.value!.code)?.hex ?? '#888' }} />
            <span class="font-mono">({hoverCell.value.x}, {hoverCell.value.y})</span>
            <span>{hoverCell.value.name}</span>
          </div>
        )}

        {store.error && (
          <div class="text-xs text-error bg-error/10 rounded-lg p-2">{store.error}</div>
        )}
      </div>
    )
  },
})
