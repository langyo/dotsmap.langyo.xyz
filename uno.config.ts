import { defineConfig, presetWind, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetWind({ preflight: false }),
    presetIcons({
      scale: 1.2,
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  theme: {
    colors: {
      primary: 'rgb(var(--color-primary) / <alpha-value>)',
      secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
      accent: 'rgb(var(--color-accent) / <alpha-value>)',
      text: {
        DEFAULT: "rgb(var(--color-text) / <alpha-value>)",
        secondary: "rgb(var(--color-text) / <alpha-value>)",
      },
      muted: 'rgb(var(--color-muted) / <alpha-value>)',
      border: 'rgb(var(--color-border) / 15%)',
      background: 'rgb(var(--color-background) / <alpha-value>)',
      surface: 'rgb(var(--color-surface) / <alpha-value>)',
      success: 'rgb(var(--color-success) / <alpha-value>)',
      error: 'rgb(var(--color-error) / <alpha-value>)',
      warning: 'rgb(var(--color-warning) / <alpha-value>)',
      info: 'rgb(var(--color-info) / <alpha-value>)',
    },
    fontFamily: {
      sans: '"Inter", ui-sans-serif, system-ui, -apple-system, blinkmacsystemfont, "Segoe UI", roboto, sans-serif',
      mono: '"JetBrains Mono", "Fira Code", ui-monospace, sfmono-regular, monospace',
    },
  },
})
