import { defineComponent } from 'vue'
import { useAppStore } from '@/stores/app'
import { useImageProcessing } from '@/composables/useImageProcessing'
import { SlidersHorizontal } from 'lucide-vue-next'

export default defineComponent({
  name: 'PreprocessPanel',
  setup() {
    const store = useAppStore()
    const { applyPreprocessing, resetAndRegenerate } = useImageProcessing()

    const modes = [
      { value: 'none' as const, label: '无' },
      { value: 'remove-bg' as const, label: '去背景' },
      { value: 'magic-wand' as const, label: '魔术棒' },
    ]

    return () => (
      <div class="panel">
        <h3 class="panel-title">
          <SlidersHorizontal size={16} />
          预处理
        </h3>

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

        {store.preprocessMode === 'remove-bg' && (
          <label class="block animate-fade-in">
            <div class="flex justify-between text-xs text-text-secondary mb-1">
              <span>背景阈值</span>
              <span class="font-mono">{store.bgThreshold}</span>
            </div>
            <input type="range" class="w-full" min={5} max={120} value={store.bgThreshold}
              onInput={(e) => (store.bgThreshold = parseInt((e.target as HTMLInputElement).value))} />
          </label>
        )}

        {store.preprocessMode === 'magic-wand' && (
          <label class="block animate-fade-in">
            <div class="flex justify-between text-xs text-text-secondary mb-1">
              <span>容差</span>
              <span class="font-mono">{store.magicTolerance}</span>
            </div>
            <input type="range" class="w-full" min={5} max={120} value={store.magicTolerance}
              onInput={(e) => (store.magicTolerance = parseInt((e.target as HTMLInputElement).value))} />
          </label>
        )}

        {store.preprocessMode === 'magic-wand' && (
          <div class="hint">点击画布选取要保留的区域</div>
        )}

        <div class="flex gap-2">
          {store.preprocessMode !== 'none' && (
            <button class="btn btn-sm btn-primary flex-1" onClick={applyPreprocessing} disabled={store.isProcessing}>
              应用并重新生成
            </button>
          )}
          {store.processedDataURL && (
            <button class="btn btn-sm flex-1" onClick={resetAndRegenerate}>
              撤销
            </button>
          )}
        </div>
      </div>
    )
  },
})
