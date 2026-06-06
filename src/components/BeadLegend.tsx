import { defineComponent, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { useI18n } from '@/i18n'
import type { BeadColor } from '@/data/perlerColors'
import { contrastTextColor } from '@/data/perlerColors'

export default defineComponent({
  name: 'BeadLegend',
  setup() {
    const store = useAppStore()
    const { t, tColor } = useI18n()

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
          <span class="text-xs font-medium">
            {t.value.usageStats}
            <span class="text-text-secondary font-normal ml-1.5">
              {legendItems.value.length}{t.value.colorUnit} · {totalBeads.value}{t.value.beadUnit}
            </span>
          </span>
          {store.highlightCode && (
            <button class="text-xs text-primary hover:underline" onClick={() => store.highlightCode = null}>
              {t.value.clearFilter}
            </button>
          )}
        </div>

        {store.highlightCode && (() => {
          const hc = legendItems.value.find((c) => c.code === store.highlightCode)
          return (
          <div class="flex items-center gap-2 text-xs p-2 rounded-2xl bg-primary/10 text-primary">
            <div class="w-3 h-3 rounded-full border border-primary/30"
              style={{ backgroundColor: hc?.hex }} />
            {t.value.onlyShowing}: {hc?.code} {tColor(hc?.code ?? '', hc?.name ?? '')}
          </div>
          )
        })()}

        <div class="flex flex-wrap gap-1">
          {legendItems.value.map((col: BeadColor) => {
            const active = store.highlightCode === col.code
            const textColor = contrastTextColor(col.hex)
            return (
              <button
                key={col.code}
                class={`legend-swatch ${active ? 'legend-swatch-active' : ''}`}
                style={{ '--swatch-bg': col.hex, '--swatch-text': textColor } as any}
                title={`${col.code} ${tColor(col.code, col.name)} (${store.colorUsage[col.code] ?? 0}${t.value.beadUnit})`}
                onClick={() => { store.highlightCode = active ? null : col.code }}
              >
                <span class="legend-swatch-code" style={{ color: textColor }}>{col.code}</span>
              </button>
            )
          })}
        </div>

        <div class="grid gap-1" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))' }}>
          {legendItems.value.map((col: BeadColor) => {
            const count = store.colorUsage[col.code] ?? 0
            const active = store.highlightCode === col.code
            return (
              <button
                key={col.code}
                class={`flex items-center gap-1.5 text-xs py-1 px-2 rounded-2xl transition-all border border-border/30 ${
                  active ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-background'
                }`}
                onClick={() => { store.highlightCode = active ? null : col.code }}
              >
                <div class="w-3 h-3 rounded-full border border-black/10 flex-shrink-0"
                  style={{ backgroundColor: col.hex }} />
                <span class="truncate flex-1 text-left">{col.code} {tColor(col.code, col.name)}</span>
                <span class="text-text-secondary font-mono flex-shrink-0 tabular-nums ml-auto">{count}</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  },
})
