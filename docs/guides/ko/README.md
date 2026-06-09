<p align="center">
  <img src="https://raw.githubusercontent.com/langyo/dotsmap.langyo.xyz/master/logo.webp" alt="DotsMap Logo" width="128" />
</p>

<h1 align="center">DotsMap</h1>

<p align="center">
  퓨즈 비드 도안 생성기 — 이미지를 퓨즈 비드 도안으로 변환
</p>

<p align="center">
  <a href="https://github.com/langyo/dotsmap.langyo.xyz/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/langyo/dotsmap.langyo.xyz/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="https://github.com/langyo/dotsmap.langyo.xyz/blob/master/LICENSE"><img alt="License" src="https://img.shields.io/badge/license-Apache--2.0%20%2F%20MIT-blue" /></a>
  <a href="https://dotsmap.langyo.xyz"><img alt="Website" src="https://img.shields.io/website?url=https%3A%2F%2Fdotsmap.langyo.xyz" /></a>
  <img alt="Languages" src="https://img.shields.io/badge/languages-9-blue" />
</p>

---

## 기능

- 11개 비드 브랜드 색상 매칭 (MARD, COCO, 漫漫, 盼盼, 咪小窝, Perler, Hama, Artkal, Nabbi, Artkal-C, IKEA Pyssla)
- 브랜드별 맞춤 팔레트 크기 등급
- AI 색상 양자화 및 배경 제거 전처리
- 실시간 미리보기 (줌/팬, 호버 십자선 + 상태 오버레이)
- 5×5 그리드 세분화, 기본 색상 코드 표시
- 인쇄용 HD 내보내기 (비드당 256px, 브랜드 푸터 및 스와치 포함)
- 공유 이미지 내보내기 (DotsMap 브랜딩 및 QR 코드 포함)
- SVG 벡터 + CSV 데이터 파일 내보내기
- IndexedDB 상태 유지 (새로고침 후 복원)
- 다크/라이트 모드 + 9개 UI 언어
- 모바일 친화적 (PWA 지원)

## 기술 스택

Vue 3 + TypeScript + TSX + Pinia + UnoCSS + Sass

## 개발

```bash
pnpm install
pnpm dev
```

## 라이선스

Dual-licensed under [Apache-2.0](../../LICENSE-APACHE) and [MIT](../../LICENSE-MIT).
