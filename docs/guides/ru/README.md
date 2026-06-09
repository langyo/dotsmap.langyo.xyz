<p align="center">
  <img src="https://raw.githubusercontent.com/langyo/dotsmap.langyo.xyz/master/logo.webp" alt="DotsMap Logo" width="128" />
</p>

<h1 align="center">DotsMap</h1>

<p align="center">
  Генератор схем из термомозаики — преобразует любое изображение в схему из бусин
</p>

<p align="center">
  <a href="https://github.com/langyo/dotsmap.langyo.xyz/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/langyo/dotsmap.langyo.xyz/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="https://github.com/langyo/dotsmap.langyo.xyz/blob/master/LICENSE"><img alt="License" src="https://img.shields.io/badge/license-Apache--2.0%20%2F%20MIT-blue" /></a>
  <a href="https://dotsmap.langyo.xyz"><img alt="Website" src="https://img.shields.io/website?url=https%3A%2F%2Fdotsmap.langyo.xyz" /></a>
  <img alt="Languages" src="https://img.shields.io/badge/languages-9-blue" />
</p>

---

## Возможности

- Поддержка цветов 11 брендов бусин (MARD, COCO, Manman, Panpan, Mixiaowo, Perler, Hama, Artkal, Nabbi, Artkal-C, IKEA Pyssla)
- Настраиваемые уровни палитры для каждого бренда
- Квантование цветов с помощью ИИ с предобработкой удаления фона
- Предпросмотр в реальном времени с масштабированием/прокруткой, перекрестием при наведении и оверлеем состояния
- Разбиение сетки 5×5, цветовые коды отображаются по умолчанию
- HD-экспорт для печати (256 px/бусина, с футером бренда и образцами цветов)
- Экспорт изображения для обмена (с брендингом DotsMap и QR-кодом)
- Экспорт векторного SVG + файла данных CSV
- Сохранение состояния в IndexedDB (восстановление при обновлении страницы)
- Тёмная/светлая тема + 9 языков интерфейса
- Поддержка мобильных устройств (PWA)

## Технологический стек

Vue 3 + TypeScript + TSX + Pinia + UnoCSS + Sass

## Разработка

```bash
pnpm install
pnpm dev
```

## Лицензия

Dual-licensed under [Apache-2.0](../../LICENSE-APACHE) and [MIT](../../LICENSE-MIT).
