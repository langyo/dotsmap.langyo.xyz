import { defineComponent, ref, watch, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useDarkMode } from '@/composables/useDarkMode'
import PreprocessPanel from './PreprocessPanel'
import PaletteSelector from './PaletteSelector'
import PatternCanvas from './PatternCanvas'
import BeadLegend from './BeadLegend'
import ColorSwatchPanel from './ColorSwatchPanel'
import { Sun, Moon, SlidersHorizontal, ListFilter, X, Info, Github } from 'lucide-vue-next'

export default defineComponent({
  name: 'DotsMapApp',
  setup() {
    const store = useAppStore()
    const { isDark, toggle: toggleDark } = useDarkMode()
    const leftOpen = ref(false)
    const rightOpen = ref(false)
    const aboutOpen = ref(false)

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

    const brandPanel = (
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
    )

    const footer = (
      <footer class="border-t border-border bg-background/80 backdrop-blur-md px-4 py-4 mt-auto">
        <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-text-secondary">
          <span>© {new Date().getFullYear()} DotsMap · 为绫波丽的拼豆爱好而作</span>
          <span>备案信息占位</span>
        </div>
      </footer>
    )

    const aboutDialog = aboutOpen.value && (
      <>
        <div class="drawer-backdrop" onClick={() => aboutOpen.value = false} />
        <div class="about-dialog animate-fade-in">
          <div class="about-dialog-header">
            <span class="text-sm font-semibold">关于 DotsMap</span>
            <button class="btn-icon" onClick={() => aboutOpen.value = false}><X size={14} /></button>
          </div>
          <div class="about-dialog-body">
            <p><span class="text-primary font-semibold">DotsMap</span> 是一个为 <span class="font-semibold">绫波丽</span> 制作的小作品，用于辅助拼豆创作，将任意图片转化为拼豆图纸。</p>
            <p>支持多品牌色号匹配，AI 色彩量化，离线使用。</p>
            <div class="about-dialog-divider" />
            <div class="flex items-center gap-3">
              <span class="text-xs text-text-secondary">作者：</span>
              <a
                href="https://github.com/langyo"
                target="_blank"
                rel="noopener noreferrer"
                class="about-link"
              >
                <Github size={13} />
                langyo
              </a>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-xs text-text-secondary">仓库：</span>
              <a
                href="https://github.com/langyo/dotsmap.langyo.xyz"
                target="_blank"
                rel="noopener noreferrer"
                class="about-link"
              >
                <Github size={13} />
                dotsmap.langyo.xyz
              </a>
            </div>
            <p class="text-xs text-text-secondary mt-2">本工具完全开源，欢迎 Star & PR。</p>
          </div>
        </div>
      </>
    )

    return () => {
      const hasSource = !!store.sourceDataURL
      const hasPattern = !!store.beadPattern
      const anyOpen = leftOpen.value || rightOpen.value

      const header = (
        <header class="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md px-4 sm:py-3 py-2">
          <div class="max-w-7xl mx-auto flex items-center justify-between">
            <h1 class="text-lg font-bold tracking-tight select-none">
              <span class="text-primary">DotsMap</span>
              <span class="hidden sm:inline text-text-secondary font-normal ml-2 text-sm">拼豆图纸生成器</span>
            </h1>
            <div class="flex items-center gap-2">
              <button class="btn-icon" onClick={() => aboutOpen.value = true} title="关于">
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
          <div class="min-h-screen flex flex-col bg-background text-text font-sans transition-colors duration-200">
            {header}
            <main class="max-w-7xl mx-auto sm:p-4 p-3 flex-1">
              <div class="grid lg:grid-cols-12 sm:gap-4 gap-3">
                <div class="lg:col-span-4 xl:col-span-3 sm:space-y-3 space-y-2">
                  {brandPanel}
                </div>
                <div class="lg:col-span-8 xl:col-span-9 sm:space-y-3 space-y-2">
                  <PatternCanvas />
                  <ColorSwatchPanel />
                </div>
              </div>
            </main>
            {footer}
            {aboutDialog}
          </div>
        )
      }

      return (
        <div class="min-h-screen flex flex-col bg-background text-text font-sans transition-colors duration-200">
          {header}
          <main class="sm:px-4 px-3 py-3 flex-1">
            <div class="drawer-layout">
              <aside class={`drawer-panel dp-l ${leftOpen.value ? 'open' : ''}`}>
                <div class="drawer-head">
                  <span class="text-sm font-semibold">配置面板</span>
                  <button class="btn-icon" onClick={() => leftOpen.value = false}><X size={14} /></button>
                </div>
                {brandPanel}
                <PreprocessPanel />
                <PaletteSelector />
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
          {aboutDialog}
        </div>
      )
    }
  },
})
