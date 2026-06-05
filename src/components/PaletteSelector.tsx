import { defineComponent } from 'vue'
import { useAppStore } from '@/stores/app'
import { useImageProcessing } from '@/composables/useImageProcessing'

export default defineComponent({
  name: 'PaletteSelector',
  setup() {
    const store = useAppStore()
    const { generatePattern } = useImageProcessing()

    const onPaletteChange = (count: number) => {
      store.setPalette(count)
    }

    return () => (
      <div class="rounded-xl border border-border bg-surface/50 p-4 space-y-3">
        <h3 class="text-sm font-semibold">拼豆色系</h3>

        <div class="flex flex-wrap gap-1.5">
          {store.paletteOptions.map((opt) => (
            <button
              key={opt.count}
              class={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                store.selectedPaletteCount === opt.count
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-border hover:bg-primary/10'
              }`}
              onClick={() => onPaletteChange(opt.count)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div class="flex flex-wrap gap-0.5 max-h-40 overflow-y-auto p-1">
          {store.selectedPalette.map((c) => (
            <div
              key={c.id}
              class="w-4 h-4 rounded-sm border border-black/10 flex-shrink-0"
              style={{ backgroundColor: c.hex }}
              title={`${c.name} (${c.hex})`}
            />
          ))}
        </div>

        <div class="space-y-2">
          <div class="flex gap-2 text-xs">
            <label class="flex-1">
              <span class="text-text-secondary">横向豆数</span>
              <input
                type="number"
                class="w-full mt-1 px-2 py-1 rounded-lg bg-background border border-border text-sm"
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
              <span class="text-text-secondary">纵向豆数</span>
              <input
                type="number"
                class="w-full mt-1 px-2 py-1 rounded-lg bg-background border border-border text-sm"
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
        </div>

        <button
          class="w-full py-2 rounded-xl bg-primary text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          disabled={store.isProcessing || !store.sourceImage}
          onClick={generatePattern}
        >
          {store.isProcessing ? '处理中...' : '生成拼豆图纸'}
        </button>
      </div>
    )
  },
})
