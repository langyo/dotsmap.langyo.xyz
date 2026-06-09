<p align="center">
  <img src="https://raw.githubusercontent.com/langyo/dotsmap.langyo.xyz/master/logo.webp" alt="DotsMap Logo" width="128" />
</p>

<h1 align="center">DotsMap</h1>

<p align="center">
  拼豆圖紙產生器 —— 將任意圖片轉換為拼豆圖紙
</p>

<p align="center">
  <a href="https://github.com/langyo/dotsmap.langyo.xyz/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/langyo/dotsmap.langyo.xyz/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="https://github.com/langyo/dotsmap.langyo.xyz/blob/master/LICENSE"><img alt="License" src="https://img.shields.io/github/license/langyo/dotsmap.langyo.xyz" /></a>
  <a href="https://dotsmap.langyo.xyz"><img alt="Website" src="https://img.shields.io/website?url=https%3A%2F%2Fdotsmap.langyo.xyz" /></a>
  <img alt="Languages" src="https://img.shields.io/badge/languages-9-blue" />
</p>

---

## 功能特色

- 11 種拼豆品牌色彩匹配（MARD、COCO、漫漫、盼盼、咪小窩、Perler、Hama、Artkal、Nabbi、Artkal-C、IKEA Pyssla）
- 品牌專屬色階檔位
- AI 色彩量化，支援背景移除前處理
- 即時預覽，支援縮放/平移、懸停十字準星與狀態疊加
- 5×5 網格細分，預設顯示色號
- 高畫質列印匯出（每珠 256 px，附品牌頁尾與色板）
- 分享圖匯出（含 DotsMap 品牌標誌與 QR Code）
- SVG 向量 + CSV 資料檔匯出
- IndexedDB 狀態持久化（重新整理後還原）
- 深色/淺色模式 + 9 種介面語言
- 行動裝置友善（PWA 支援）

## 技術堆疊

Vue 3 + TypeScript + TSX + Pinia + UnoCSS + Sass

## 開發

```bash
pnpm install
pnpm dev
```

## 授權條款

MIT © [langyo](https://github.com/langyo)
