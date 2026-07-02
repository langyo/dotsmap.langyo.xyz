import { ref } from 'vue'
import type { Ref } from 'vue'
import { useAppStore } from '@/stores/app'
import { useI18n } from '@/i18n'
import type { BeadPattern } from '@/types'
import { clearState } from '@/utils/persistence'
import type { RenderMode } from './useCanvasRender'

export function useExport(
  imgData: Ref<ImageData | null>,
  renderMode: Ref<RenderMode>,
  showGrid: Ref<boolean>,
  showCodes: Ref<boolean>,
  drawCylinderPattern: (ctx: CanvasRenderingContext2D, cw: number, ch: number, p: BeadPattern, highlightCode: string | null, hollow: boolean) => void,
  drawExportGrid: (ctx: CanvasRenderingContext2D, w: number, h: number, gw: number, gh: number) => void,
  drawExportCodes: (ctx: CanvasRenderingContext2D, gw: number, gh: number, cellSize: number, cells: BeadPattern['cells']) => void,
  hexLuminance: (hex: string) => number,
  resetAllAction: () => void,
) {
  const store = useAppStore()
  const { t } = useI18n()
  const showExportModal = ref(false)

  function getUsedColors(p: BeadPattern) {
    const usage: Record<string, number> = {}
    for (const c of p.cells) usage[c.colorCode] = (usage[c.colorCode] ?? 0) + 1
    const usedCodes = new Set(Object.keys(usage))
    const usedColors = store.selectedPalette.filter(c => usedCodes.has(c.code))
    const sorted = [...usedColors].sort((a, b) => (usage[b.code] ?? 0) - (usage[a.code] ?? 0))
    return { usage, usedCodes, sorted }
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

  function getMaxCanvasDim(): number {
    if (typeof navigator === 'undefined') return 4096
    const ua = navigator.userAgent.toLowerCase()
    if (ua.includes('safari') && !ua.includes('chrome')) return 4096
    return 16000
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

  async function downloadHighRes() {
    showExportModal.value = false
    const d = imgData.value
    const p = store.beadPattern
    if (!d || !p) return

    const maxDim = getMaxCanvasDim()
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
    const maxShareDim = getMaxCanvasDim()
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
    const maxShareDim = getMaxCanvasDim()
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
    void clearState().catch((err) => { if (import.meta.env.DEV) console.warn('Failed to clear persisted state:', err) })
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

  return {
    showExportModal,
    downloadHighRes, downloadShareImage, downloadDataFiles,
    handleShare, handleClearReset,
    downloadSVG, downloadCSV,
    getUsedColors,
  }
}
