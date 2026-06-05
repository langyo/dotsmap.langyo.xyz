import { ref, onMounted, onUnmounted } from 'vue'

const isDark = ref(false)

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
    loadPreference()
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      const stored = localStorage.getItem('dotsmap-dark')
      if (stored === null) {
        isDark.value = e.matches
        applyTheme()
      }
    })
  })

  onUnmounted(() => {
    mediaQuery?.removeEventListener('change', () => {})
  })

  function toggle() {
    isDark.value = !isDark.value
    applyTheme()
  }

  return { isDark, toggle }
}
