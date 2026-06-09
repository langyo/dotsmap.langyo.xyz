<p align="center">
  <img src="https://raw.githubusercontent.com/langyo/dotsmap.langyo.xyz/master/logo.webp" alt="DotsMap Logo" width="128" />
</p>

<h1 align="center">DotsMap</h1>

<p align="center">
  拼豆图纸生成器 —— 将任意图片转换为拼豆图纸
</p>

<p align="center">
  <a href="https://github.com/langyo/dotsmap.langyo.xyz/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/langyo/dotsmap.langyo.xyz/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="https://github.com/langyo/dotsmap.langyo.xyz/blob/master/LICENSE"><img alt="License" src="https://img.shields.io/github/license/langyo/dotsmap.langyo.xyz" /></a>
  <a href="https://dotsmap.langyo.xyz"><img alt="Website" src="https://img.shields.io/website?url=https%3A%2F%2Fdotsmap.langyo.xyz" /></a>
  <img alt="Languages" src="https://img.shields.io/badge/languages-9-blue" />
</p>

---

## 功能特性

- 11 种拼豆品牌色彩匹配（MARD、COCO、漫漫、盼盼、咪小窝、Perler、Hama、Artkal、Nabbi、Artkal-C、宜家 Pyssla）
- 品牌专属色阶档位
- AI 色彩量化，支持背景移除预处理
- 实时预览，支持缩放/平移、悬停十字准星与状态叠加
- 5×5 网格细分，默认显示色号
- 高清打印导出（每珠 256 px，附品牌页脚与色板）
- 分享图导出（含 DotsMap 品牌标识与二维码）
- SVG 矢量 + CSV 数据文件导出
- IndexedDB 状态持久化（刷新后恢复）
- 深色/浅色模式 + 9 种界面语言
- 移动端友好（PWA 支持）

## 技术栈

Vue 3 + TypeScript + TSX + Pinia + UnoCSS + Sass

## 开发

```bash
pnpm install
pnpm dev
```

## 许可证

MIT © [langyo](https://github.com/langyo)
