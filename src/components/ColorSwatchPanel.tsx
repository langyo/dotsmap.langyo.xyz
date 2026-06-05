import { defineComponent, ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { groupByFamily, familyOrder, familyLabel, categoryLabel, type BeadColor, type BeadCategory, type ColorFamily } from '@/data/perlerColors'
import { SwatchBook, ChevronDown, ChevronUp } from 'lucide-vue-next'

export default defineComponent({
  name: 'ColorSwatchPanel',
  setup() {
    const store = useAppStore()
    const isExpanded = ref(false)
    const selectedFamily = ref<ColorFamily | null>(null)
    const selectedCategory = ref<BeadCategory | null>(null)

    const categories = computed(() => {
      const cats = new Map<BeadCategory, number>()
      for (const c of store.currentBrand.colors) {
        cats.set(c.category, (cats.get(c.category) ?? 0) + 1)
      }
      return Array.from(cats.entries()).sort((a, b) => b[1] - a[1])
    })

    const grouped = computed(() => {
      let colors = store.currentBrand.colors
      if (selectedCategory.value) {
        colors = colors.filter((c) => c.category === selectedCategory.value)
      }
      const groups = groupByFamily(colors)
      const result: Array<{ family: ColorFamily; label: string; colors: BeadColor[] }> = []
      for (const f of familyOrder) {
        const famColors = groups.get(f)
        if (famColors && famColors.length > 0) {
          result.push({ family: f, label: familyLabel[f], colors: famColors })
        }
      }
      return result
    })

    return () => (
      <div class="panel">
        <button class="flex items-center justify-between w-full" onClick={() => (isExpanded.value = !isExpanded.value)}>
          <h3 class="panel-title">
            <SwatchBook size={16} />
            {store.currentBrand.name} 色卡
            <span class="font-normal text-text-secondary text-xs">({store.currentBrand.colors.length}色)</span>
          </h3>
          {isExpanded.value ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isExpanded.value && (
          <div class="space-y-3 animate-fade-in">
            {categories.value.length > 1 && (
              <div class="flex flex-wrap gap-1">
                <button
                  key="all-cat"
                  class={`btn btn-sm ${!selectedCategory.value ? 'btn-primary' : ''}`}
                  onClick={() => (selectedCategory.value = null)}
                >
                  全部({store.currentBrand.colors.length})
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

            <div class="flex flex-wrap gap-1">
              {grouped.value.map((g) => (
                <button
                  key={g.family}
                  class={`btn btn-sm ${selectedFamily.value === g.family ? 'btn-primary' : ''}`}
                  onClick={() => (selectedFamily.value = selectedFamily.value === g.family ? null : g.family)}
                >
                  {g.label}({g.colors.length})
                </button>
              ))}
            </div>

            <div class="space-y-3">
              {grouped.value
                .filter((g) => !selectedFamily.value || g.family === selectedFamily.value)
                .map((g) => (
                  <div key={g.family}>
                    <div class="text-xs text-text-secondary mb-1 font-medium">{g.label}</div>
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-8 gap-1">
                      {g.colors.map((col) => (
                        <div key={col.code} class="flex items-center gap-1 p-1.5 rounded-3xl bg-surface/40 hover:bg-background transition-colors border border-border/30">
                          <div
                            class="w-5 h-5 sm:w-5 sm:h-5 rounded-full border border-black/10 flex-shrink-0"
                            style={{ backgroundColor: col.hex }}
                          />
                          <div class="min-w-0">
                            <div class="text-xs font-mono leading-tight">{col.code}</div>
                            <div class="text-xs text-text-secondary truncate leading-tight">{col.name}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    )
  },
})
