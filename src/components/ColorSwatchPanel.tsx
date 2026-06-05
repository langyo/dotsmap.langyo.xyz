import { defineComponent, ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { groupByFamily, familyOrder, familyLabel, type BeadColor, type ColorFamily } from '@/data/perlerColors'
import { SwatchBook, ChevronDown, ChevronUp } from 'lucide-vue-next'

export default defineComponent({
  name: 'ColorSwatchPanel',
  setup() {
    const store = useAppStore()
    const isExpanded = ref(false)
    const selectedFamily = ref<ColorFamily | null>(null)

    const grouped = computed(() => {
      const groups = groupByFamily(store.currentBrand.colors)
      const result: Array<{ family: ColorFamily; label: string; colors: BeadColor[] }> = []
      for (const f of familyOrder) {
        const colors = groups.get(f)
        if (colors && colors.length > 0) {
          result.push({ family: f, label: familyLabel[f], colors })
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
            <div class="flex flex-wrap gap-1">
              {grouped.value.map((g) => (
                <button
                  key={g.family}
                  class={`btn btn-sm ${selectedFamily.value === g.family ? 'btn-primary' : ''}`}
                  onClick={() => (selectedFamily.value = selectedFamily.value === g.family ? null : g.family)}
                >
                  {g.label} ({g.colors.length})
                </button>
              ))}
            </div>

            <div class="space-y-3">
              {grouped.value
                .filter((g) => !selectedFamily.value || g.family === selectedFamily.value)
                .map((g) => (
                  <div key={g.family}>
                    <div class="text-xs text-text-secondary mb-1 font-medium">{g.label}</div>
                    <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8 gap-1">
                      {g.colors.map((col) => (
                        <div key={col.code} class="flex items-center gap-1 p-1 rounded-md hover:bg-background transition-colors">
                          <div
                            class="w-5 h-5 rounded border border-black/10 flex-shrink-0"
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
