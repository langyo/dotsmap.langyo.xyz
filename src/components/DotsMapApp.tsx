import { defineComponent, ref, watch, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useDarkMode } from '@/composables/useDarkMode'
import PreprocessPanel from './PreprocessPanel'
import PaletteSelector from './PaletteSelector'
import PatternCanvas from './PatternCanvas'
import BeadLegend from './BeadLegend'
import ColorSwatchPanel from './ColorSwatchPanel'
import { Sun, Moon, SlidersHorizontal, ListFilter, X, Info } from 'lucide-vue-next'

export default defineComponent({
  name: 'DotsMapApp',
  setup() {
    const store = useAppStore()
    const { isDark, toggle: toggleDark } = useDarkMode()
    const showAbout = ref(false)
    const leftOpen = ref(false)
    const rightOpen = ref(false)

    watch(() => store.sourceDataURL, (val) => {
      if (!val) {
        leftOpen.value = false
        rightOpen.value = false
      }
    })

    function toggleLeft() {
      leftOpen.value = !leftOpen.value
      if (leftOpen.value) rightOpen.value = false
    }

    function toggleRight() {
      rightOpen.value = !rightOpen.value
      if (rightOpen.value) leftOpen.value = false
    }

    function closeAll() {
      leftOpen.value = false
      rightOpen.value = false
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeAll()
    }

    onMounted(() => window.addEventListener('keydown', onKey))
    onUnmounted(() => window.removeEventListener('keydown', onKey))

    return () => {
      const hasSource = !!store.sourceDataURL
      const hasPattern = !!store.beadPattern
      const anyOpen = leftOpen.value || rightOpen.value

      const aboutModal = showAbout.value && (
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => showAbout.value = false}>
          <div class="bg-surface rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-bold">关于 DotsMap</h2>
              <button class="btn-icon" onClick={() => showAbout.value = false}><X size={16} /></button>
            </div>
            <p class="text-sm text-text-secondary leading-relaxed mb-3">
              DotsMap 是一款拼豆图纸生成器，可以将任意图片转换为拼豆图纸，支持多种品牌拼豆色系、图片预处理（去背景/魔术棒选区）以及缩放平移预览。
            </p>
            <p class="text-xs text-text-tertiary">
              上传图片即可自动生成图纸，左侧面板可调整品牌、色系和预处理参数。
            </p>
          </div>
        </div>
      )

      const footer = (
        <footer class="border-t border-border px-4 py-4 text-center text-xs text-text-secondary">
          <p>DotsMap · 拼豆图纸生成器</p>
        </footer>
      )

      const header = (
        <header class="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md px-4 sm:py-3 py-2">
          <div class="max-w-7xl mx-auto flex items-center justify-between">
            <h1 class="text-lg font-bold tracking-tight select-none">
              <span class="text-primary">DotsMap</span>
              <span class="hidden sm:inline text-text-secondary font-normal ml-2 text-sm">拼豆图纸生成器</span>
            </h1>
            <div class="flex items-center gap-2">
              <button class="btn-icon" onClick={() => showAbout.value = true} title="关于">
                <Info size={16} />
              </button>
              <button class="btn-icon" onClick={toggleDark} title={isDark.value ? '亮色模式' : '暗色模式'}>
                {isDark.value ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </div>
        </header>
      )

      if (!hasSource) {
        return (
          <div class="min-h-screen bg-background text-text font-sans transition-colors duration-200 flex flex-col">
            {header}
            <main class="max-w-7xl mx-auto sm:p-4 p-3 flex-1">
              <div class="grid lg:grid-cols-12 sm:gap-4 gap-3">
                <div class="lg:col-span-4 xl:col-span-3 sm:space-y-3 space-y-2">
                  <PaletteSelector />
                </div>
                <div class="lg:col-span-8 xl:col-span-9 sm:space-y-3 space-y-2">
                  <PatternCanvas />
                  <ColorSwatchPanel />
                </div>
              </div>
            </main>
            {footer}
            {aboutModal}
          </div>
        )
      }

      return (
        <div class="min-h-screen bg-background text-text font-sans transition-colors duration-200 flex flex-col">
          {header}
          <main class="sm:px-4 px-3 py-3 flex-1">
            <div class="drawer-layout">
              <aside class={`drawer-panel dp-l ${leftOpen.value ? 'open' : ''}`}>
                <div class="drawer-head">
                  <span class="text-sm font-semibold">配置面板</span>
                  <button class="btn-icon" onClick={() => leftOpen.value = false}><X size={14} /></button>
                </div>
                <PaletteSelector />
                <PreprocessPanel />
              </aside>

              <div class="flex-1 min-w-0">
                <PatternCanvas />
              </div>

              {hasPattern && (
                <aside class={`drawer-panel dp-r ${rightOpen.value ? 'open' : ''}`}>
                  <div class="drawer-head">
                    <span class="text-sm font-semibold">统计 & 色卡</span>
                    <button class="btn-icon" onClick={() => rightOpen.value = false}><X size={14} /></button>
                  </div>
                  <BeadLegend />
                  <ColorSwatchPanel />
                </aside>
              )}
            </div>
          </main>

          <button class="drawer-toggle dt-l" onClick={toggleLeft} title="配置面板">
            <SlidersHorizontal size={14} />
          </button>
          {hasPattern && (
            <button class="drawer-toggle dt-r" onClick={toggleRight} title="统计 & 色卡">
              <ListFilter size={14} />
            </button>
          )}

          {anyOpen && <div class="drawer-backdrop" onClick={closeAll} />}
          {footer}
          {aboutModal}
        </div>
      )
    }
  },
})
