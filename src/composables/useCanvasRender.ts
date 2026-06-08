import { ref } from 'vue'
import type { Ref } from 'vue'
import { useAppStore } from '@/stores/app'
import type { BeadPattern } from '@/types'

export type RenderMode = 'square' | 'solid-cyl' | 'hollow-cyl'
const SUPER_SCALE = 2

export function useCanvasRender(
  canvasRef: Ref<HTMLCanvasElement | undefined>,
  mmRef: Ref<HTMLCanvasElement | undefined>,
  imgData: Ref<ImageData | null>,
  zoom: Ref<number>,
  panX: Ref<number>,
  panY: Ref<number>,
  vpW: Ref<number>,
  vpH: Ref<number>,
  overX: Ref<boolean>,
  overY: Ref<boolean>,
  hasOverflow: Ref<boolean>,
  mmW: Ref<number>,
  mmH: Ref<number>,
  mmScale: Ref<number>,
) {
  const store = useAppStore()
  const showGrid = ref(true)
  const showCodes = ref(true)
  const renderMode = ref<RenderMode>('square')
  const hoverCell = ref<{ x: number; y: number; code: string; name: string } | null>(null)
  const cellIndex = ref<Map<string, { code: string; name: string; hex: string }>>(new Map())
  let mmBg: HTMLCanvasElement | null = null

  function buildCellIndex() {
    const map = new Map<string, { code: string; name: string; hex: string }>()
    const p = store.beadPattern
    if (!p) { cellIndex.value = map; return }
    for (const c of p.cells) map.set(`${c.x},${c.y}`, { code: c.colorCode, name: c.colorName, hex: c.hex })
    cellIndex.value = map
  }

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
      const w = d.width * zoom.value
      const h = d.height * zoom.value
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

  function updateHover(e: MouseEvent, gridWidth: number, gridHeight: number, vW_: number, vH_: number, vpRef_: HTMLDivElement | undefined) {
    if (!store.beadPattern || zoom.value < 2 || !vpRef_ || !canvasRef.value) {
      hoverCell.value = null
      return
    }
    const rect = vpRef_.getBoundingClientRect()
    const cx = e.clientX - rect.left - panX.value
    const cy = e.clientY - rect.top - panY.value
    const cW = vW_ / gridWidth
    const cH = vH_ / gridHeight
    const gx = Math.floor(cx / cW)
    const gy = Math.floor(cy / cH)
    if (gx < 0 || gy < 0 || gx >= gridWidth || gy >= gridHeight) {
      hoverCell.value = null
      return
    }
    const entry = cellIndex.value.get(`${gx},${gy}`)
    hoverCell.value = entry ? { x: gx, y: gy, code: entry.code, name: entry.name } : null
  }

  return {
    showGrid, showCodes, renderMode, hoverCell, cellIndex,
    buildCellIndex, drawPattern, buildMinimapBg, drawMinimap,
    drawCylinderPattern, drawExportGrid, drawExportCodes,
    drawCylinderBead, hexLuminance, hexToRgb, darkenRgb,
    updateHover, applyHighlight,
  }
}
