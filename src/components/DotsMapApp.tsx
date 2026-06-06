import { defineComponent, ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useAppStore } from '@/stores/app'
import { useDarkMode } from '@/composables/useDarkMode'
import { useImageProcessing } from '@/composables/useImageProcessing'
import PaletteSelector from './PaletteSelector'
import PatternCanvas from './PatternCanvas'
import BeadLegend from './BeadLegend'
import { Sun, Moon, Menu, X, Info, Github, RotateCcw } from 'lucide-vue-next'
import { saveState, loadState, clearState } from '@/utils/persistence'

export default defineComponent({
  name: 'DotsMapApp',
  setup() {
    const store = useAppStore()
    const { isDark, toggle: toggleDark } = useDarkMode()
    const { generatePattern, applyPreprocessing } = useImageProcessing()
    const showAbout = ref(false)
    const leftOpen = ref(false)

    watch(() => store.sourceDataURL, (val) => {
      if (!val) leftOpen.value = false
    })

    watch(
      () => [store.currentBrand.id, store.selectedPaletteCount, store.gridWidth, store.gridHeight] as const,
      () => {
        if (store.sourceImage && !store.isRestoring) generatePattern()
      },
    )

    watch(() => store.beadPattern, async (p) => {
      if (p && store.sourceDataURL) {
        try {
          await saveState({
            sourceDataURL: store.sourceDataURL,
            brandId: store.currentBrand.id,
            paletteCount: store.selectedPaletteCount,
            gridWidth: store.gridWidth,
            gridHeight: store.gridHeight,
            preprocessMode: store.preprocessMode,
            bgThreshold: store.bgThreshold,
          })
        } catch { /* ignore */ }
      }
    })

    function handleHeaderReset() {
      if (!confirm('确定要重置吗？当前图纸和上传的图片将会丢失。')) return
      store.resetAll()
      clearState()
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') leftOpen.value = false
    }

    onMounted(async () => {
      window.addEventListener('keydown', onKey)

      try {
        const saved = await loadState()
        if (!saved) return
        const img = new Image()
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = () => reject()
          img.src = saved.sourceDataURL
        })
        store.isRestoring = true
        store.restoreFromPersisted(saved, img)
        await nextTick()
        store.isRestoring = false
        if (saved.preprocessMode === 'remove-bg') {
          applyPreprocessing()
        } else {
          generatePattern()
        }
      } catch {
        store.isRestoring = false
      }
    })
    onUnmounted(() => window.removeEventListener('keydown', onKey))

    return () => {
      const hasSource = !!store.sourceDataURL
      const hasPattern = !!store.beadPattern

      const footer = (
        <footer class="border-t border-border bg-background/80 backdrop-blur-md px-4 py-3 flex-shrink-0">
          <div class="flex items-center justify-center text-xs text-text-secondary px-2">
            <span>© {new Date().getFullYear()} dotsmap.langyo.xyz</span>
          </div>
        </footer>
      )

      const aboutOverlay = (
        <div class={`about-overlay ${showAbout.value ? 'about-visible' : 'about-hidden'}`}>
          <div class="about-backdrop" onClick={() => showAbout.value = false} />
          <div class="about-dialog">
            <div class="about-dialog-header">
              <span class="text-sm font-semibold">关于 DotsMap</span>
              <button class="btn-icon" onClick={() => showAbout.value = false}><X size={14} /></button>
            </div>
            <div class="about-dialog-body">
              <p><span class="text-primary font-semibold">DotsMap</span> 是一个为 <span class="font-semibold">绫波丽</span> 制作的小作品，用于辅助拼豆创作，将任意图片转化为拼豆图纸。</p>
              <p>支持多品牌色号匹配，AI 色彩量化，离线使用。</p>
              <div class="about-dialog-divider" />
              <div class="flex items-center gap-3">
                <span class="text-xs text-text-secondary">作者：</span>
                <a href="https://github.com/langyo" target="_blank" rel="noopener noreferrer" class="about-link">
                  <Github size={13} />
                  langyo
                </a>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-xs text-text-secondary">仓库：</span>
                <a href="https://github.com/langyo/dotsmap.langyo.xyz" target="_blank" rel="noopener noreferrer" class="about-link">
                  <Github size={13} />
                  dotsmap.langyo.xyz
                </a>
              </div>
              <p class="text-xs text-text-secondary mt-2">本工具完全开源，欢迎 Star & PR。</p>
            </div>
          </div>
        </div>
      )

      const header = (
        <header class="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md px-3 py-2 flex-shrink-0">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              {hasSource && (
                <button class="btn-icon lg:!hidden" onClick={() => leftOpen.value = !leftOpen.value} title="配置面板">
                  <Menu size={18} />
                </button>
              )}
              <h1 class="text-lg font-bold tracking-tight select-none">
                <span class="text-primary">DotsMap</span>
                <span class="hidden sm:inline text-text-secondary font-normal ml-2 text-sm">拼豆图纸生成器</span>
              </h1>
            </div>
            <div class="flex items-center gap-1.5">
              {hasSource && (
                <button class="btn-icon" onClick={handleHeaderReset} title="重置">
                  <RotateCcw size={16} />
                </button>
              )}
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
          <div class="min-h-screen bg-background text-text font-sans transition-colors duration-300 flex flex-col">
            {header}
            <main class="p-3 flex-1">
              <div class="flex flex-col gap-3 lg:grid lg:grid-cols-[320px_1fr]">
                <div class="order-1 lg:order-2">
                  <PatternCanvas />
                </div>
                <div class="order-2 lg:order-1 space-y-2">
                  <PaletteSelector />
                </div>
              </div>
            </main>
            {footer}
            {aboutOverlay}
          </div>
        )
      }

      return (
        <div class="h-[100dvh] bg-background text-text font-sans transition-colors duration-300 flex flex-col">
          {header}

          {/* body: aside | canvas */}
          <div class="flex-1 min-h-0 flex p-3 gap-3">
            {/* desktop sidebar */}
            <aside class="hidden lg:flex flex-col w-80 flex-shrink-0 min-h-0 overflow-y-auto pr-3 border-r border-border gap-3">
              {hasPattern && <BeadLegend />}
              <PaletteSelector />
            </aside>

            {/* canvas */}
            <div class="flex-1 min-h-0">
              <PatternCanvas fullHeight />
            </div>
          </div>

          {footer}

          {/* mobile drawer */}
          {leftOpen.value && (
            <div class="fixed inset-0 z-[29] bg-black/25 lg:hidden" onClick={() => leftOpen.value = false} />
          )}
          <aside
            class="fixed inset-y-0 left-0 z-30 w-[85vw] bg-background p-4 flex flex-col gap-3 overflow-y-auto border-r border-border lg:hidden"
            style={{
              transform: leftOpen.value ? 'translateX(0)' : 'translateX(-100%)',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div class="flex items-center justify-between pb-2 border-b border-border/10">
              <span class="text-sm font-semibold">配置面板</span>
              <button class="btn-icon" onClick={() => leftOpen.value = false}><X size={14} /></button>
            </div>
            {hasPattern && <BeadLegend />}
            <PaletteSelector />
          </aside>

          {aboutOverlay}
        </div>
      )
    }
  },
})
