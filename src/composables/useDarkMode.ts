import { ref } from 'vue'

const isDark = ref(false)
let listenerCount = 0
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

function attachMediaListener() {
  if (mediaQuery) return
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

function detachMediaListener() {
  if (mediaHandler && mediaQuery) {
    mediaQuery.removeEventListener('change', mediaHandler)
    mediaHandler = null
    mediaQuery = undefined
  }
}

export function useDarkMode() {
  listenerCount++

  if (listenerCount === 1) {
    loadPreference()
    attachMediaListener()
  }

  function toggle() {
    isDark.value = !isDark.value
    applyTheme()
  }

  function release() {
    listenerCount--
    if (listenerCount <= 0) {
      listenerCount = 0
      detachMediaListener()
    }
  }

  return { isDark, toggle, release }
}
