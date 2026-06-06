import { defineComponent, ref, watch, nextTick, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useImageProcessing } from '@/composables/useImageProcessing'
import { useI18n } from '@/i18n'
import type { BeadPattern } from '@/types'
import { ZoomIn, ZoomOut, Maximize2, Grid3x3, Hash, ImagePlus, X, Share2, Download, Maximize, FileText, Square, Circle, CircleDot, RotateCcw } from 'lucide-vue-next'
import { clearState } from '@/utils/persistence'

const ZOOM_LEVELS = [1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24, 32]
const SB_SIZE = 10
const MM_MAX = 160
type RenderMode = 'square' | 'solid-cyl' | 'hollow-cyl'

export default defineComponent({
  name: 'PatternCanvas',
  props: {
    fullHeight: { type: Boolean, default: false },
  },
  setup(props) {
    const store = useAppStore()
    const { handleFileUpload, resetAll: resetAllAction } = useImageProcessing()
    const { t, colorLabel } = useI18n()
    const canvasRef = ref<HTMLCanvasElement>()
    const vpRef = ref<HTMLDivElement>()
    const mmRef = ref<HTMLCanvasElement>()
    const showGrid = ref(true)
    const showCodes = ref(true)
    const renderMode = ref<RenderMode>('square')
    const zoom = ref(1)
    const panX = ref(0)
    const panY = ref(0)
    const isPanning = ref(false)
    const hoverCell = ref<{ x: number; y: number; code: string; name: string } | null>(null)
    const cellIndex = ref<Map<string, { code: string; name: string; hex: string }>>(new Map())
    const dragType = ref<'none' | 'pan' | 'hscroll' | 'vscroll' | 'minimap'>('none')
    const dragStart = ref({ mx: 0, my: 0, px: 0, py: 0 })
    const vpW = ref(0)
    const vpH = ref(0)
    const fileInput = ref<HTMLInputElement>()
    const isDragging = ref(false)
    const dragCounter = ref(0)
    const touchState = ref<{
      type: 'none' | 'pan' | 'pinch'
      startDist: number
      startZoom: number
      startMidX: number
      startMidY: number
      startPanX: number
      startPanY: number
    }>({ type: 'none', startDist: 0, startZoom: 1, startMidX: 0, startMidY: 0, startPanX: 0, startPanY: 0 })
    let resizeObs: ResizeObserver | null = null
    let mmBg: HTMLCanvasElement | null = null

    const hasContent = computed(() => !!(store.beadedDataURL || store.processedDataURL || store.sourceDataURL))
    const imgData = computed(() => store.beadedImageData)
    const natW = computed(() => imgData.value?.width ?? 0)
    const natH = computed(() => imgData.value?.height ?? 0)
    const vW = computed(() => Math.round(natW.value * zoom.value))
    const vH = computed(() => Math.round(natH.value * zoom.value))
    const overX = computed(() => vW.value > vpW.value)
    const overY = computed(() => vH.value > vpH.value)
    const hasOverflow = computed(() => overX.value || overY.value)

    const mmScale = computed(() => {
      if (natW.value === 0) return 1
      return Math.min(MM_MAX / natW.value, MM_MAX / natH.value, 1)
    })
    const mmW = computed(() => Math.round(natW.value * mmScale.value))
    const mmH = computed(() => Math.round(natH.value * mmScale.value))

    const hThumbLen = computed(() => {
      if (!overX.value) return 0
      const track = vpW.value - (overY.value ? SB_SIZE : 0)
      return Math.max(30, track * (vpW.value / vW.value))
    })
    const hThumbPos = computed(() => {
      if (!overX.value || vW.value === vpW.value) return 0
      const track = vpW.value - (overY.value ? SB_SIZE : 0)
      const maxOff = track - hThumbLen.value
      return (-panX.value / (vW.value - vpW.value)) * maxOff
    })

    const vThumbLen = computed(() => {
      if (!overY.value) return 0
      const track = vpH.value - (overX.value ? SB_SIZE : 0)
      return Math.max(30, track * (vpH.value / vH.value))
    })
    const vThumbPos = computed(() => {
      if (!overY.value || vH.value === vpH.value) return 0
      const track = vpH.value - (overX.value ? SB_SIZE : 0)
      const maxOff = track - vThumbLen.value
      return (-panY.value / (vH.value - vpH.value)) * maxOff
    })

    function updateVpSize() {
      if (vpRef.value) {
        vpW.value = vpRef.value.clientWidth
        vpH.value = vpRef.value.clientHeight
      }
    }

    function buildCellIndex() {
      const map = new Map<string, { code: string; name: string; hex: string }>()
      const p = store.beadPattern
      if (!p) { cellIndex.value = map; return }
      for (const c of p.cells) map.set(`${c.x},${c.y}`, { code: c.colorCode, name: c.colorName, hex: c.hex })
      cellIndex.value = map
    }

    function centerView() {
      panX.value = (vpW.value - vW.value) / 2
      panY.value = (vpH.value - vH.value) / 2
    }

    function snapToZoomLevel(target: number): number {
      let best = ZOOM_LEVELS[0]
      let bestDiff = Math.abs(target - best)
      for (const z of ZOOM_LEVELS) {
        const diff = Math.abs(target - z)
        if (diff < bestDiff) { bestDiff = diff; best = z }
      }
      return best
    }

    function fitToViewport() {
      const d = imgData.value
      if (!d) return
      const baseZoom = 12
      if (vpW.value > 0 && vpH.value > 0) {
        const fitW = vpW.value / d.width
        const fitH = vpH.value / d.height
        const raw = Math.max(baseZoom, Math.floor(Math.min(fitW, fitH)))
        zoom.value = snapToZoomLevel(raw)
      } else {
        zoom.value = baseZoom
      }
      centerView()
    }

    function clampPan() {
      if (vW.value <= vpW.value) {
        panX.value = Math.round((vpW.value - vW.value) / 2)
      } else {
        panX.value = Math.round(Math.max(-(vW.value - vpW.value), Math.min(0, panX.value)))
      }
      if (vH.value <= vpH.value) {
        panY.value = Math.round((vpH.value - vH.value) / 2)
      } else {
        panY.value = Math.round(Math.max(-(vH.value - vpH.value), Math.min(0, panY.value)))
      }
    }

    function doZoom(dir: number, cx?: number, cy?: number) {
      const idx = ZOOM_LEVELS.indexOf(zoom.value)
      if (idx < 0) { zoom.value = 1; return }
      const next = idx + dir
      if (next < 0 || next >= ZOOM_LEVELS.length) return
      const oldZ = zoom.value
      const refX = cx ?? vpW.value / 2
      const refY = cy ?? vpH.value / 2
      const imgX = (refX - panX.value) / oldZ
      const imgY = (refY - panY.value) / oldZ
      zoom.value = ZOOM_LEVELS[next]
      panX.value = refX - imgX * zoom.value
      panY.value = refY - imgY * zoom.value
      clampPan()
    }

    function resetView() {
      zoom.value = 1
      centerView()
    }

    const SUPER_SCALE = 2

    function drawPattern() {
      const canvas = canvasRef.value
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const d = imgData.value
      const url = store.beadedDataURL || store.processedDataURL || store.sourceDataURL
      if (!d && !url) return

      if (d) {
        const p = store.beadPattern
        const w = natW.value * zoom.value
        const h = natH.value * zoom.value
        const isCyl = renderMode.value !== 'square'
        const ss = SUPER_SCALE
        canvas.width = Math.round(w * ss)
        canvas.height = Math.round(h * ss)
        canvas.style.width = Math.round(w) + 'px'
        canvas.style.height = Math.round(h) + 'px'
        ctx.setTransform(ss, 0, 0, ss, 0, 0)

        if (isCyl && p) {
          drawCylinderPattern(ctx, w, h, p, store.highlightCode, renderMode.value === 'hollow-cyl')
        } else {
          let drawData = d
          if (store.highlightCode && p) {
            drawData = applyHighlight(d, p)
          }
          const gw = drawData.width
          const gh = drawData.height
          ctx.imageSmoothingEnabled = false
          const src = document.createElement('canvas')
          src.width = gw
          src.height = gh
          src.getContext('2d')!.putImageData(drawData, 0, 0)
          ctx.drawImage(src, 0, 0, w, h)
        }
        if (showGrid.value && p) {
          drawGrid(ctx, w, h, p.gridWidth, p.gridHeight)
        }
        if (showCodes.value && p && zoom.value >= 6) {
          drawCodes(ctx, w, h, p)
        }
        if (hoverCell.value && p) {
          drawCrosshair(ctx, w, h, p.gridWidth, p.gridHeight, hoverCell.value.x, hoverCell.value.y)
        }
      } else if (url) {
        const img = new Image()
        img.onload = () => {
          if (canvasRef.value !== canvas) return
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
          if (!imgData.value) {
            panX.value = Math.round((vpW.value - img.width) / 2)
            panY.value = Math.round((vpH.value - img.height) / 2)
          }
        }
        img.src = url
      }
    }

    function drawGrid(ctx: CanvasRenderingContext2D, cw: number, ch: number, gw: number, gh: number) {
      const cW = cw / gw
      const cH = ch / gh
      ctx.strokeStyle = 'rgba(128,128,128,0.08)'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      for (let x = 0; x <= gw; x++) { ctx.moveTo(Math.round(x * cW) + 0.5, 0); ctx.lineTo(Math.round(x * cW) + 0.5, ch) }
      for (let y = 0; y <= gh; y++) { ctx.moveTo(0, Math.round(y * cH) + 0.5); ctx.lineTo(cw, Math.round(y * cH) + 0.5) }
      ctx.stroke()
      ctx.strokeStyle = 'rgba(128,128,128,0.3)'
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let x = 0; x <= gw; x += 5) { ctx.moveTo(Math.round(x * cW) + 0.5, 0); ctx.lineTo(Math.round(x * cW) + 0.5, ch) }
      for (let y = 0; y <= gh; y += 5) { ctx.moveTo(0, Math.round(y * cH) + 0.5); ctx.lineTo(cw, Math.round(y * cH) + 0.5) }
      ctx.stroke()
    }

    function drawCrosshair(ctx: CanvasRenderingContext2D, cw: number, ch: number, gw: number, gh: number, gx: number, gy: number) {
      const cW = cw / gw
      const cH = ch / gh
      const cellLeft = gx * cW
      const cellTop = gy * cH
      const cellRight = (gx + 1) * cW
      const cellBottom = (gy + 1) * cH
      const cellCenterX = cellLeft + cW / 2
      const cellCenterY = cellTop + cH / 2
      const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim()
      const color = primaryColor ? `rgb(${primaryColor})` : '#d63384'
      ctx.save()
      ctx.strokeStyle = color
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(cellCenterX, 0)
      ctx.lineTo(cellCenterX, cellTop)
      ctx.moveTo(cellCenterX, cellBottom)
      ctx.lineTo(cellCenterX, ch)
      ctx.moveTo(0, cellCenterY)
      ctx.lineTo(cellLeft, cellCenterY)
      ctx.moveTo(cellRight, cellCenterY)
      ctx.lineTo(cw, cellCenterY)
      ctx.stroke()
      ctx.strokeRect(cellLeft + 0.75, cellTop + 0.75, cW - 1.5, cH - 1.5)
      ctx.restore()
    }
    function applyHighlight(d: ImageData, p: BeadPattern): ImageData {
      const out = new ImageData(new Uint8ClampedArray(d.data), d.width, d.height)
      const highlightSet = new Set<string>()
      for (const c of p.cells) {
        if (c.colorCode === store.highlightCode) highlightSet.add(`${c.x},${c.y}`)
      }
      for (let gy = 0; gy < p.gridHeight; gy++) {
        for (let gx = 0; gx < p.gridWidth; gx++) {
          if (highlightSet.has(`${gx},${gy}`)) continue
          const idx = (gy * d.width + gx) * 4
          out.data[idx] = 30
          out.data[idx + 1] = 30
          out.data[idx + 2] = 30
        }
      }
      return out
    }

    function drawCodes(ctx: CanvasRenderingContext2D, cw: number, ch: number, p: BeadPattern) {
      const gw = p.gridWidth
      const gh = p.gridHeight
      const cW = cw / gw
      const cH = ch / gh
      const fontSize = Math.min(cW * 0.4, cH * 0.55, 16)
      if (fontSize < 5) { return }
      ctx.font = `bold ${fontSize}px monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      for (const c of p.cells) {
        const lum = hexLuminance(c.hex)
        ctx.fillStyle = lum > 0.45 ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.9)'
        ctx.fillText(c.colorCode, (c.x + 0.5) * cW, (c.y + 0.5) * cH)
      }
    }

    function buildMinimapBg() {
      const d = imgData.value
      if (!d) { mmBg = null; return }
      const bg = document.createElement('canvas')
      bg.width = mmW.value
      bg.height = mmH.value
      const bgCtx = bg.getContext('2d')!
      const src = document.createElement('canvas')
      src.width = d.width
      src.height = d.height
      src.getContext('2d')!.putImageData(d, 0, 0)
      bgCtx.drawImage(src, 0, 0, mmW.value, mmH.value)
      mmBg = bg
    }

    function drawMinimap() {
      const c = mmRef.value
      if (!c || !hasOverflow.value || !imgData.value) return
      c.width = mmW.value
      c.height = mmH.value
      const ctx = c.getContext('2d')
      if (!ctx) return
      if (mmBg) ctx.drawImage(mmBg, 0, 0)
      const s = mmScale.value
      const rw = Math.min(mmW.value, Math.max(10, (vpW.value / zoom.value) * s))
      const rh = Math.min(mmH.value, Math.max(10, (vpH.value / zoom.value) * s))
      const rx = Math.min(Math.max(0, (-panX.value / zoom.value) * s), mmW.value - rw)
      const ry = Math.min(Math.max(0, (-panY.value / zoom.value) * s), mmH.value - rh)
      ctx.fillStyle = 'rgba(255,107,157,0.15)'
      ctx.fillRect(rx, ry, rw, rh)
      ctx.strokeStyle = 'rgba(255,107,157,0.85)'
      ctx.lineWidth = 2
      ctx.strokeRect(rx, ry, rw, rh)
    }

    function getMmRect() {
      return {
        left: vpW.value - mmW.value - (overY.value ? SB_SIZE + 6 : 6),
        top: vpH.value - mmH.value - (overX.value ? SB_SIZE + 6 : 6),
      }
    }

    async function onFileChange(e: Event) {
      const input = e.target as HTMLInputElement
      const file = input.files?.[0]
      if (!file) return
      await handleFileUpload(file)
      input.value = ''
    }

    async function onDrop(e: DragEvent) {
      e.preventDefault()
      dragCounter.value = 0
      isDragging.value = false
      const file = e.dataTransfer?.files?.[0]
      if (file) await handleFileUpload(file)
    }

    function onDragOver(e: DragEvent) { e.preventDefault() }
    function onDragEnter(e: DragEvent) { e.preventDefault(); dragCounter.value++; isDragging.value = true }
    function onDragLeave(e: DragEvent) {
      e.preventDefault()
      dragCounter.value--
      if (dragCounter.value <= 0) { dragCounter.value = 0; isDragging.value = false }
    }

    function onWheel(e: WheelEvent) {
      if (!imgData.value) return
      e.preventDefault()
      const rect = vpRef.value?.getBoundingClientRect()
      if (!rect) return
      doZoom(e.deltaY < 0 ? 1 : -1, e.clientX - rect.left, e.clientY - rect.top)
    }

    function onVpMouseDown(e: MouseEvent) {
      if (!vpRef.value) return
      const rect = vpRef.value.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      if (overY.value && mx >= vpW.value - SB_SIZE && my < vpH.value - (overX.value ? SB_SIZE : 0)) {
        startDrag('vscroll', mx, my)
        e.preventDefault()
        return
      }
      if (overX.value && my >= vpH.value - SB_SIZE && mx < vpW.value - (overY.value ? SB_SIZE : 0)) {
        startDrag('hscroll', mx, my)
        e.preventDefault()
        return
      }
      if (hasOverflow.value && imgData.value) {
        const mm = getMmRect()
        if (mx >= mm.left && mx <= mm.left + mmW.value && my >= mm.top && my <= mm.top + mmH.value) {
          startDrag('minimap', mx, my)
          navMinimap(mx, my)
          e.preventDefault()
          return
        }
      }
      if (e.button === 0 && imgData.value) {
        startDrag('pan', e.clientX, e.clientY)
        e.preventDefault()
      }
    }

    function startDrag(type: typeof dragType.value, mx: number, my: number) {
      dragType.value = type
      dragStart.value = { mx, my, px: panX.value, py: panY.value }
      if (type === 'pan') isPanning.value = true
      window.addEventListener('mousemove', onWinMove)
      window.addEventListener('mouseup', onWinUp)
    }

    function onWinMove(e: MouseEvent) {
      if (dragType.value === 'none') return

      if (dragType.value === 'pan') {
        panX.value = dragStart.value.px + (e.clientX - dragStart.value.mx)
        panY.value = dragStart.value.py + (e.clientY - dragStart.value.my)
        clampPan()
        drawMinimap()
      } else if (dragType.value === 'hscroll') {
        const rect = vpRef.value?.getBoundingClientRect()
        if (!rect) return
        const mx = e.clientX - rect.left
        const delta = mx - dragStart.value.mx
        const track = vpW.value - (overY.value ? SB_SIZE : 0)
        const maxOff = track - hThumbLen.value
        if (maxOff > 0) {
          panX.value = dragStart.value.px - delta * ((vW.value - vpW.value) / maxOff)
          clampPan()
          drawMinimap()
        }
      } else if (dragType.value === 'vscroll') {
        const rect = vpRef.value?.getBoundingClientRect()
        if (!rect) return
        const my = e.clientY - rect.top
        const delta = my - dragStart.value.my
        const track = vpH.value - (overX.value ? SB_SIZE : 0)
        const maxOff = track - vThumbLen.value
        if (maxOff > 0) {
          panY.value = dragStart.value.py - delta * ((vH.value - vpH.value) / maxOff)
          clampPan()
          drawMinimap()
        }
      } else if (dragType.value === 'minimap') {
        const rect = vpRef.value?.getBoundingClientRect()
        if (!rect) return
        navMinimap(e.clientX - rect.left, e.clientY - rect.top)
      }
    }

    function navMinimap(mx: number, my: number) {
      const mm = getMmRect()
      const s = mmScale.value
      const imgX = (mx - mm.left) / s
      const imgY = (my - mm.top) / s
      panX.value = Math.round(vpW.value / 2 - imgX * zoom.value)
      panY.value = Math.round(vpH.value / 2 - imgY * zoom.value)
      clampPan()
      drawMinimap()
    }

    function onWinUp() {
      dragType.value = 'none'
      isPanning.value = false
      window.removeEventListener('mousemove', onWinMove)
      window.removeEventListener('mouseup', onWinUp)
    }

    function onTouchStart(e: TouchEvent) {
      if (!vpRef.value) return
      if (!store.beadPattern) return
      e.preventDefault()

      if (e.touches.length === 1) {
        const t = e.touches[0]
        touchState.value = {
          type: 'pan',
          startDist: 0,
          startZoom: zoom.value,
          startMidX: t.clientX,
          startMidY: t.clientY,
          startPanX: panX.value,
          startPanY: panY.value,
        }
        isPanning.value = true
      } else if (e.touches.length === 2) {
        const t1 = e.touches[0]
        const t2 = e.touches[1]
        const dx = t2.clientX - t1.clientX
        const dy = t2.clientY - t1.clientY
        const dist = Math.sqrt(dx * dx + dy * dy)
        touchState.value = {
          type: 'pinch',
          startDist: dist,
          startZoom: zoom.value,
          startMidX: (t1.clientX + t2.clientX) / 2,
          startMidY: (t1.clientY + t2.clientY) / 2,
          startPanX: panX.value,
          startPanY: panY.value,
        }
      }
    }

    function onTouchMove(e: TouchEvent) {
      const ts = touchState.value
      if (ts.type === 'none') return
      e.preventDefault()
      const rect = vpRef.value?.getBoundingClientRect()
      if (!rect) return

      if (ts.type === 'pan' && e.touches.length === 2) {
        const t1 = e.touches[0]
        const t2 = e.touches[1]
        const dx = t2.clientX - t1.clientX
        const dy = t2.clientY - t1.clientY
        touchState.value = {
          type: 'pinch',
          startDist: Math.sqrt(dx * dx + dy * dy),
          startZoom: zoom.value,
          startMidX: (t1.clientX + t2.clientX) / 2,
          startMidY: (t1.clientY + t2.clientY) / 2,
          startPanX: panX.value,
          startPanY: panY.value,
        }
        return
      }

      if (ts.type === 'pan' && e.touches.length === 1) {
        const t = e.touches[0]
        panX.value = ts.startPanX + (t.clientX - ts.startMidX)
        panY.value = ts.startPanY + (t.clientY - ts.startMidY)
        clampPan()
        drawMinimap()
      } else if (ts.type === 'pinch' && e.touches.length === 2) {
        const t1 = e.touches[0]
        const t2 = e.touches[1]
        const dx = t2.clientX - t1.clientX
        const dy = t2.clientY - t1.clientY
        const dist = Math.sqrt(dx * dx + dy * dy)
        const midX = (t1.clientX + t2.clientX) / 2
        const midY = (t1.clientY + t2.clientY) / 2

        if (ts.startDist > 0) {
          const scale = dist / ts.startDist
          const targetZoom = Math.round(ts.startZoom * scale)
          let bestIdx = 0
          let bestDiff = Infinity
          for (let i = 0; i < ZOOM_LEVELS.length; i++) {
            const diff = Math.abs(ZOOM_LEVELS[i] - targetZoom)
            if (diff < bestDiff) { bestDiff = diff; bestIdx = i }
          }
          const newZoom = ZOOM_LEVELS[bestIdx]

          const svx = ts.startMidX - rect.left
          const svy = ts.startMidY - rect.top
          const imgX = (svx - ts.startPanX) / ts.startZoom
          const imgY = (svy - ts.startPanY) / ts.startZoom

          const nvx = midX - rect.left
          const nvy = midY - rect.top

          zoom.value = newZoom
          panX.value = nvx - imgX * newZoom
          panY.value = nvy - imgY * newZoom
          clampPan()
          drawMinimap()
        }
      }
    }

    function onTouchEnd(e: TouchEvent) {
      if (touchState.value.type === 'none') return
      e.preventDefault()
      if (e.touches.length === 0) {
        touchState.value = { type: 'none', startDist: 0, startZoom: 1, startMidX: 0, startMidY: 0, startPanX: 0, startPanY: 0 }
        isPanning.value = false
      } else if (e.touches.length === 1 && touchState.value.type === 'pinch') {
        const t = e.touches[0]
        touchState.value = {
          type: 'pan',
          startDist: 0,
          startZoom: zoom.value,
          startMidX: t.clientX,
          startMidY: t.clientY,
          startPanX: panX.value,
          startPanY: panY.value,
        }
        isPanning.value = true
      }
    }

    function updateHover(e: MouseEvent) {
      if (!store.beadPattern || zoom.value < 2 || !vpRef.value || !canvasRef.value) {
        hoverCell.value = null
        return
      }
      const rect = vpRef.value.getBoundingClientRect()
      const cx = e.clientX - rect.left - panX.value
      const cy = e.clientY - rect.top - panY.value
      const cW = vW.value / store.beadPattern.gridWidth
      const cH = vH.value / store.beadPattern.gridHeight
      const gx = Math.floor(cx / cW)
      const gy = Math.floor(cy / cH)
      if (gx < 0 || gy < 0 || gx >= store.beadPattern.gridWidth || gy >= store.beadPattern.gridHeight) {
        hoverCell.value = null
        return
      }
      const entry = cellIndex.value.get(`${gx},${gy}`)
      hoverCell.value = entry ? { x: gx, y: gy, code: entry.code, name: entry.name } : null
    }

    const showExportModal = ref(false)

    function hexLuminance(hex: string): number {
      const r = parseInt(hex.slice(1, 3), 16) / 255
      const g = parseInt(hex.slice(3, 5), 16) / 255
      const b = parseInt(hex.slice(5, 7), 16) / 255
      return 0.299 * r + 0.587 * g + 0.114 * b
    }

    function hexToRgb(hex: string) {
      return {
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16),
      }
    }

    function darkenRgb(r: number, g: number, b: number, factor: number) {
      return {
        r: Math.round(r * factor),
        g: Math.round(g * factor),
        b: Math.round(b * factor),
      }
    }

    function drawCylinderBead(
      ctx: CanvasRenderingContext2D,
      cx: number, cy: number,
      radius: number,
      hex: string,
      hollow: boolean,
    ) {
      const { r, g, b } = hexToRgb(hex)
      const dark = darkenRgb(r, g, b, 0.45)
      const mid = darkenRgb(r, g, b, 0.7)

      ctx.save()

      ctx.beginPath()
      ctx.arc(cx + radius * 0.04, cy + radius * 0.05, radius * 1.01, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0,0,0,0.1)'
      ctx.fill()

      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgb(${dark.r},${dark.g},${dark.b})`
      ctx.fill()

      const faceR = radius * 0.9
      ctx.beginPath()
      ctx.arc(cx, cy, faceR, 0, Math.PI * 2)
      const grad = ctx.createRadialGradient(
        cx - faceR * 0.18, cy - faceR * 0.18, 0,
        cx, cy, faceR,
      )
      grad.addColorStop(0, `rgb(${Math.min(255, r + 60)},${Math.min(255, g + 60)},${Math.min(255, b + 60)})`)
      grad.addColorStop(0.4, `rgb(${Math.min(255, r + 15)},${Math.min(255, g + 15)},${Math.min(255, b + 15)})`)
      grad.addColorStop(0.75, `rgb(${r},${g},${b})`)
      grad.addColorStop(1, `rgb(${mid.r},${mid.g},${mid.b})`)
      ctx.fillStyle = grad
      ctx.fill()

      if (hollow) {
        const holeR = radius * 0.22
        ctx.beginPath()
        ctx.arc(cx, cy, holeR, 0, Math.PI * 2)
        const holeGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, holeR)
        holeGrad.addColorStop(0, `rgb(${Math.round(dark.r * 0.2)},${Math.round(dark.g * 0.2)},${Math.round(dark.b * 0.2)})`)
        holeGrad.addColorStop(0.7, `rgb(${Math.round(dark.r * 0.35)},${Math.round(dark.g * 0.35)},${Math.round(dark.b * 0.35)})`)
        holeGrad.addColorStop(1, `rgb(${Math.round(dark.r * 0.5)},${Math.round(dark.g * 0.5)},${Math.round(dark.b * 0.5)})`)
        ctx.fillStyle = holeGrad
        ctx.fill()
      }

      ctx.beginPath()
      ctx.arc(cx, cy, faceR * 0.5, -Math.PI * 0.78, -Math.PI * 0.22)
      ctx.strokeStyle = `rgba(255,255,255,${hollow ? 0.14 : 0.16})`
      ctx.lineWidth = Math.max(0.5, radius * 0.045)
      ctx.lineCap = 'round'
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(${dark.r},${dark.g},${dark.b},0.2)`
      ctx.lineWidth = Math.max(0.3, radius * 0.02)
      ctx.stroke()

      ctx.restore()
    }

    function drawCylinderPattern(
      ctx: CanvasRenderingContext2D,
      cw: number, ch: number,
      p: BeadPattern,
      highlightCode: string | null,
      hollow: boolean,
    ) {
      const cW = cw / p.gridWidth
      const cH = ch / p.gridHeight
      const radius = Math.min(cW, cH) * 0.44
      if (radius < 1) return

      const highlightSet = new Set<string>()
      if (highlightCode) {
        for (const c of p.cells) {
          if (c.colorCode === highlightCode) highlightSet.add(`${c.x},${c.y}`)
        }
      }

      ctx.fillStyle = '#f0f0f0'
      ctx.fillRect(0, 0, cw, ch)

      for (const c of p.cells) {
        const bx = (c.x + 0.5) * cW
        const by = (c.y + 0.5) * cH
        if (highlightCode && !highlightSet.has(`${c.x},${c.y}`)) {
          drawCylinderBead(ctx, bx, by, radius, '#1e1e1e', hollow)
        } else {
          drawCylinderBead(ctx, bx, by, radius, c.hex, hollow)
        }
      }
    }

    async function generateQRCanvas(size: number): Promise<HTMLCanvasElement> {
      const QRCode = (await import('qrcode')).default
      const canvas = document.createElement('canvas')
      await QRCode.toCanvas(canvas, 'https://dotsmap.langyo.xyz', {
        width: size,
        margin: 1,
        color: { dark: '#333333', light: '#ffffff' },
      })
      return canvas
    }

    function drawExportGrid(ctx: CanvasRenderingContext2D, w: number, h: number, gw: number, gh: number) {
      const cW = w / gw
      const cH = h / gh
      ctx.strokeStyle = 'rgba(128,128,128,0.12)'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      for (let x = 0; x <= gw; x++) { ctx.moveTo(x * cW, 0); ctx.lineTo(x * cW, h) }
      for (let y = 0; y <= gh; y++) { ctx.moveTo(0, y * cH); ctx.lineTo(w, y * cH) }
      ctx.stroke()
      ctx.strokeStyle = 'rgba(128,128,128,0.4)'
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let x = 0; x <= gw; x += 5) { ctx.moveTo(x * cW, 0); ctx.lineTo(x * cW, h) }
      for (let y = 0; y <= gh; y += 5) { ctx.moveTo(0, y * cH); ctx.lineTo(w, y * cH) }
      ctx.stroke()
    }

    function drawExportCodes(ctx: CanvasRenderingContext2D, gw: number, gh: number, cellSize: number, cells: BeadPattern['cells']) {
      const fontSize = cellSize * 0.3
      if (fontSize < 6) return
      ctx.font = `bold ${fontSize}px monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (const c of cells) {
        const lum = hexLuminance(c.hex)
        ctx.fillStyle = lum > 0.45 ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.9)'
        ctx.fillText(c.colorCode, (c.x + 0.5) * cellSize, (c.y + 0.5) * cellSize)
      }
    }

    async function drawFooter(
      ctx: CanvasRenderingContext2D,
      fx: number, fy: number, fw: number, fh: number,
      p: BeadPattern,
      sorted: ReturnType<typeof getUsedColors>['sorted'],
    ) {
      ctx.fillStyle = '#f8f8f5'
      ctx.fillRect(fx, fy, fw, fh)

      ctx.fillStyle = '#d63384'
      ctx.fillRect(fx, fy, fw, 3)

      const titleSize = Math.round(fh * 0.14)
      const subSize = Math.round(fh * 0.08)
      const qrSize = Math.round(fh * 0.55)
      const qrX = fx + fw - qrSize - 18
      const qrTopY = fy + Math.round((fh - qrSize) * 0.3)

      ctx.textBaseline = 'top'
      ctx.textAlign = 'left'
      const col1X = fx + 18
      const line1Y = qrTopY

      ctx.font = `${subSize}px sans-serif`
      ctx.fillStyle = '#555'
      ctx.fillText(t.value.footerBy, col1X, line1Y)

      ctx.font = `bold ${titleSize}px sans-serif`
      const line2Y = line1Y + subSize + Math.round(fh * 0.02)
      ctx.fillStyle = '#d63384'
      ctx.fillText(t.value.footerApp, col1X, line2Y)
      const dmW = ctx.measureText(t.value.footerApp).width
      ctx.fillStyle = '#333'
      ctx.fillText(` ${t.value.footerCreation}`, col1X + dmW, line2Y)

      ctx.font = `${subSize}px sans-serif`
      ctx.fillStyle = '#888'
      ctx.fillText(
        `${store.currentBrand.name} · ${store.selectedPaletteLabel} · ${p.gridWidth}×${p.gridHeight} · ${t.value.footerUsedColors} ${sorted.length} ${t.value.colorUnit}`,
        col1X,
        line2Y + titleSize + Math.round(fh * 0.03),
      )
      ctx.textBaseline = 'middle'

      ctx.font = `${subSize}px sans-serif`
      const w1 = ctx.measureText(t.value.footerBy).width
      const w3 = ctx.measureText(`${store.currentBrand.name} · ${store.selectedPaletteLabel} · ${p.gridWidth}×${p.gridHeight} · ${t.value.footerUsedColors} ${sorted.length} ${t.value.colorUnit}`).width
      ctx.font = `bold ${titleSize}px sans-serif`
      const w2 = ctx.measureText(`${t.value.footerApp} ${t.value.footerCreation}`).width
      const titleW = Math.max(w1, w2, w3)

      try {
        const qrCanvas = await generateQRCanvas(qrSize)
        ctx.drawImage(qrCanvas, qrX, qrTopY)

        ctx.fillStyle = '#999'
        const urlSize = Math.round(fh * 0.065)
        ctx.font = `${urlSize}px sans-serif`
        ctx.textAlign = 'center'
        ctx.fillText('dotsmap.langyo.xyz', qrX + qrSize / 2, qrTopY + qrSize + urlSize + 6)
      } catch {
        ctx.fillStyle = '#999'
        ctx.font = `${subSize}px sans-serif`
        ctx.textAlign = 'right'
        ctx.fillText('dotsmap.langyo.xyz', fx + fw - 18, fy + fh * 0.5)
      }

      ctx.textAlign = 'left'

      if (sorted.length > 0) {
        const dotAreaLeft = fx + 18 + titleW + 48
        const dotAreaW = (qrX - 48) - dotAreaLeft
        if (dotAreaW > 20) {
          const colsFor2 = Math.max(1, Math.floor(dotAreaW / (Math.round(fh * 0.28) * 1.15)))
          const maxRows = sorted.length <= colsFor2 * 2 ? 2 : 3
          const dotSize = Math.round(fh * (maxRows === 2 ? 0.28 : 0.2))
          const gap = Math.round(dotSize * 0.15)
          const step = dotSize + gap
          const fontSize = Math.round(dotSize * 0.3)
          const colsPerRow = Math.max(1, Math.floor(dotAreaW / step))
          const dotStartX = dotAreaLeft + Math.round((dotAreaW - Math.min(sorted.length, colsPerRow) * step + gap) / 2)
          const dotStartY = qrTopY

          for (let i = 0; i < sorted.length; i++) {
            const col = i % colsPerRow
            const row = Math.floor(i / colsPerRow)
            if (row >= maxRows) break
            const cx = dotStartX + col * step + dotSize / 2
            const cy = dotStartY + row * step + dotSize / 2

            ctx.beginPath()
            ctx.arc(cx, cy, dotSize / 2, 0, Math.PI * 2)
            ctx.fillStyle = sorted[i].hex
            ctx.fill()
            ctx.strokeStyle = 'rgba(0,0,0,0.12)'
            ctx.lineWidth = Math.max(1, dotSize * 0.04)
            ctx.stroke()

            const lr = parseInt(sorted[i].hex.slice(1, 3), 16) / 255
            const lg = parseInt(sorted[i].hex.slice(3, 5), 16) / 255
            const lb = parseInt(sorted[i].hex.slice(5, 7), 16) / 255
            const lum = 0.299 * lr + 0.587 * lg + 0.114 * lb
            ctx.fillStyle = lum > 0.45 ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.9)'
            ctx.font = `bold ${fontSize}px monospace`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(sorted[i].code, cx, cy)
          }
          ctx.textAlign = 'left'
        }
      }
    }

    function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
      return new Promise((resolve, reject) => {
        canvas.toBlob(
          blob => blob ? resolve(blob) : reject(new Error('Failed to create blob')),
          'image/png',
        )
      })
    }

    function downloadBlob(blob: Blob, filename: string) {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.download = filename
      a.href = url
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 500)
    }

    function getUsedColors(p: BeadPattern) {
      const usage: Record<string, number> = {}
      for (const c of p.cells) usage[c.colorCode] = (usage[c.colorCode] ?? 0) + 1
      const usedCodes = new Set(Object.keys(usage))
      const usedColors = store.selectedPalette.filter(c => usedCodes.has(c.code))
      const sorted = [...usedColors].sort((a, b) => (usage[b.code] ?? 0) - (usage[a.code] ?? 0))
      return { usage, usedCodes, sorted }
    }

    async function downloadHighRes() {
      showExportModal.value = false
      const d = imgData.value
      const p = store.beadPattern
      if (!d || !p) return

      const maxDim = 16000
      const pad = 48
      const footerH = 180
      const cellSize = Math.min(256, Math.floor((maxDim - pad * 2 - footerH) / Math.max(p.gridWidth, p.gridHeight)))

      const patternW = p.gridWidth * cellSize
      const patternH = p.gridHeight * cellSize
      const { sorted } = getUsedColors(p)

      const totalW = pad + patternW + pad
      const totalH = pad + patternH + pad + footerH

      const canvas = document.createElement('canvas')
      canvas.width = totalW
      canvas.height = totalH
      const ctx = canvas.getContext('2d')!

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, totalW, totalH)

      ctx.save()
      ctx.translate(pad, pad)
      if (renderMode.value !== 'square') {
        drawCylinderPattern(ctx, patternW, patternH, p, null, renderMode.value === 'hollow-cyl')
      } else {
        ctx.imageSmoothingEnabled = false
        const src = document.createElement('canvas')
        src.width = d.width
        src.height = d.height
        src.getContext('2d')!.putImageData(d, 0, 0)
        ctx.drawImage(src, 0, 0, patternW, patternH)
      }
      if (showGrid.value) drawExportGrid(ctx, patternW, patternH, p.gridWidth, p.gridHeight)
      if (showCodes.value) drawExportCodes(ctx, p.gridWidth, p.gridHeight, cellSize, p.cells)
      ctx.restore()

      await drawFooter(ctx, 0, pad + patternH + pad, totalW, footerH, p, sorted)

      const blob = await canvasToBlob(canvas)
      downloadBlob(blob, 'dotsmap-hd.png')
    }

    async function downloadShareImage() {
      showExportModal.value = false
      const d = imgData.value
      const p = store.beadPattern
      if (!d || !p) return

      const pad = 64
      const footerH = 300
      const maxShareDim = 16000
      const scale = Math.min(
        Math.max(6, Math.ceil(2400 / d.width)),
        Math.floor((maxShareDim - pad * 2 - footerH) / Math.max(d.width, d.height)),
      )
      const patternW = d.width * scale
      const patternH = d.height * scale

      const { sorted } = getUsedColors(p)

      const totalW = pad + patternW + pad
      const totalH = pad + patternH + pad + footerH

      const canvas = document.createElement('canvas')
      canvas.width = totalW
      canvas.height = totalH
      const ctx = canvas.getContext('2d')!

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, totalW, totalH)

      ctx.save()
      ctx.translate(pad, pad)
      if (renderMode.value !== 'square') {
        drawCylinderPattern(ctx, patternW, patternH, p, null, renderMode.value === 'hollow-cyl')
      } else {
        ctx.imageSmoothingEnabled = false
        const src = document.createElement('canvas')
        src.width = d.width
        src.height = d.height
        src.getContext('2d')!.putImageData(d, 0, 0)
        ctx.drawImage(src, 0, 0, patternW, patternH)
      }

      if (showGrid.value) drawExportGrid(ctx, patternW, patternH, p.gridWidth, p.gridHeight)
      if (showCodes.value) drawExportCodes(ctx, p.gridWidth, p.gridHeight, patternW / p.gridWidth, p.cells)
      ctx.restore()

      await drawFooter(ctx, 0, pad + patternH + pad, totalW, footerH, p, sorted)

      const blob = await canvasToBlob(canvas)
      downloadBlob(blob, 'dotsmap-share.png')
    }

    async function downloadDataFiles() {
      showExportModal.value = false
      downloadSVG()
      setTimeout(() => downloadCSV(), 300)
    }

    async function handleShare() {
      const d = imgData.value
      const p = store.beadPattern
      if (!d || !p) return

      const pad = 64
      const footerH = 300
      const maxShareDim = 16000
      const scale = Math.min(
        Math.max(6, Math.ceil(2400 / d.width)),
        Math.floor((maxShareDim - pad * 2 - footerH) / Math.max(d.width, d.height)),
      )
      const patternW = d.width * scale
      const patternH = d.height * scale

      const { sorted } = getUsedColors(p)

      const totalW = pad + patternW + pad
      const totalH = pad + patternH + pad + footerH

      const canvas = document.createElement('canvas')
      canvas.width = totalW
      canvas.height = totalH
      const ctx = canvas.getContext('2d')!

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, totalW, totalH)

      ctx.save()
      ctx.translate(pad, pad)
      if (renderMode.value !== 'square') {
        drawCylinderPattern(ctx, patternW, patternH, p, null, renderMode.value === 'hollow-cyl')
      } else {
        ctx.imageSmoothingEnabled = false
        const src = document.createElement('canvas')
        src.width = d.width
        src.height = d.height
        src.getContext('2d')!.putImageData(d, 0, 0)
        ctx.drawImage(src, 0, 0, patternW, patternH)
      }

      if (showGrid.value) drawExportGrid(ctx, patternW, patternH, p.gridWidth, p.gridHeight)
      if (showCodes.value) drawExportCodes(ctx, p.gridWidth, p.gridHeight, patternW / p.gridWidth, p.cells)
      ctx.restore()

      await drawFooter(ctx, 0, pad + patternH + pad, totalW, footerH, p, sorted)

      const blob = await canvasToBlob(canvas)
      const file = new File([blob], 'dotsmap-share.png', { type: 'image/png' })

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            title: t.value.shareTitle,
            text: t.value.shareText,
            files: [file],
          })
          return
        } catch {
          // share cancelled or failed, fall back to download
        }
      }

      downloadBlob(blob, 'dotsmap-share.png')
    }

    function handleClearReset() {
      if (!confirm(t.value.clearConfirm)) return
      resetAllAction()
      clearState()
    }

    function downloadSVG() {
      const p = store.beadPattern
      if (!p) return
      const bs = p.beadSize
      const w = p.gridWidth * bs, h = p.gridHeight * bs
      const parts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">\n`]
      parts.push(`<rect width="${w}" height="${h}" fill="#f0f0f0"/>\n`)
      for (const c of p.cells) {
        parts.push(`<rect x="${c.x * bs}" y="${c.y * bs}" width="${bs}" height="${bs}" fill="${c.hex}" stroke="#ccc" stroke-width="0.5"/>\n`)
      }
      parts.push('</svg>')
      const blob = new Blob([parts.join('')], { type: 'image/svg+xml' })
      downloadBlob(blob, 'dotsmap-grid.svg')
    }

    function downloadCSV() {
      const p = store.beadPattern
      if (!p) return
      const grid: string[][] = Array.from({ length: p.gridHeight }, () => Array(p.gridWidth).fill(''))
      for (const c of p.cells) {
        if (c.y < grid.length && c.x < (grid[c.y]?.length ?? 0)) grid[c.y][c.x] = `${c.colorCode} ${c.colorName}`
      }
      const csvEscape = (v: string) => `"${v.replace(/"/g, '""')}"`
      const blob = new Blob([grid.map(r => r.map(csvEscape).join(',')).join('\n')], { type: 'text/csv' })
      downloadBlob(blob, 'dotsmap-pattern.csv')
    }

    watch(
      () => [store.beadedDataURL, store.processedDataURL, store.sourceDataURL, store.highlightCode, showGrid.value, showCodes.value, renderMode.value, zoom.value] as const,
      () => nextTick(() => {
        drawPattern()
        buildMinimapBg()
        drawMinimap()
      }),
    )

    watch(hoverCell, () => {
      nextTick(() => drawPattern())
    })

    watch(() => store.beadPattern, (p) => {
      if (p) buildCellIndex()
    })

    watch(imgData, () => {
      nextTick(() => {
        fitToViewport()
        buildMinimapBg()
        drawMinimap()
      })
    })

    onMounted(() => {
      if (vpRef.value) {
        resizeObs = new ResizeObserver(() => {
          updateVpSize()
          clampPan()
          drawMinimap()
        })
        resizeObs.observe(vpRef.value)
        updateVpSize()
      }
      nextTick(() => {
        fitToViewport()
        drawPattern()
        buildMinimapBg()
        drawMinimap()
      })
    })

    onUnmounted(() => {
      resizeObs?.disconnect()
      window.removeEventListener('mousemove', onWinMove)
      window.removeEventListener('mouseup', onWinUp)
    })

    const vpCursor = computed(() => {
      if (!hasContent.value) return 'pointer'
      if (isPanning.value) return 'grabbing'
      if (dragType.value !== 'none') return 'default'
      if (imgData.value) return 'grab'
      return 'default'
    })

    return () => {
      const shouldFill = props.fullHeight && hasContent.value
      return (
      <>
        <div class={`panel ${shouldFill ? 'h-full' : ''}`}>
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h3 class="panel-title">
              {store.beadPattern ? `${t.value.patternLabel} ${store.beadPattern.gridWidth}×${store.beadPattern.gridHeight}` : t.value.preview}
            </h3>
            {store.beadPattern ? (
              <div class="flex items-center gap-1.5 flex-wrap">
                <div class="flex items-center gap-0.5 bg-background rounded-2xl border border-border px-1 py-0.5">
                  <button class="btn-icon" onClick={() => doZoom(-1)} title={t.value.zoomOut} aria-label={t.value.zoomOut}><ZoomOut size={14} /></button>
                  <span class="text-xs font-mono w-10 text-center select-none">{Math.round(zoom.value / 12 * 100)}%</span>
                  <button class="btn-icon" onClick={() => doZoom(1)} title={t.value.zoomIn} aria-label={t.value.zoomIn}><ZoomIn size={14} /></button>
                  <button class="btn-icon" onClick={resetView} title={t.value.zoomReset} aria-label={t.value.zoomReset}><Maximize2 size={14} /></button>
                </div>
                <div class="flex items-center gap-1.5 text-xs select-none">
                  <Grid3x3 size={14} />
                  <button
                    class={`switch ${showGrid.value ? 'active' : ''}`}
                    role="switch"
                    aria-checked={showGrid.value}
                    aria-label={t.value.grid}
                    onClick={() => showGrid.value = !showGrid.value}
                  />
                </div>
                <div class="flex items-center gap-1.5 text-xs select-none">
                  <Hash size={14} />
                  <button
                    class={`switch ${showCodes.value ? 'active' : ''}`}
                    role="switch"
                    aria-checked={showCodes.value}
                    aria-label={t.value.colorCode}
                    onClick={() => showCodes.value = !showCodes.value}
                  />
                </div>
                <div class="seg-group" role="radiogroup" aria-label="Render mode">
                  <button
                    class={`seg-btn ${renderMode.value === 'square' ? 'active' : ''}`}
                    role="radio"
                    aria-checked={renderMode.value === 'square'}
                    title={t.value.modeSquare}
                    onClick={() => renderMode.value = 'square'}
                  ><Square size={13} /></button>
                  <button
                    class={`seg-btn ${renderMode.value === 'solid-cyl' ? 'active' : ''}`}
                    role="radio"
                    aria-checked={renderMode.value === 'solid-cyl'}
                    title={t.value.modeSolidCyl}
                    onClick={() => renderMode.value = 'solid-cyl'}
                  ><Circle size={13} /></button>
                  <button
                    class={`seg-btn ${renderMode.value === 'hollow-cyl' ? 'active' : ''}`}
                    role="radio"
                    aria-checked={renderMode.value === 'hollow-cyl'}
                    title={t.value.modeHollowCyl}
                    onClick={() => renderMode.value = 'hollow-cyl'}
                  ><CircleDot size={13} /></button>
                </div>
                <div class="flex gap-0.5">
                  <button class="btn btn-sm" onClick={handleShare}><Share2 size={12} /> {t.value.share}</button>
                  <button class="btn btn-sm" onClick={() => showExportModal.value = true}><Download size={12} /> {t.value.export}</button>
                  <button class="btn btn-sm" onClick={handleClearReset}><RotateCcw size={12} /> {t.value.clear}</button>
                </div>
              </div>
            ) : hasContent.value ? (
              <div class="flex gap-1">
                <button class="btn btn-sm" onClick={() => fileInput.value?.click()}>{t.value.changeImage}</button>
                <button class="btn btn-sm btn-danger" onClick={handleClearReset}><X size={12} /> {t.value.clear}</button>
              </div>
            ) : null}
          </div>

          <div
            ref={vpRef}
            class={`canvas-container ${shouldFill ? 'canvas-fill' : ''}`}
            style={{ cursor: vpCursor.value }}
            onWheel={onWheel}
            onMousedown={onVpMouseDown}
            onMousemove={updateHover}
            onTouchstart={onTouchStart}
            onTouchmove={onTouchMove}
            onTouchend={onTouchEnd}
            onTouchcancel={onTouchEnd}
          >
          {hasContent.value ? (
            <>
              <div
                class="canvas-transform-layer"
                style={{
                  transform: `translate(${panX.value}px, ${panY.value}px)`,
                  willChange: 'transform',
                }}
              >
                <canvas ref={canvasRef} style={{ imageRendering: (renderMode.value === 'square' && zoom.value > 2) ? 'pixelated' : 'auto', display: 'block' }} />
              </div>

              {overX.value && (
                <div class="sb-track sb-h" style={{ width: `calc(100% - ${overY.value ? SB_SIZE : 0}px)` }}>
                  <div class="sb-thumb" style={{ left: hThumbPos.value + 'px', width: hThumbLen.value + 'px' }} />
                </div>
              )}
              {overY.value && (
                <div class="sb-track sb-v" style={{ height: `calc(100% - ${overX.value ? SB_SIZE : 0}px)` }}>
                  <div class="sb-thumb" style={{ top: vThumbPos.value + 'px', height: vThumbLen.value + 'px' }} />
                </div>
              )}

              {hasOverflow.value && imgData.value && (
                <div class="minimap-box" style={{
                  right: (overY.value ? SB_SIZE + 6 : 6) + 'px',
                  bottom: (overX.value ? SB_SIZE + 6 : 6) + 'px',
                }}>
                  <canvas ref={mmRef} width={mmW.value} height={mmH.value} style={{ display: 'block' }} />
                </div>
              )}

              {hoverCell.value && (
                <div class="absolute bottom-1 left-1 flex items-center gap-1.5 text-xs text-text-secondary bg-surface/80 backdrop-blur-sm rounded-full px-2 py-1 pointer-events-none z-10">
                  <div class="w-3 h-3 rounded-full border border-black/10"
                    style={{ backgroundColor: store.selectedPalette.find(c => c.code === hoverCell.value!.code)?.hex ?? '#888' }} />
                  <span class="font-mono">({hoverCell.value.x}, {hoverCell.value.y})</span>
                  <span>{colorLabel(hoverCell.value.code, hoverCell.value.name)}</span>
                </div>
              )}
            </>
          ) : (
            <div
              class={`upload-zone flex-1 ${isDragging.value ? 'dragging' : ''}`}
              onClick={() => fileInput.value?.click()}
              onDrop={onDrop}
              onDragover={onDragOver}
              onDragenter={onDragEnter}
              onDragleave={onDragLeave}
            >
              <ImagePlus size={32} class="text-primary mb-2" />
              <p class="text-sm font-medium">{t.value.dragUpload}</p>
              <p class="text-xs text-text-secondary mt-1">{t.value.dropFormats}</p>
            </div>
          )}
        </div>

        {store.error && (
          <div class="text-xs text-error bg-error/10 rounded-2xl p-2">{store.error}</div>
        )}

        <input ref={fileInput} type="file" accept="image/*" class="hidden" onChange={onFileChange} />
      </div>

      <div class={`export-overlay ${showExportModal.value ? 'export-visible' : 'export-hidden'}`}>
        <div class="export-backdrop" onClick={() => showExportModal.value = false} />
        <div class="export-dialog">
            <div class="export-dialog-header">
              <span class="text-sm font-semibold">{t.value.exportDialogTitle}</span>
              <button class="btn-icon" onClick={() => showExportModal.value = false}><X size={14} /></button>
            </div>
            <div class="export-dialog-body">
              <div class="export-option" onClick={downloadHighRes}>
                <div class="export-option-icon"><Maximize size={18} /></div>
                <div class="export-option-text">
                  <h4>{t.value.exportHDTitle}</h4>
                  <p>{t.value.exportHDDesc}</p>
                </div>
              </div>
              <div class="export-option" onClick={downloadShareImage}>
                <div class="export-option-icon"><Share2 size={18} /></div>
                <div class="export-option-text">
                  <h4>{t.value.exportShareTitle}</h4>
                  <p>{t.value.exportShareDesc}</p>
                </div>
              </div>
              <div class="export-option" onClick={downloadDataFiles}>
                <div class="export-option-icon"><FileText size={18} /></div>
                <div class="export-option-text">
                  <h4>{t.value.exportDataTitle}</h4>
                  <p>{t.value.exportDataDesc}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
      )
    }
  },
})
