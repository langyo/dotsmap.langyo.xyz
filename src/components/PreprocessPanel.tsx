import { defineComponent, ref } from 'vue'
import { useAppStore } from '@/stores/app'
import { useImageProcessing } from '@/composables/useImageProcessing'
import { SlidersHorizontal } from 'lucide-vue-next'

export default defineComponent({
  name: 'PreprocessPanel',
  setup() {
    const store = useAppStore()
    const { applyPreprocessing } = useImageProcessing()
    const isExpanded = ref(false)

    const modes = [
      { value: 'none' as const, label: '无' },
      { value: 'remove-bg' as const, label: '去背景' },
      { value: 'magic-wand' as const, label: '魔术棒' },
    ]

    const onImageClick = (e: MouseEvent) => {
      if (store.preprocessMode !== 'magic-wand') return
      const img = e.target as HTMLImageElement
      const rect = img.getBoundingClientRect()
      const naturalW = img.naturalWidth
      const naturalH = img.naturalHeight
      const displayW = rect.width
      const displayH = rect.height

      const scaleX = naturalW / displayW
      const scaleY = naturalH / displayH
      const scale = Math.max(scaleX, scaleY)

      const renderedW = naturalW / scale
      const renderedH = naturalH / scale
      const offsetX = (displayW - renderedW) / 2
      const offsetY = (displayH - renderedH) / 2

      const imgX = e.clientX - rect.left - offsetX
      const imgY = e.clientY - rect.top - offsetY

      const px = Math.floor(Math.max(0, Math.min(naturalW - 1, imgX * scale)))
      const py = Math.floor(Math.max(0, Math.min(naturalH - 1, imgY * scale)))

      store.magicX = px
      store.magicY = py
      applyPreprocessing()
    }

    return () => (
      <div class="panel">
        <div class="flex items-center justify-between">
          <h3 class="panel-title">
            <SlidersHorizontal size={16} />
            预处理
          </h3>
          {store.preprocessMode !== 'none' && (
            <button class="text-xs text-primary hover:underline" onClick={() => (isExpanded.value = !isExpanded.value)}>
              {isExpanded.value ? '收起' : '参数'}
            </button>
          )}
        </div>

        <div class="flex gap-1">
          {modes.map((m) => (
            <button
              key={m.value}
              class={`btn btn-sm flex-1 ${store.preprocessMode === m.value ? 'btn-primary' : ''}`}
              onClick={() => store.setPreprocessMode(m.value)}
            >
              {m.label}
            </button>
          ))}
        </div>

        {isExpanded.value && store.preprocessMode !== 'none' && (
          <div class="space-y-2 pt-1 animate-fade-in">
            {store.preprocessMode === 'remove-bg' && (
              <label class="block">
                <div class="flex justify-between text-xs text-text-secondary mb-1">
                  <span>背景阈值</span>
                  <span class="font-mono">{store.bgThreshold}</span>
                </div>
                <input type="range" class="w-full" min={5} max={120} value={store.bgThreshold}
                  onInput={(e) => (store.bgThreshold = parseInt((e.target as HTMLInputElement).value))} />
              </label>
            )}
            {store.preprocessMode === 'magic-wand' && (
              <label class="block">
                <div class="flex justify-between text-xs text-text-secondary mb-1">
                  <span>容差</span>
                  <span class="font-mono">{store.magicTolerance}</span>
                </div>
                <input type="range" class="w-full" min={5} max={120} value={store.magicTolerance}
                  onInput={(e) => (store.magicTolerance = parseInt((e.target as HTMLInputElement).value))} />
              </label>
            )}
          </div>
        )}

        {store.preprocessMode === 'magic-wand' && (
          <div class="hint">点击图片选取要保留的区域</div>
        )}

        {store.sourceDataURL && store.preprocessMode !== 'none' && (
          <div class="rounded-2xl overflow-hidden border border-border bg-checkerboard">
            <img
              src={store.processedDataURL ?? store.sourceDataURL}
              alt="Preview"
              class={`w-full object-contain max-h-48 ${store.preprocessMode === 'magic-wand' ? 'cursor-crosshair' : ''}`}
              onClick={onImageClick}
            />
          </div>
        )}

        <div class="flex gap-2">
          {store.preprocessMode !== 'none' && (
            <button class="btn btn-sm btn-primary flex-1" onClick={applyPreprocessing} disabled={store.isProcessing}>
              应用
            </button>
          )}
          {store.processedDataURL && (
            <button class="btn btn-sm flex-1" onClick={() => store.resetPreprocess()}>
              撤销
            </button>
          )}
        </div>
      </div>
    )
  },
})
