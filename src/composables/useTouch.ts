import { ref } from 'vue'
import type { Ref } from 'vue'
import { useAppStore } from '@/stores/app'

interface TouchState {
  type: 'none' | 'pan' | 'pinch'
  startDist: number
  startZoom: number
  startMidX: number
  startMidY: number
  startPanX: number
  startPanY: number
}

export function useTouch(
  vpRef: Ref<HTMLDivElement | undefined>,
  zoom: Ref<number>,
  panX: Ref<number>,
  panY: Ref<number>,
  isPanning: Ref<boolean>,
  clampPan: () => void,
  snapToZoomLevel: (target: number) => number,
  drawMinimap: () => void,
  ZOOM_LEVELS: number[],
) {
  const store = useAppStore()
  const touchState = ref<TouchState>({
    type: 'none', startDist: 0, startZoom: 1,
    startMidX: 0, startMidY: 0, startPanX: 0, startPanY: 0,
  })

  function onTouchStart(e: TouchEvent) {
    if (!vpRef.value) return
    if (!store.beadPattern) return
    e.preventDefault()

    if (e.touches.length === 1) {
      const t = e.touches[0]
      touchState.value = {
        type: 'pan', startDist: 0, startZoom: zoom.value,
        startMidX: t.clientX, startMidY: t.clientY,
        startPanX: panX.value, startPanY: panY.value,
      }
      isPanning.value = true
    } else if (e.touches.length === 2) {
      const t1 = e.touches[0]
      const t2 = e.touches[1]
      const dx = t2.clientX - t1.clientX
      const dy = t2.clientY - t1.clientY
      const dist = Math.sqrt(dx * dx + dy * dy)
      touchState.value = {
        type: 'pinch', startDist: dist, startZoom: zoom.value,
        startMidX: (t1.clientX + t2.clientX) / 2,
        startMidY: (t1.clientY + t2.clientY) / 2,
        startPanX: panX.value, startPanY: panY.value,
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
        type: 'pinch', startDist: Math.sqrt(dx * dx + dy * dy),
        startZoom: zoom.value,
        startMidX: (t1.clientX + t2.clientX) / 2,
        startMidY: (t1.clientY + t2.clientY) / 2,
        startPanX: panX.value, startPanY: panY.value,
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
      touchState.value = {
        type: 'none', startDist: 0, startZoom: 1,
        startMidX: 0, startMidY: 0, startPanX: 0, startPanY: 0,
      }
      isPanning.value = false
    } else if (e.touches.length === 1 && touchState.value.type === 'pinch') {
      const t = e.touches[0]
      touchState.value = {
        type: 'pan', startDist: 0, startZoom: zoom.value,
        startMidX: t.clientX, startMidY: t.clientY,
        startPanX: panX.value, startPanY: panY.value,
      }
      isPanning.value = true
    }
  }

  return { onTouchStart, onTouchMove, onTouchEnd }
}
