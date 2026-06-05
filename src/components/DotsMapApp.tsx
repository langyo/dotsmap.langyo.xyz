import { defineComponent } from 'vue'
import { useAppStore } from '@/stores/app'
import { useDarkMode } from '@/composables/useDarkMode'
import ImageUploader from './ImageUploader'
import PreprocessPanel from './PreprocessPanel'
import PaletteSelector from './PaletteSelector'
import PatternCanvas from './PatternCanvas'
import BeadLegend from './BeadLegend'
import ColorSwatchPanel from './ColorSwatchPanel'
import { Sun, Moon } from 'lucide-vue-next'

export default defineComponent({
  name: 'DotsMapApp',
  setup() {
    const store = useAppStore()
    const { isDark, toggle: toggleDark } = useDarkMode()

    return () => (
      <div class="min-h-screen bg-background text-text font-sans transition-colors duration-200">
        <header class="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md px-4 sm:py-3 py-2">
          <div class="max-w-7xl mx-auto flex items-center justify-between">
            <h1 class="text-lg font-bold tracking-tight select-none">
              <span class="text-primary">DotsMap</span>
              <span class="hidden sm:inline text-text-secondary font-normal ml-2 text-sm">拼豆图纸生成器</span>
            </h1>
            <div class="flex items-center gap-2">
              <button class="btn-icon" onClick={toggleDark} title={isDark.value ? '亮色模式' : '暗色模式'}>
                {isDark.value ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </div>
        </header>

        <main class="max-w-7xl mx-auto sm:p-4 p-3">
          <div class="grid lg:grid-cols-12 sm:gap-4 gap-3">
            <div class="lg:col-span-4 xl:col-span-3 sm:space-y-3 space-y-2">
              <div class="panel">
                <div class="panel-title text-sm">品牌</div>
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

              <ImageUploader />
              {store.sourceDataURL && <PreprocessPanel />}
              {store.sourceDataURL && <PaletteSelector />}
            </div>

            <div class="lg:col-span-8 xl:col-span-9 sm:space-y-3 space-y-2">
              <PatternCanvas />
              {store.beadPattern && <BeadLegend />}
              <ColorSwatchPanel />
            </div>
          </div>
        </main>
      </div>
    )
  },
})
