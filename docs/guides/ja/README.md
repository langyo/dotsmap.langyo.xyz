<p align="center">
  <img src="https://raw.githubusercontent.com/langyo/dotsmap.langyo.xyz/master/logo.webp" alt="DotsMap Logo" width="128" />
</p>

<h1 align="center">DotsMap</h1>

<p align="center">
  フューズビーズ図案ジェネレーター — あらゆる画像をフューズビーズ図案に変換
</p>

<p align="center">
  <a href="https://github.com/langyo/dotsmap.langyo.xyz/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/langyo/dotsmap.langyo.xyz/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="https://github.com/langyo/dotsmap.langyo.xyz/blob/master/LICENSE"><img alt="License" src="https://img.shields.io/github/license/langyo/dotsmap.langyo.xyz" /></a>
  <a href="https://dotsmap.langyo.xyz"><img alt="Website" src="https://img.shields.io/website?url=https%3A%2F%2Fdotsmap.langyo.xyz" /></a>
  <img alt="Languages" src="https://img.shields.io/badge/languages-9-blue" />
</p>

---

## 機能

- 11 ブランドのビーズカラー対応（MARD、COCO、漫漫、盼盼、咪小窩、Perler、Hama、Artkal、Nabbi、Artkal-C、IKEA Pyssla）
- ブランド別カスタムパレットサイズ
- AI カラー量子化 ＋ 背景除去前処理
- リアルタイムプレビュー（ズーム/パン、ホバークロスヘア＋ステータスオーバーレイ）
- 5×5 グリッド分割、カラーコードのデフォルト表示
- 印刷用 HD エクスポート（ビーズ 256 px、ブランドフッター・スウォッチ付き）
- シェア画像エクスポート（DotsMap ブランディング・QR コード付き）
- SVG ベクター + CSV データファイルエクスポート
- IndexedDB 状態永続化（リフレッシュ後に復元）
- ダーク/ライトモード + 9 言語 UI
- モバイル対応（PWA サポート）

## 技術スタック

Vue 3 + TypeScript + TSX + Pinia + UnoCSS + Sass

## 開発

```bash
pnpm install
pnpm dev
```

## ライセンス

MIT © [langyo](https://github.com/langyo)
