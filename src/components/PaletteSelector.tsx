import { defineComponent } from 'vue'
import { useAppStore } from '@/stores/app'
import { useImageProcessing } from '@/composables/useImageProcessing'
import { Palette, Loader2 } from 'lucide-vue-next'

export default defineComponent({
  name: 'PaletteSelector',
  setup() {
    const store = useAppStore()
    const { generatePattern } = useImageProcessing()

    return () => (
      <div class="panel">
        <h3 class="panel-title">
          <Palette size={16} />
          色系与尺寸
        </h3>

        <div class="space-y-1.5">
          <span class="text-xs text-text-secondary">拼豆色系</span>
          <div class="flex flex-wrap gap-1">
            {store.paletteOptions.map((opt) => (
              <button
                key={opt.count}
                class={`btn btn-sm ${store.selectedPaletteCount === opt.count ? 'btn-primary' : ''}`}
                onClick={() => store.setPalette(opt.count)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <details>
          <summary class="text-xs text-text-secondary cursor-pointer hover:text-primary transition-colors">
            色板预览 ({store.selectedPalette.length})
          </summary>
          <div class="flex flex-wrap gap-0.5 max-h-36 overflow-y-auto p-1 mt-1.5 rounded-lg bg-background">
            {store.selectedPalette.map((col) => (
              <div
                key={col.code}
                class="w-4 h-4 rounded-sm border border-black/10 flex-shrink-0 transition-transform hover:scale-150 hover:z-10"
                style={{ backgroundColor: col.hex }}
                title={`${col.code} ${col.name} (${col.hex})`}
              />
            ))}
          </div>
        </details>

        <div class="flex gap-2 text-xs">
          <label class="flex-1">
            <span class="text-text-secondary">宽</span>
            <input type="number" class="input mt-1" value={store.gridWidth} min={1} max={200}
              onChange={(e) => { const v = parseInt((e.target as HTMLInputElement).value, 10); if (v > 0) store.setGridSize(v, store.gridHeight) }} />
          </label>
          <label class="flex-1">
            <span class="text-text-secondary">高</span>
            <input type="number" class="input mt-1" value={store.gridHeight} min={1} max={200}
              onChange={(e) => { const v = parseInt((e.target as HTMLInputElement).value, 10); if (v > 0) store.setGridSize(store.gridWidth, v) }} />
          </label>
        </div>

        <button
          class="btn btn-primary w-full py-2 text-sm font-medium"
          disabled={store.isProcessing || !store.sourceImage}
          onClick={generatePattern}
        >
          {store.isProcessing
            ? <><Loader2 size={14} class="animate-spin" /> 处理中</>
            : '生成拼豆图纸'}
        </button>
      </div>
    )
  },
})
