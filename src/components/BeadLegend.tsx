import { defineComponent, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import type { PerlerColor } from '@/data/perlerColors'

export default defineComponent({
  name: 'BeadLegend',
  setup() {
    const store = useAppStore()

    const legendItems = computed(() => {
      const usage = store.colorUsage
      const usedColors = store.selectedPalette.filter((c) => usage[c.id] > 0)
      return usedColors.sort((a, b) => (usage[b.id] ?? 0) - (usage[a.id] ?? 0))
    })

    const totalBeads = computed(() => {
      return Object.values(store.colorUsage).reduce((s, v) => s + v, 0)
    })

    return () => (
      <div class="rounded-xl border border-border bg-surface/50 p-4 space-y-3">
        <h3 class="text-sm font-semibold">
          用量统计
          <span class="font-normal text-text-secondary ml-1.5">
            {legendItems.value.length}色 · {totalBeads.value}颗
          </span>
        </h3>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-1">
          {legendItems.value.map((col: PerlerColor) => (
            <div
              key={col.id}
              class="flex items-center gap-1.5 text-xs py-1 px-1.5 rounded-md hover:bg-background transition-colors"
            >
              <div
                class="w-3.5 h-3.5 rounded-sm border border-black/10 flex-shrink-0"
                style={{ backgroundColor: col.hex }}
              />
              <span class="truncate flex-1">{col.name}</span>
              <span class="text-text-secondary font-mono flex-shrink-0 tabular-nums">
                {store.colorUsage[col.id] ?? 0}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  },
})
