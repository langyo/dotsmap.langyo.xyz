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
      <div class="min-h-screen bg-background text-text font-sans transition-colors duration-200">
        <header class="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md px-4 py-3">
          <div class="max-w-7xl mx-auto flex items-center justify-between">
            <h1 class="text-lg font-bold tracking-tight select-none">
              <span class="text-primary">DotsMap</span>
              <span class="hidden sm:inline text-text-secondary font-normal ml-2 text-sm">
                拼豆图纸生成器
              </span>
            </h1>
            <div class="flex items-center gap-2">
              <button
                class="px-2 py-1 rounded-lg text-xs bg-surface border border-border hover:bg-primary/10 transition-all duration-150 active:scale-95"
                onClick={toggleDark}
                title={isDark.value ? '切换亮色模式' : '切换暗色模式'}
              >
                {isDark.value ? '☀' : '☾'}
              </button>
              <span class="text-xs text-text-secondary hidden md:inline">
                离线运行 · 本地处理
              </span>
            </div>
          </div>
        </header>

        <main class="max-w-7xl mx-auto p-4">
          <div class="grid lg:grid-cols-12 gap-4">
            <div class="lg:col-span-4 xl:col-span-3 space-y-3">
              <ImageUploader />
              {store.sourceDataURL && <PreprocessPanel />}
              {store.sourceDataURL && <PaletteSelector />}
            </div>

            <div class="lg:col-span-8 xl:col-span-9 space-y-3">
              <PatternCanvas />
              {store.beadPattern && <BeadLegend />}
            </div>
          </div>
        </main>

        <footer class="text-center text-xs text-text-secondary py-6 mt-8 border-t border-border">
          DotsMap — 拼豆图纸离线生成器
        </footer>
      </div>
    )
  },
})
