<p align="center">
  <img src="https://raw.githubusercontent.com/langyo/dotsmap.langyo.xyz/master/logo.webp" alt="DotsMap Logo" width="128" />
</p>

<h1 align="center">DotsMap</h1>

<p align="center">
  Générateur de patrons de perles à repasser — convertissez n'importe quelle image en patron de perles
</p>

<p align="center">
  <a href="https://github.com/langyo/dotsmap.langyo.xyz/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/langyo/dotsmap.langyo.xyz/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="https://github.com/langyo/dotsmap.langyo.xyz/blob/master/LICENSE"><img alt="License" src="https://img.shields.io/badge/license-Apache--2.0%20%2F%20MIT-blue" /></a>
  <a href="https://dotsmap.langyo.xyz"><img alt="Website" src="https://img.shields.io/website?url=https%3A%2F%2Fdotsmap.langyo.xyz" /></a>
  <img alt="Languages" src="https://img.shields.io/badge/languages-9-blue" />
</p>

---

## Fonctionnalités

- Correspondance des couleurs de 11 marques de perles (MARD, COCO, Manman, Panpan, Mixiaowo, Perler, Hama, Artkal, Nabbi, Artkal-C, IKEA Pyssla)
- Tailles de palette personnalisées par marque
- Quantification des couleurs par IA avec prétraitement de suppression de l'arrière-plan
- Aperçu en temps réel avec zoom/pan, réticule au survol et incrustation d'état
- Sous-divisions en grille 5×5, codes couleur affichés par défaut
- Export HD pour impression (256 px/perle, avec pied de page de marque et échantillons)
- Export d'image de partage (avec branding DotsMap et QR code)
- Export vectoriel SVG + fichier de données CSV
- Persistance d'état IndexedDB (restauration au rafraîchissement)
- Mode sombre/clair + 9 langues d'interface
- Compatible mobile (support PWA)

## Stack Technique

Vue 3 + TypeScript + TSX + Pinia + UnoCSS + Sass

## Développement

```bash
pnpm install
pnpm dev
```

## Licence

Dual-licensed under [Apache-2.0](../../LICENSE-APACHE) and [MIT](../../LICENSE-MIT).
