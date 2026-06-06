import { ref, computed, watch } from 'vue'
import { type LocaleCode, type LocaleMessages, localeMeta, localeOrder, messages, type LocaleMeta } from './locales'
import type { BeadCategory } from '@/data/perlerColors'
import type { ColorFamily } from '@/data/brands/types'

const STORAGE_KEY = 'dotsmap-locale'

function detectBrowserLocale(): LocaleCode {
  const nav = navigator.language.toLowerCase()
  if (nav.startsWith('zh') && (nav.includes('hant') || nav.includes('tw') || nav.includes('hk') || nav.includes('mo'))) return 'zh-hant'
  if (nav.startsWith('zh')) return 'zh-hans'
  if (nav.startsWith('ja')) return 'ja'
  if (nav.startsWith('ko')) return 'ko'
  if (nav.startsWith('fr')) return 'fr'
  if (nav.startsWith('es')) return 'es'
  if (nav.startsWith('ru')) return 'ru'
  if (nav.startsWith('ar')) return 'ar'
  return 'en'
}

const locale = ref<LocaleCode>('zh-hans')
let initDone = false

export function useI18n() {
  if (!initDone) {
    initDone = true
    const stored = localStorage.getItem(STORAGE_KEY) as LocaleCode | null
    if (stored && localeMeta[stored]) {
      locale.value = stored
    } else {
      locale.value = detectBrowserLocale()
    }
  }

  const meta = computed<LocaleMeta>(() => localeMeta[locale.value])
  const t = computed<LocaleMessages>(() => messages[locale.value])

  const categoryLabel = computed<Record<BeadCategory, string>>(() => {
    const m = t.value
    return {
      solid: m.catSolid,
      pearl: m.catPearl,
      neon: m.catNeon,
      glow: m.catGlow,
      metallic: m.catMetallic,
      glitter: m.catGlitter,
      striped: m.catStriped,
    }
  })

  const familyLabel = computed<Record<ColorFamily, string>>(() => {
    const m = t.value
    return {
      white: m.famWhite,
      gray: m.famGray,
      black: m.famBlack,
      red: m.famRed,
      pink: m.famPink,
      purple: m.famPurple,
      blue: m.famBlue,
      green: m.famGreen,
      yellow: m.famYellow,
      orange: m.famOrange,
      brown: m.famBrown,
      skin: m.famSkin,
      metal: m.famMetal,
      special: m.famSpecial,
    }
  })

  watch(locale, (val) => {
    localStorage.setItem(STORAGE_KEY, val)
    document.documentElement.lang = val
    document.documentElement.dir = meta.value.dir
  }, { immediate: true })

  function setLocale(code: LocaleCode) {
    locale.value = code
  }

  const locales = computed(() => localeOrder.map((code) => ({ code, meta: localeMeta[code] })))

  return { locale, meta, t, categoryLabel, familyLabel, setLocale, locales }
}
