import { defineComponent, ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from '@/i18n'
import { Globe } from 'lucide-vue-next'

export default defineComponent({
  name: 'LangSwitcher',
  setup() {
    const { locale, setLocale, locales } = useI18n()
    const open = ref(false)

    let closeTimer: ReturnType<typeof setTimeout> | null = null

    function onDocClick(e: MouseEvent) {
      const el = document.getElementById('lang-switcher')
      if (el && !el.contains(e.target as Node)) {
        open.value = false
      }
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') open.value = false
    }

    onMounted(() => {
      document.addEventListener('click', onDocClick)
      document.addEventListener('keydown', onKey)
    })
    onUnmounted(() => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onKey)
      if (closeTimer) clearTimeout(closeTimer)
    })

    function selectLang(code: string) {
      setLocale(code as Parameters<typeof setLocale>[0])
      open.value = false
    }

    function onBlur() {
      closeTimer = setTimeout(() => { open.value = false }, 150)
    }

    return () => (
      <div id="lang-switcher" class="relative">
        <button
          class="btn-icon"
          title={locale.value}
          onClick={() => { open.value = !open.value }}
          onBlur={onBlur}
        >
          <Globe size={16} />
        </button>
        {open.value && (
          <div class="absolute right-0 top-full mt-1 bg-background border border-border rounded-xl shadow-lg z-50 min-w-[140px] py-1 max-h-[50vh] overflow-y-auto">
            {locales.value.map(({ code, meta }) => (
              <button
                key={code}
                class={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-surface transition-colors ${locale.value === code ? 'text-primary font-medium' : 'text-text-secondary'}`}
                onClick={() => selectLang(code)}
              >
                <span class="flex-1">{meta.nativeName}</span>
                {locale.value === code && <span class="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  },
})
