import { ref, onMounted, onUnmounted } from 'vue'

const isDark = ref(false)
let initialized = false
let mediaHandler: ((e: MediaQueryListEvent) => void) | null = null
let mediaQuery: MediaQueryList | undefined

function applyTheme() {
  if (isDark.value) {
    document.documentElement.setAttribute('data-mode', 'dark')
  } else {
    document.documentElement.removeAttribute('data-mode')
  }
  localStorage.setItem('dotsmap-dark', String(isDark.value))
}

function loadPreference() {
  const stored = localStorage.getItem('dotsmap-dark')
  if (stored !== null) {
    isDark.value = stored === 'true'
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyTheme()
}

export function useDarkMode() {
  onMounted(() => {
    if (!initialized) {
      initialized = true
      loadPreference()
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaHandler = (e: MediaQueryListEvent) => {
        const stored = localStorage.getItem('dotsmap-dark')
        if (stored === null) {
          isDark.value = e.matches
          applyTheme()
        }
      }
      mediaQuery.addEventListener('change', mediaHandler)
    }
  })

  onUnmounted(() => {
    if (mediaHandler && mediaQuery) {
      mediaQuery.removeEventListener('change', mediaHandler)
      mediaHandler = null
      initialized = false
    }
  })

  function toggle() {
    isDark.value = !isDark.value
    applyTheme()
  }

  return { isDark, toggle }
}
