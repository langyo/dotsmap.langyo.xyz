import { defineComponent } from 'vue'
import { useAppStore } from '@/stores/app'
import { useDarkMode } from '@/composables/useDarkMode'
import ImageUploader from './ImageUploader'
import PreprocessPanel from './PreprocessPanel'
import PaletteSelector from './PaletteSelector'
import PatternCanvas from './PatternCanvas'
import BeadLegend from './BeadLegend'

export default defineComponent({
  name: 'DotsMapApp',
  setup() {
    const store = useAppStore()
    const { isDark, toggle: toggleDark } = useDarkMode()

    return () => (
      <div class="min-h-screen bg-background text-text font-sans">
        <header class="border-b border-border px-4 py-3">
          <div class="max-w-7xl mx-auto flex items-center justify-between">
            <h1 class="text-xl font-bold tracking-tight">
              <span class="text-primary">DotsMap</span> 拼豆图纸生成器
            </h1>
            <div class="flex items-center gap-3">
              <button
                class="px-2.5 py-1 rounded-lg text-xs bg-surface border border-border hover:bg-primary/10 transition-colors"
                onClick={toggleDark}
              >
                {isDark.value ? '☀️ 亮色' : '🌙 暗色'}
              </button>
              <span class="text-xs text-text-secondary hidden sm:inline">
                离线运行 · 图片处理在本地完成
              </span>
            </div>
          </div>
        </header>

        <main class="max-w-7xl mx-auto p-4">
          <div class="grid lg:grid-cols-3 gap-6">
            <div class="lg:col-span-1 space-y-4">
              <ImageUploader />
              {store.sourceDataURL && <PreprocessPanel />}
              {store.sourceDataURL && <PaletteSelector />}
            </div>

            <div class="lg:col-span-2 space-y-4">
              <PatternCanvas />
              {store.beadPattern && <BeadLegend />}
            </div>
          </div>
        </main>
      </div>
    )
  },
})
