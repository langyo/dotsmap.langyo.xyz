import { defineComponent, ref } from 'vue'
import { useAppStore } from '@/stores/app'
import { useImageProcessing } from '@/composables/useImageProcessing'

export default defineComponent({
  name: 'PreprocessPanel',
  setup() {
    const store = useAppStore()
    const { applyPreprocessing } = useImageProcessing()
    const isExpanded = ref(false)

    const modes = [
      { value: 'none' as const, label: '无', icon: '⊘' },
      { value: 'remove-bg' as const, label: '去背景', icon: '◻' },
      { value: 'magic-wand' as const, label: '魔术棒', icon: '✦' },
    ]

    const onImageClick = (e: MouseEvent) => {
      if (store.preprocessMode !== 'magic-wand') return
      const img = e.target as HTMLImageElement
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
          <h3 class="text-sm font-semibold flex items-center gap-2">
            <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            预处理
          </h3>
          {store.preprocessMode !== 'none' && (
            <button
              class="text-xs text-primary hover:underline"
              onClick={() => (isExpanded.value = !isExpanded.value)}
            >
              {isExpanded.value ? '收起' : '参数'}
            </button>
          )}
        </div>

        <div class="flex gap-1">
          {modes.map((m) => (
            <button
              key={m.value}
              class={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 active:scale-95 ${
                store.preprocessMode === m.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-background border border-border hover:bg-primary/10'
              }`}
              onClick={() => store.setPreprocessMode(m.value)}
            >
              <span class="mr-0.5">{m.icon}</span> {m.label}
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
                <input
                  type="range"
                  class="w-full"
                  min={5}
                  max={120}
                  value={store.bgThreshold}
                  onInput={(e: Event) =>
                    (store.bgThreshold = parseInt((e.target as HTMLInputElement).value))
                  }
                />
              </label>
            )}
            {store.preprocessMode === 'magic-wand' && (
              <label class="block">
                <div class="flex justify-between text-xs text-text-secondary mb-1">
                  <span>容差</span>
                  <span class="font-mono">{store.magicTolerance}</span>
                </div>
                <input
                  type="range"
                  class="w-full"
                  min={5}
                  max={120}
                  value={store.magicTolerance}
                  onInput={(e: Event) =>
                    (store.magicTolerance = parseInt((e.target as HTMLInputElement).value))
                  }
                />
              </label>
            )}
          </div>
        )}

        {store.preprocessMode === 'magic-wand' && store.sourceDataURL && (
          <div class="text-xs text-text-secondary bg-background rounded-lg p-2 flex items-center gap-1">
            <span>✦</span> 点击图片选取要保留的区域
          </div>
        )}

        {store.sourceDataURL && store.preprocessMode !== 'none' && (
          <div class="relative rounded-lg overflow-hidden border border-border bg-checkerboard">
            <img
              src={store.processedDataURL ?? store.sourceDataURL}
              alt="Preview"
              class={`w-full object-contain max-h-48 ${
                store.preprocessMode === 'magic-wand' ? 'cursor-crosshair' : ''
              }`}
              onClick={onImageClick}
            />
          </div>
        )}

        <div class="flex gap-2">
          {store.preprocessMode !== 'none' && (
            <button
              class="flex-1 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-all duration-150 active:scale-95 disabled:opacity-50"
              onClick={applyPreprocessing}
              disabled={store.isProcessing}
            >
              应用
            </button>
          )}
          {store.processedDataURL && (
            <button
              class="flex-1 py-1.5 rounded-lg bg-surface border border-border text-xs hover:bg-muted/10 transition-all duration-150 active:scale-95"
              onClick={() => store.resetPreprocess()}
            >
              撤销
            </button>
          )}
        </div>
      </div>
    )
  },
})
