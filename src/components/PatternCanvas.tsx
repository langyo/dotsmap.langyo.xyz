import { defineComponent, ref, watch, nextTick, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useImageProcessing } from '@/composables/useImageProcessing'
import { useI18n } from '@/i18n'
import { useZoomPan } from '@/composables/useZoomPan'
import { useTouch } from '@/composables/useTouch'
import { useCanvasRender } from '@/composables/useCanvasRender'
import { useExport } from '@/composables/useExport'
import { ZoomIn, ZoomOut, Maximize2, Grid3x3, Hash, ImagePlus, X, Share2, Download, Maximize, FileText, Square, Circle, CircleDot, RotateCcw } from 'lucide-vue-next'

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
    const fileInput = ref<HTMLInputElement>()
    const isDragging = ref(false)
    const dragCounter = ref(0)

    const hasContent = computed(() => !!(store.beadedDataURL || store.processedDataURL || store.sourceDataURL))
    const imgData = computed(() => store.beadedImageData)

    const zp = useZoomPan(vpRef, imgData, mmRef)
    const render = useCanvasRender(
      canvasRef, mmRef, imgData,
      zp.zoom, zp.panX, zp.panY,
      zp.vpW, zp.vpH,
      zp.overX, zp.overY, zp.hasOverflow,
      zp.mmW, zp.mmH, zp.mmScale,
    )
    const touch = useTouch(
      vpRef, zp.zoom, zp.panX, zp.panY, zp.isPanning,
      zp.clampPan, zp.snapToZoomLevel, render.drawMinimap, zp.ZOOM_LEVELS,
    )
    const exp = useExport(
      imgData, render.renderMode, render.showGrid, render.showCodes,
      render.drawCylinderPattern, render.drawExportGrid, render.drawExportCodes,
      render.hexLuminance, resetAllAction,
    )

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

    watch(
      () => [store.beadedDataURL, store.processedDataURL, store.sourceDataURL, store.highlightCode, render.showGrid.value, render.showCodes.value, render.renderMode.value, zp.zoom.value] as const,
      () => nextTick(() => {
        render.drawPattern()
        render.buildMinimapBg()
        render.drawMinimap()
      }),
    )

    watch(render.hoverCell, () => {
      nextTick(() => render.drawPattern())
    })

    watch(() => store.beadPattern, (p) => {
      if (p) render.buildCellIndex()
    })

    watch(imgData, () => {
      nextTick(() => {
        zp.fitToViewport()
        render.buildMinimapBg()
        render.drawMinimap()
      })
    })

    onMounted(() => {
      zp.mountViewport()
      nextTick(() => {
        zp.fitToViewport()
        render.drawPattern()
        render.buildMinimapBg()
        render.drawMinimap()
      })
    })

    onUnmounted(() => {
      zp.unmountViewport()
    })

    const vpCursor = computed(() => {
      if (!hasContent.value) return 'pointer'
      if (zp.isPanning.value) return 'grabbing'
      if (zp.dragType.value !== 'none') return 'default'
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
                  <button class="btn-icon" onClick={() => zp.doZoom(-1)} title={t.value.zoomOut} aria-label={t.value.zoomOut}><ZoomOut size={14} /></button>
                  <span class="text-xs font-mono w-10 text-center select-none">{Math.round(zp.zoom.value / 12 * 100)}%</span>
                  <button class="btn-icon" onClick={() => zp.doZoom(1)} title={t.value.zoomIn} aria-label={t.value.zoomIn}><ZoomIn size={14} /></button>
                  <button class="btn-icon" onClick={zp.resetView} title={t.value.zoomReset} aria-label={t.value.zoomReset}><Maximize2 size={14} /></button>
                </div>
                <div class="flex items-center gap-1.5 text-xs select-none">
                  <Grid3x3 size={14} />
                  <button
                    class={`switch ${render.showGrid.value ? 'active' : ''}`}
                    role="switch"
                    aria-checked={render.showGrid.value}
                    aria-label={t.value.grid}
                    onClick={() => render.showGrid.value = !render.showGrid.value}
                  />
                </div>
                <div class="flex items-center gap-1.5 text-xs select-none">
                  <Hash size={14} />
                  <button
                    class={`switch ${render.showCodes.value ? 'active' : ''}`}
                    role="switch"
                    aria-checked={render.showCodes.value}
                    aria-label={t.value.colorCode}
                    onClick={() => render.showCodes.value = !render.showCodes.value}
                  />
                </div>
                <div class="seg-group" role="radiogroup" aria-label="Render mode">
                  <button
                    class={`seg-btn ${render.renderMode.value === 'square' ? 'active' : ''}`}
                    role="radio"
                    aria-checked={render.renderMode.value === 'square'}
                    title={t.value.modeSquare}
                    onClick={() => render.renderMode.value = 'square'}
                  ><Square size={13} /></button>
                  <button
                    class={`seg-btn ${render.renderMode.value === 'solid-cyl' ? 'active' : ''}`}
                    role="radio"
                    aria-checked={render.renderMode.value === 'solid-cyl'}
                    title={t.value.modeSolidCyl}
                    onClick={() => render.renderMode.value = 'solid-cyl'}
                  ><Circle size={13} /></button>
                  <button
                    class={`seg-btn ${render.renderMode.value === 'hollow-cyl' ? 'active' : ''}`}
                    role="radio"
                    aria-checked={render.renderMode.value === 'hollow-cyl'}
                    title={t.value.modeHollowCyl}
                    onClick={() => render.renderMode.value = 'hollow-cyl'}
                  ><CircleDot size={13} /></button>
                </div>
                <div class="flex gap-0.5">
                  <button class="btn btn-sm" onClick={exp.handleShare}><Share2 size={12} /> {t.value.share}</button>
                  <button class="btn btn-sm" onClick={() => exp.showExportModal.value = true}><Download size={12} /> {t.value.export}</button>
                  <button class="btn btn-sm" onClick={exp.handleClearReset}><RotateCcw size={12} /> {t.value.clear}</button>
                </div>
              </div>
            ) : hasContent.value ? (
              <div class="flex gap-1">
                <button class="btn btn-sm" onClick={() => fileInput.value?.click()}>{t.value.changeImage}</button>
                <button class="btn btn-sm btn-danger" onClick={exp.handleClearReset}><X size={12} /> {t.value.clear}</button>
              </div>
            ) : null}
          </div>

          <div
            ref={vpRef}
            class={`canvas-container ${shouldFill ? 'canvas-fill' : ''}`}
            style={{ cursor: vpCursor.value }}
            onWheel={zp.onWheel}
            onMousedown={(e: MouseEvent) => zp.onVpMouseDown(e, render.drawMinimap, render.drawPattern)}
            onMousemove={(e: MouseEvent) => render.updateHover(e, store.beadPattern?.gridWidth ?? 0, store.beadPattern?.gridHeight ?? 0, zp.vW.value, zp.vH.value, vpRef.value)}
            onTouchstart={touch.onTouchStart}
            onTouchmove={touch.onTouchMove}
            onTouchend={touch.onTouchEnd}
            onTouchcancel={touch.onTouchEnd}
          >
          {hasContent.value ? (
            <>
              <div
                class="canvas-transform-layer"
                style={{
                  transform: `translate(${zp.panX.value}px, ${zp.panY.value}px)`,
                  willChange: 'transform',
                }}
              >
                <canvas ref={canvasRef} style={{ imageRendering: (render.renderMode.value === 'square' && zp.zoom.value > 2) ? 'pixelated' : 'auto', display: 'block' }} />
              </div>

              {zp.overX.value && (
                <div class="sb-track sb-h" style={{ width: `calc(100% - ${zp.overY.value ? zp.SB_SIZE : 0}px)` }}>
                  <div class="sb-thumb" style={{ left: zp.hThumbPos.value + 'px', width: zp.hThumbLen.value + 'px' }} />
                </div>
              )}
              {zp.overY.value && (
                <div class="sb-track sb-v" style={{ height: `calc(100% - ${zp.overX.value ? zp.SB_SIZE : 0}px)` }}>
                  <div class="sb-thumb" style={{ top: zp.vThumbPos.value + 'px', height: zp.vThumbLen.value + 'px' }} />
                </div>
              )}

              {zp.hasOverflow.value && imgData.value && (
                <div class="minimap-box" style={{
                  right: (zp.overY.value ? zp.SB_SIZE + 6 : 6) + 'px',
                  bottom: (zp.overX.value ? zp.SB_SIZE + 6 : 6) + 'px',
                }}>
                  <canvas ref={mmRef} width={zp.mmW.value} height={zp.mmH.value} style={{ display: 'block' }} />
                </div>
              )}

              {render.hoverCell.value && (
                <div class="absolute bottom-1 left-1 flex items-center gap-1.5 text-xs text-text-secondary bg-surface/80 backdrop-blur-sm rounded-full px-2 py-1 pointer-events-none z-10">
                  <div class="w-3 h-3 rounded-full border border-black/10"
                    style={{ backgroundColor: store.selectedPalette.find(c => c.code === render.hoverCell.value!.code)?.hex ?? '#888' }} />
                  <span class="font-mono">({render.hoverCell.value.x}, {render.hoverCell.value.y})</span>
                  <span>{colorLabel(render.hoverCell.value.code, render.hoverCell.value.name)}</span>
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

      <div class={`export-overlay ${exp.showExportModal.value ? 'export-visible' : 'export-hidden'}`}>
        <div class="export-backdrop" onClick={() => exp.showExportModal.value = false} />
        <div class="export-dialog">
            <div class="export-dialog-header">
              <span class="text-sm font-semibold">{t.value.exportDialogTitle}</span>
              <button class="btn-icon" onClick={() => exp.showExportModal.value = false}><X size={14} /></button>
            </div>
            <div class="export-dialog-body">
              <div class="export-option" onClick={exp.downloadHighRes}>
                <div class="export-option-icon"><Maximize size={18} /></div>
                <div class="export-option-text">
                  <h4>{t.value.exportHDTitle}</h4>
                  <p>{t.value.exportHDDesc}</p>
                </div>
              </div>
              <div class="export-option" onClick={exp.downloadShareImage}>
                <div class="export-option-icon"><Share2 size={18} /></div>
                <div class="export-option-text">
                  <h4>{t.value.exportShareTitle}</h4>
                  <p>{t.value.exportShareDesc}</p>
                </div>
              </div>
              <div class="export-option" onClick={exp.downloadDataFiles}>
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
