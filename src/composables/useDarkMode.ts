import { ref, watchEffect } from 'vue'

const isDark = ref(false)

export function useDarkMode() {
  function init() {
    const stored = localStorage.getItem('dotsmap-dark')
    if (stored !== null) {
      isDark.value = stored === 'true'
    } else {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyTheme()
  }

  function applyTheme() {
    if (isDark.value) {
      document.documentElement.setAttribute('data-mode', 'dark')
    } else {
      document.documentElement.removeAttribute('data-mode')
    }
    localStorage.setItem('dotsmap-dark', String(isDark.value))
  }

  function toggle() {
    isDark.value = !isDark.value
    applyTheme()
  }

  init()

  return { isDark, toggle }
}
