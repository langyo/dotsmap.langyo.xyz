<p align="center">
  <img src="https://raw.githubusercontent.com/langyo/dotsmap.langyo.xyz/master/logo.webp" alt="DotsMap Logo" width="128" />
</p>

<h1 align="center">DotsMap</h1>

<p align="center">
  A fuse bead pattern generator — convert any image into a fuse bead pattern
</p>

<p align="center">
  <a href="https://github.com/langyo/dotsmap.langyo.xyz/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/langyo/dotsmap.langyo.xyz/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="https://github.com/langyo/dotsmap.langyo.xyz/blob/master/LICENSE"><img alt="License" src="https://img.shields.io/badge/license-Apache--2.0%20%2F%20MIT-blue" /></a>
  <a href="https://dotsmap.langyo.xyz"><img alt="Website" src="https://img.shields.io/website?url=https%3A%2F%2Fdotsmap.langyo.xyz" /></a>
  <img alt="Languages" src="https://img.shields.io/badge/languages-9-blue" />
</p>

---

## Features

- 11 bead brand color matching (MARD, COCO, Manman, Panpan, Mixiaowo, Perler, Hama, Artkal, Nabbi, Artkal-C, IKEA Pyssla)
- Brand-customized palette size tiers
- AI color quantization with background removal preprocessing
- Real-time preview with zoom/pan, hover crosshair + status overlay
- 5×5 grid subdivisions, color codes shown by default
- HD export for printing (256 px/bead, with brand footer and swatches)
- Share image export (with DotsMap branding and QR code)
- SVG vector + CSV data file export
- IndexedDB state persistence (restore on refresh)
- Dark/light mode + 9 UI languages
- Mobile friendly (PWA support)

## Tech Stack

Vue 3 + TypeScript + TSX + Pinia + UnoCSS + Sass

## Development

```bash
pnpm install
pnpm dev
```

## License

Dual-licensed under [Apache-2.0](../../LICENSE-APACHE) and [MIT](../../LICENSE-MIT).
