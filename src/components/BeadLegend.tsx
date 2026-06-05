import { defineComponent, computed, ref } from 'vue'
import { useAppStore } from '@/stores/app'
import type { BeadColor } from '@/data/perlerColors'
import { ListFilter } from 'lucide-vue-next'

export default defineComponent({
  name: 'BeadLegend',
  setup() {
    const store = useAppStore()
    const filterCode = ref<string | null>(null)

    const legendItems = computed(() => {
      const usage = store.colorUsage
      const used = store.selectedPalette.filter((c) => (usage[c.code] ?? 0) > 0)
      return used.sort((a, b) => (usage[b.code] ?? 0) - (usage[a.code] ?? 0))
    })

    const totalBeads = computed(() =>
      Object.values(store.colorUsage).reduce((s, v) => s + v, 0),
    )

    return () => (
      <div class="panel">
        <div class="flex items-center justify-between">
          <h3 class="panel-title">
            <ListFilter size={16} />
            用量统计
            <span class="font-normal text-text-secondary ml-1.5 text-xs">
              {legendItems.value.length}色 · {totalBeads.value}颗
            </span>
          </h3>
          {filterCode.value && (
            <button class="text-xs text-primary hover:underline rounded-lg px-2 py-1 hover:bg-surface/40 transition-all" onClick={() => filterCode.value = null}>
              清除筛选
            </button>
          )}
        </div>

        {filterCode.value && (
            <div class="flex items-center gap-2 text-xs p-2 rounded-2xl bg-primary/10 text-primary">
            <div class="w-4 h-4 rounded-full border border-primary/30"
              style={{ backgroundColor: store.selectedPalette.find((c) => c.code === filterCode.value)?.hex }} />
            仅显示: {legendItems.value.find((c) => c.code === filterCode.value)?.code} {legendItems.value.find((c) => c.code === filterCode.value)?.name}
          </div>
        )}

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-1">
          {legendItems.value.map((col: BeadColor) => {
            const count = store.colorUsage[col.code] ?? 0
            const active = filterCode.value === col.code
            return (
              <button
                key={col.code}
                class={`flex items-center gap-1.5 text-xs py-1.5 px-2 rounded-3xl transition-all duration-100 border border-border/30 ${
                  active ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-background'
                }`}
                onClick={() => { filterCode.value = active ? null : col.code }}
              >
                <div class="w-3.5 h-3.5 rounded-full border border-black/10 flex-shrink-0"
                  style={{ backgroundColor: col.hex }} />
                <span class="truncate flex-1 text-left">{col.code}</span>
                <span class="text-text-secondary font-mono flex-shrink-0 tabular-nums">{count}</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  },
})
