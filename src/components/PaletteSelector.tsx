import { defineComponent, ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { useImageProcessing } from '@/composables/useImageProcessing'
import { categoryLabel, type BeadCategory } from '@/data/perlerColors'

export default defineComponent({
  name: 'PaletteSelector',
  setup() {
    const store = useAppStore()
    const { applyPreprocessing, resetAndRegenerate } = useImageProcessing()
    const selectedCategory = ref<BeadCategory | null>(null)

    const categories = computed(() => {
      const cats = new Map<BeadCategory, number>()
      for (const c of store.selectedPalette) {
        cats.set(c.category, (cats.get(c.category) ?? 0) + 1)
      }
      return Array.from(cats.entries()).sort((a, b) => b[1] - a[1])
    })

    const filteredPalette = computed(() => {
      if (!selectedCategory.value) return store.selectedPalette
      return store.selectedPalette.filter((c) => c.category === selectedCategory.value)
    })

    const ppModes = [
      { value: 'none' as const, label: '无' },
      { value: 'remove-bg' as const, label: '去背景' },
      { value: 'magic-wand' as const, label: '魔术棒' },
    ]

    return () => (
      <div class="panel space-y-3">
        <div class="space-y-1.5">
          <span class="text-xs text-text-secondary">拼豆品牌</span>
          <div class="flex flex-wrap gap-1">
            {store.brands.map((b) => (
              <button
                key={b.id}
                class={`btn btn-sm ${store.currentBrand.id === b.id ? 'btn-primary' : ''}`}
                onClick={() => store.setBrand(b)}
              >
                {b.shortName}
              </button>
            ))}
          </div>
          <p class="text-xs text-text-secondary">{store.currentBrand.name} · {store.currentBrand.colors.length}色</p>
        </div>

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

        {categories.value.length > 1 && (
          <div class="flex flex-wrap gap-1">
            <button
              key="all"
              class={`btn btn-sm ${!selectedCategory.value ? 'btn-primary' : ''}`}
              onClick={() => (selectedCategory.value = null)}
            >
              全部({store.selectedPalette.length})
            </button>
            {categories.value.map(([cat, cnt]) => (
              <button
                key={cat}
                class={`btn btn-sm ${selectedCategory.value === cat ? 'btn-primary' : ''}`}
                onClick={() => (selectedCategory.value = selectedCategory.value === cat ? null : cat)}
              >
                {categoryLabel[cat]}({cnt})
              </button>
            ))}
          </div>
        )}

        <div class="flex flex-wrap gap-0.5 max-h-40 overflow-y-auto p-1 rounded-2xl bg-background">
          {filteredPalette.value.map((col) => (
            <div
              key={col.code}
              class="w-4 h-4 rounded-full border border-black/10 flex-shrink-0 transition-transform hover:scale-150 hover:z-10"
              style={{ backgroundColor: col.hex }}
              title={`${col.code} ${col.name} (${col.hex})`}
            />
          ))}
        </div>

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

        <div class="border-t border-border/40 pt-2 space-y-2">
          <span class="text-xs text-text-secondary">预处理</span>
          <div class="flex gap-1">
            {ppModes.map((m) => (
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
      </div>
    )
  },
})
