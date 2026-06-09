<p align="center">
  <img src="https://raw.githubusercontent.com/langyo/dotsmap.langyo.xyz/master/logo.webp" alt="DotsMap Logo" width="128" />
</p>

<h1 align="center">DotsMap</h1>

<p align="center">
  Generador de patrones de cuentas fusible — convierte cualquier imagen en un patrón de cuentas
</p>

<p align="center">
  <a href="https://github.com/langyo/dotsmap.langyo.xyz/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/langyo/dotsmap.langyo.xyz/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="https://github.com/langyo/dotsmap.langyo.xyz/blob/master/LICENSE"><img alt="License" src="https://img.shields.io/github/license/langyo/dotsmap.langyo.xyz" /></a>
  <a href="https://dotsmap.langyo.xyz"><img alt="Website" src="https://img.shields.io/website?url=https%3A%2F%2Fdotsmap.langyo.xyz" /></a>
  <img alt="Languages" src="https://img.shields.io/badge/languages-9-blue" />
</p>

---

## Características

- Correspondencia de colores de 11 marcas de cuentas (MARD, COCO, Manman, Panpan, Mixiaowo, Perler, Hama, Artkal, Nabbi, Artkal-C, IKEA Pyssla)
- Niveles de tamaño de paleta personalizados por marca
- Cuantización de color por IA con preprocesamiento de eliminación de fondo
- Vista previa en tiempo real con zoom/pan, punto de mira al pasar el cursor y superposición de estado
- Subdivisiones de cuadrícula 5×5, códigos de color mostrados por defecto
- Exportación HD para impresión (256 px/cuenta, con pie de página de marca y muestras de color)
- Exportación de imagen para compartir (con marca DotsMap y código QR)
- Exportación vectorial SVG + archivo de datos CSV
- Persistencia de estado en IndexedDB (restauración al actualizar)
- Modo oscuro/claro + 9 idiomas de interfaz
- Compatible con dispositivos móviles (soporte PWA)

## Stack Tecnológico

Vue 3 + TypeScript + TSX + Pinia + UnoCSS + Sass

## Desarrollo

```bash
pnpm install
pnpm dev
```

## Licencia

MIT © [langyo](https://github.com/langyo)
