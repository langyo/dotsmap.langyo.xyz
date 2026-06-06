<p align="center">
  <h1 align="center">DotsMap</h1>
  <p align="center">拼豆图纸生成器 · Fuse Bead Pattern Generator · アイロンビーズ図案ジェネレーター<br/>Générateur de Perles à Repasser · Generador de Cuentas de Fusión · Генератор Схем для Термомозаики<br/>مولد أنماط الخرز الحراري · 퓨즈비즈 도안 생성기</p>
</p>

<p align="center">
  <a href="https://github.com/langyo/dotsmap.langyo.xyz/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/langyo/dotsmap.langyo.xyz/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="https://github.com/langyo/dotsmap.langyo.xyz/blob/master/LICENSE"><img alt="License" src="https://img.shields.io/github/license/langyo/dotsmap.langyo.xyz" /></a>
  <a href="https://dotsmap.langyo.xyz"><img alt="Website" src="https://img.shields.io/website?url=https%3A%2F%2Fdotsmap.langyo.xyz" /></a>
  <img alt="Languages" src="https://img.shields.io/badge/languages-9-blue" />
</p>

---

## 🇨🇳 简体中文

**DotsMap** 是 [langyo](https://github.com/langyo) 制作的拼豆图纸生成器，将任意图片转化为拼豆图纸。

### 功能

- 支持 11 个拼豆品牌色号匹配（MARD、COCO、漫漫、盼盼、咪小窝、Perler、Hama、Artkal、Nabbi、Artkal-C、IKEA Pyssla）
- 各品牌按淘宝套餐划分色系档位
- AI 色彩量化匹配，支持去背景预处理
- 实时预览，放大/缩小/拖拽平移，画布悬停十字线 + 色号状态栏
- 网格 5×5 分区显示，色号默认标注
- 导出高清打印图纸（256px/颗，带品牌页脚和色卡）
- 导出分享图片（带 DotsMap 品牌信息与 QR 二维码）
- 导出 SVG 矢量图 + CSV 颜色列表
- 支持 IndexedDB 状态持久化（刷新恢复）
- 暗色/亮色模式 + 9 种界面语言切换
- 移动端适配（PWA 支持）

### 技术栈

Vue 3 + TypeScript + TSX + Pinia + UnoCSS + Sass

### 本地开发

```bash
pnpm install
pnpm dev
```

---

## 🇬🇧 English

**DotsMap** is a fuse bead pattern generator by [langyo](https://github.com/langyo). It converts any image into a fuse bead pattern.

### Features

- 11 bead brand color matching (MARD, COCO, Manman, Panpan, Mixiaowo, Perler, Hama, Artkal, Nabbi, Artkal-C, IKEA Pyssla)
- Brand-customized palette size tiers
- AI color quantization with background removal preprocessing
- Real-time preview with zoom/pan, hover crosshair + status overlay
- 5×5 grid subdivisions, color codes shown by default
- HD export for printing (256px/bead, with brand footer and swatches)
- Share image export (with DotsMap branding and QR code)
- SVG vector + CSV data file export
- IndexedDB state persistence (restore on refresh)
- Dark/light mode + 9 UI languages
- Mobile friendly (PWA support)

### Tech Stack

Vue 3 + TypeScript + TSX + Pinia + UnoCSS + Sass

### Development

```bash
pnpm install
pnpm dev
```

---

## 🇯🇵 日本語

**DotsMap** は綾波レイのために作られた小さなプロジェクトで、あらゆる画像をアイロンビーズの図案に変換します。

### 機能

- 11のビーズブランドの色マッチング
- ブランド別パレットサイズ
- AI色量子化と背景除去前処理
- リアルタイムプレビュー（ズーム/パン、ホバークロスヘア + ステータス表示）
- 5×5グリッド区画、色番号デフォルト表示
- 高画質印刷用エクスポート（256px/ビーズ）
- 共有画像エクスポート（QRコード付き）
- SVG + CSVエクスポート
- IndexedDBによる状態永続化
- ダーク/ライトモード + 9言語UI
- モバイル対応（PWA）

### 技術スタック

Vue 3 + TypeScript + TSX + Pinia + UnoCSS + Sass

### 開発

```bash
pnpm install
pnpm dev
```

---

## 🇰🇷 한국어

**DotsMap**은 아야나미 레이를 위해 만든 작은 프로젝트로, 모든 이미지를 퓨즈비즈 도안으로 변환합니다.

### 기능

- 11개 비즈 브랜드 색상 매칭
- 브랜드별 팔레트 크기
- AI 색상 양자화 및 배경 제거 전처리
- 실시간 미리보기 (줌/팬, 호버 십자선 + 상태 표시)
- 5×5 그리드 구획, 색상 코드 기본 표시
- 고화질 인쇄용 내보내기 (256px/비즈)
- 공유 이미지 내보내기 (QR 코드 포함)
- SVG + CSV 내보내기
- IndexedDB 상태 저장
- 다크/라이트 모드 + 9개 언어 UI
- 모바일 지원 (PWA)

### 기술 스택

Vue 3 + TypeScript + TSX + Pinia + UnoCSS + Sass

### 개발

```bash
pnpm install
pnpm dev
```

---

## License

MIT © [langyo](https://github.com/langyo)
