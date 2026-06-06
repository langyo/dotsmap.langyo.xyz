import { defineComponent, ref, computed, watch, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useImageProcessing } from '@/composables/useImageProcessing'
import { useI18n } from '@/i18n'
import type { BeadCategory } from '@/data/perlerColors'

export default defineComponent({
  name: 'PaletteSelector',
  setup() {
    const store = useAppStore()
    const { applyPreprocessing } = useImageProcessing()
    const { t, categoryLabel, colorLabel } = useI18n()
    const selectedCategory = ref<BeadCategory | null>(null)

    let ppTimer: ReturnType<typeof setTimeout> | null = null
    watch(() => [store.preprocessMode, store.bgThreshold] as const, () => {
      if (!store.sourceImage || store.isRestoring) return
      if (ppTimer) clearTimeout(ppTimer)
      ppTimer = setTimeout(() => applyPreprocessing(), 80)
    })
    onUnmounted(() => { if (ppTimer) clearTimeout(ppTimer) })

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

    const ppModes = computed(() => [
      { value: 'none' as const, label: t.value.ppNone },
      { value: 'remove-bg' as const, label: t.value.ppRemoveBg },
    ])

    const i18nPaletteOptions = computed(() =>
      store.paletteOptions.map((opt) => ({
        ...opt,
        i18nLabel: opt.count === store.currentBrand.colors.length ? t.value.all : `${opt.count}${t.value.colorUnit}`,
      })),
    )

    return () => (
      <div class="panel space-y-3">
        <div class="space-y-1.5">
          <span class="text-xs text-text-secondary">{t.value.beadBrand}</span>
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
          <p class="text-xs text-text-secondary">{store.currentBrand.name} · {store.currentBrand.colors.length}{t.value.colorUnit}</p>
        </div>

        <div class="space-y-1.5">
          <span class="text-xs text-text-secondary">{t.value.beadPalette}</span>
          <div class="flex flex-wrap gap-1">
            {i18nPaletteOptions.value.map((opt) => (
              <button
                key={opt.count}
                class={`btn btn-sm ${store.selectedPaletteCount === opt.count ? 'btn-primary' : ''}`}
                onClick={() => store.setPalette(opt.count)}
              >
                {opt.i18nLabel}
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
                {t.value.all}({store.selectedPalette.length})
            </button>
            {categories.value.map(([cat, cnt]) => (
              <button
                key={cat}
                class={`btn btn-sm ${selectedCategory.value === cat ? 'btn-primary' : ''}`}
                onClick={() => (selectedCategory.value = selectedCategory.value === cat ? null : cat)}
              >
                {categoryLabel.value[cat]}({cnt})
              </button>
            ))}
          </div>
        )}

        <div class="flex flex-wrap gap-0.5 p-1 rounded-2xl bg-background">
          {filteredPalette.value.map((col) => (
            <div
              key={col.code}
              class="flex flex-col items-center transition-transform hover:scale-125 hover:z-10 cursor-default"
              style={{ width: '28px' }}
              title={`${colorLabel(col.code, col.name)} (${col.hex})`}
            >
              <div
                class="w-5 h-5 rounded-full border border-black/10 flex-shrink-0"
                style={{ backgroundColor: col.hex }}
              />
              <span class="text-[8px] leading-tight font-mono mt-0.5 truncate w-full text-center select-none" style={{ color: 'var(--text-secondary)' }}>{col.code}</span>
            </div>
          ))}
        </div>

        <div class="flex gap-2 text-xs">
          <label class="flex-1">
            <span class="text-text-secondary">{t.value.width}</span>
            <input type="number" class="input mt-1" value={store.gridWidth} min={1} max={200}
              onChange={(e) => { const v = parseInt((e.target as HTMLInputElement).value, 10); if (v > 0) store.setGridSize(v, store.gridHeight) }} />
          </label>
          <label class="flex-1">
            <span class="text-text-secondary">{t.value.height}</span>
            <input type="number" class="input mt-1" value={store.gridHeight} min={1} max={200}
              onChange={(e) => { const v = parseInt((e.target as HTMLInputElement).value, 10); if (v > 0) store.setGridSize(store.gridWidth, v) }} />
          </label>
        </div>

        <div class="border-t border-border/40 pt-2 space-y-2">
          <span class="text-xs text-text-secondary">{t.value.preprocessing}</span>
          <div class="flex gap-1">
            {ppModes.value.map((m) => (
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
                <span>{t.value.bgThreshold}</span>
                <span class="font-mono">{store.bgThreshold}</span>
              </div>
              <input type="range" class="w-full" min={1} max={120} value={store.bgThreshold}
                onInput={(e) => (store.bgThreshold = parseInt((e.target as HTMLInputElement).value))} />
            </label>
          )}
        </div>
      </div>
    )
  },
})
