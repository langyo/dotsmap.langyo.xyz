import { ref, computed } from 'vue'
import type { Ref } from 'vue'

const ZOOM_LEVELS = [1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24, 32]
const SB_SIZE = 10

export function useZoomPan(
  vpRef: Ref<HTMLDivElement | undefined>,
  imgData: Ref<ImageData | null>,
  _mmRef: Ref<HTMLCanvasElement | undefined>,
) {
  const zoom = ref(1)
  const panX = ref(0)
  const panY = ref(0)
  const isPanning = ref(false)
  const dragType = ref<'none' | 'pan' | 'hscroll' | 'vscroll' | 'minimap'>('none')
  const dragStart = ref({ mx: 0, my: 0, px: 0, py: 0 })
  const vpW = ref(0)
  const vpH = ref(0)
  const MM_MAX = 160
  let resizeObs: ResizeObserver | null = null

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

  function getMmRect() {
    return {
      left: vpW.value - mmW.value - (overY.value ? SB_SIZE + 6 : 6),
      top: vpH.value - mmH.value - (overX.value ? SB_SIZE + 6 : 6),
    }
  }

  function navMinimap(mx: number, my: number, drawMinimap: () => void) {
    const mm = getMmRect()
    const s = mmScale.value
    const imgX = (mx - mm.left) / s
    const imgY = (my - mm.top) / s
    panX.value = Math.round(vpW.value / 2 - imgX * zoom.value)
    panY.value = Math.round(vpH.value / 2 - imgY * zoom.value)
    clampPan()
    drawMinimap()
  }

  function onWheel(e: WheelEvent) {
    if (!imgData.value) return
    e.preventDefault()
    const rect = vpRef.value?.getBoundingClientRect()
    if (!rect) return
    doZoom(e.deltaY < 0 ? 1 : -1, e.clientX - rect.left, e.clientY - rect.top)
  }

  function startDrag(type: typeof dragType.value, mx: number, my: number, drawMinimap: () => void) {
    dragType.value = type
    dragStart.value = { mx, my, px: panX.value, py: panY.value }
    if (type === 'pan') isPanning.value = true
    window.addEventListener('mousemove', (e: MouseEvent) => onWinMove(e, drawMinimap))
    window.addEventListener('mouseup', onWinUp)
  }

  function onWinMove(e: MouseEvent, drawMinimap: () => void) {
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
      navMinimap(e.clientX - rect.left, e.clientY - rect.top, drawMinimap)
    }
  }

  function onWinUp() {
    dragType.value = 'none'
    isPanning.value = false
    window.removeEventListener('mousemove', onWinMove as EventListener)
    window.removeEventListener('mouseup', onWinUp)
  }

  function cleanupDrag() {
    window.removeEventListener('mousemove', onWinMove as EventListener)
    window.removeEventListener('mouseup', onWinUp)
  }

  function mountViewport() {
    if (vpRef.value) {
      resizeObs = new ResizeObserver(() => {
        updateVpSize()
        clampPan()
      })
      resizeObs.observe(vpRef.value)
      updateVpSize()
    }
  }

  function unmountViewport() {
    resizeObs?.disconnect()
    cleanupDrag()
  }

  return {
    zoom, panX, panY, isPanning, dragType, dragStart,
    vpW, vpH,
    vW, vH, overX, overY, hasOverflow,
    mmW, mmH, mmScale,
    hThumbLen, hThumbPos, vThumbLen, vThumbPos,
    SB_SIZE,
    fitToViewport, clampPan, doZoom, resetView, centerView,
    getMmRect, navMinimap, onWheel, snapToZoomLevel, startDrag,     onVpMouseDown: (e: MouseEvent, drawMinimap: () => void, _drawPattern: () => void) => {
      if (!vpRef.value) return
      const rect = vpRef.value.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      if (overY.value && mx >= vpW.value - SB_SIZE && my < vpH.value - (overX.value ? SB_SIZE : 0)) {
        startDrag('vscroll', mx, my, drawMinimap)
        e.preventDefault()
        return
      }
      if (overX.value && my >= vpH.value - SB_SIZE && mx < vpW.value - (overY.value ? SB_SIZE : 0)) {
        startDrag('hscroll', mx, my, drawMinimap)
        e.preventDefault()
        return
      }
      if (hasOverflow.value && imgData.value) {
        const mm = getMmRect()
        if (mx >= mm.left && mx <= mm.left + mmW.value && my >= mm.top && my <= mm.top + mmH.value) {
          startDrag('minimap', mx, my, drawMinimap)
          navMinimap(mx, my, drawMinimap)
          e.preventDefault()
          return
        }
      }
      if (e.button === 0 && imgData.value) {
        startDrag('pan', e.clientX, e.clientY, drawMinimap)
        e.preventDefault()
      }
    },
    updateVpSize,
    mountViewport, unmountViewport,
    ZOOM_LEVELS,
  }
}
