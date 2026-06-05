import { defineComponent } from 'vue'
import { useAppStore } from '@/stores/app'
import { useImageProcessing } from '@/composables/useImageProcessing'

export default defineComponent({
  name: 'PaletteSelector',
  setup() {
    const store = useAppStore()
    const { generatePattern } = useImageProcessing()

    return () => (
      <div class="rounded-xl border border-border bg-surface/50 p-4 space-y-3">
        <h3 class="text-sm font-semibold flex items-center gap-2">
          <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          色系与尺寸
        </h3>

        <div class="space-y-1.5">
          <span class="text-xs text-text-secondary">拼豆色系</span>
          <div class="flex flex-wrap gap-1">
            {store.paletteOptions.map((opt) => (
              <button
                key={opt.count}
                class={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-150 active:scale-95 ${
                  store.selectedPaletteCount === opt.count
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-background border border-border hover:bg-primary/10'
                }`}
                onClick={() => store.setPalette(opt.count)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <details>
          <summary class="text-xs text-text-secondary cursor-pointer hover:text-primary transition-colors">
            查看可用颜色 ({store.selectedPalette.length})
          </summary>
          <div class="flex flex-wrap gap-0.5 max-h-36 overflow-y-auto p-1 mt-1.5 rounded-lg bg-background">
            {store.selectedPalette.map((col) => (
              <div
                key={col.id}
                class="w-4 h-4 rounded-sm border border-black/10 flex-shrink-0 transition-transform hover:scale-150 hover:z-10"
                style={{ backgroundColor: col.hex }}
                title={`${col.name} (${col.hex})`}
              />
            ))}
          </div>
        </details>

        <div class="flex gap-2 text-xs">
          <label class="flex-1">
            <span class="text-text-secondary">宽</span>
            <input
              type="number"
              class="w-full mt-1 px-2 py-1.5 rounded-lg bg-background border border-border text-sm font-mono focus:border-primary focus:outline-none transition-colors"
              value={store.gridWidth}
              min={1}
              max={200}
              onChange={(e: Event) => {
                const v = parseInt((e.target as HTMLInputElement).value)
                if (v > 0) store.setGridSize(v, store.gridHeight)
              }}
            />
          </label>
          <label class="flex-1">
            <span class="text-text-secondary">高</span>
            <input
              type="number"
              class="w-full mt-1 px-2 py-1.5 rounded-lg bg-background border border-border text-sm font-mono focus:border-primary focus:outline-none transition-colors"
              value={store.gridHeight}
              min={1}
              max={200}
              onChange={(e: Event) => {
                const v = parseInt((e.target as HTMLInputElement).value)
                if (v > 0) store.setGridSize(store.gridWidth, v)
              }}
            />
          </label>
        </div>

        <button
          class="w-full py-2 rounded-xl bg-primary text-white font-medium text-sm hover:opacity-90 transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100"
          disabled={store.isProcessing || !store.sourceImage}
          onClick={generatePattern}
        >
          {store.isProcessing ? (
            <span class="inline-flex items-center gap-1.5">
              <span class="animate-spin inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full" />
              处理中
            </span>
          ) : '生成拼豆图纸'}
        </button>
      </div>
    )
  },
})
