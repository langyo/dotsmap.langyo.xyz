import { defineComponent, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import type { PerlerColor } from '@/data/perlerColors'

export default defineComponent({
  name: 'BeadLegend',
  setup() {
    const store = useAppStore()

    const legendItems = computed(() => {
      const usage = store.colorUsage
      const palette = store.selectedPalette
      const usedColorIds = new Set(usage.keys())
      const usedColors = palette.filter((c) => usedColorIds.has(c.id))

      return usedColors.sort((a, b) => {
        const ua = usage.get(a.id) ?? 0
        const ub = usage.get(b.id) ?? 0
        return ub - ua
      })
    })

    const totalBeads = computed(() => {
      let sum = 0
      store.colorUsage.forEach((v) => (sum += v))
      return sum
    })

    return () => (
      <div class="rounded-xl border border-border bg-surface/50 p-4 space-y-3">
        <h3 class="text-sm font-semibold">
          颜色用量 ({legendItems.value.length}色 · 共{totalBeads.value}颗)
        </h3>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5">
          {legendItems.value.map((c: PerlerColor) => {
            const count = store.colorUsage.get(c.id) ?? 0
            return (
              <div key={c.id} class="flex items-center gap-1.5 text-xs">
                <div
                  class="w-3.5 h-3.5 rounded-sm border border-black/15 flex-shrink-0"
                  style={{ backgroundColor: c.hex }}
                />
                <span class="truncate">{c.name}</span>
                <span class="text-text-secondary ml-auto flex-shrink-0">×{count}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  },
})
