import { defineComponent, ref } from 'vue'
import { useAppStore } from '@/stores/app'
import { useImageProcessing } from '@/composables/useImageProcessing'

export default defineComponent({
  name: 'PreprocessPanel',
  setup() {
    const store = useAppStore()
    const { applyPreprocessing } = useImageProcessing()
    const showSettings = ref(false)

    const modes = [
      { value: 'none' as const, label: '无处理' },
      { value: 'remove-bg' as const, label: '去背景' },
      { value: 'magic-wand' as const, label: '魔术棒' },
    ]

    const onModeChange = (mode: typeof modes[number]['value']) => {
      store.setPreprocessMode(mode)
    }

    const onImageClick = (e: MouseEvent) => {
      if (store.preprocessMode !== 'magic-wand') return
      const img = e.currentTarget as HTMLImageElement
      const rect = img.getBoundingClientRect()
      const scaleX = img.naturalWidth / rect.width
      const scaleY = img.naturalHeight / rect.height
      store.magicX = Math.floor((e.clientX - rect.left) * scaleX)
      store.magicY = Math.floor((e.clientY - rect.top) * scaleY)
      applyPreprocessing()
    }

    return () => (
      <div class="rounded-xl border border-border bg-surface/50 p-4 space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold">图像预处理</h3>
          <button
            class="text-xs text-primary hover:underline"
            onClick={() => (showSettings.value = !showSettings.value)}
          >
            {showSettings.value ? '收起' : '设置'}
          </button>
        </div>

        <div class="flex gap-1.5">
          {modes.map((m) => (
            <button
              key={m.value}
              class={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                store.preprocessMode === m.value
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-border hover:bg-primary/10'
              }`}
              onClick={() => onModeChange(m.value)}
            >
              {m.label}
            </button>
          ))}
        </div>

        {showSettings.value && (
          <div class="space-y-2 pt-1">
            {store.preprocessMode === 'remove-bg' && (
              <label class="block">
                <span class="text-xs text-text-secondary">背景阈值: {store.bgThreshold}</span>
                <input
                  type="range"
                  class="w-full mt-1"
                  min={5}
                  max={100}
                  value={store.bgThreshold}
                  onChange={(e: Event) =>
                    (store.bgThreshold = parseInt((e.target as HTMLInputElement).value))
                  }
                />
              </label>
            )}
            {store.preprocessMode === 'magic-wand' && (
              <label class="block">
                <span class="text-xs text-text-secondary">容差: {store.magicTolerance}</span>
                <input
                  type="range"
                  class="w-full mt-1"
                  min={5}
                  max={100}
                  value={store.magicTolerance}
                  onChange={(e: Event) =>
                    (store.magicTolerance = parseInt((e.target as HTMLInputElement).value))
                  }
                />
              </label>
            )}
          </div>
        )}

        {(store.preprocessMode === 'magic-wand' && store.sourceDataURL) && (
          <div class="text-xs text-text-secondary bg-background rounded-lg p-2">
            点击图片上要保留的区域进行魔术棒抠图
          </div>
        )}

        {store.sourceDataURL && store.preprocessMode !== 'none' && (
          <div
            class="relative cursor-crosshair rounded-lg overflow-hidden border border-border"
            onClick={store.preprocessMode === 'magic-wand' ? onImageClick : undefined}
          >
            {store.processedDataURL ? (
              <img src={store.processedDataURL} alt="Processed" class="w-full object-contain" />
            ) : (
              <img src={store.sourceDataURL} alt="Source" class="w-full object-contain" />
            )}
          </div>
        )}

        {store.preprocessMode !== 'none' && (
          <button
            class="w-full py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
            onClick={applyPreprocessing}
            disabled={store.isProcessing}
          >
            应用预处理
          </button>
        )}

        {store.processedDataURL && (
          <button
            class="w-full py-1.5 rounded-lg bg-surface border border-border text-xs hover:bg-muted/10 transition-colors"
            onClick={() => {
              store.processedImageData = null
              store.processedDataURL = null
              store.preprocessMode = 'none'
            }}
          >
            撤销预处理
          </button>
        )}
      </div>
    )
  },
})
