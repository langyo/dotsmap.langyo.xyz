import sharp from 'sharp'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const logo = resolve(root, 'logo.webp')
const publicDir = resolve(root, 'public')

const sizes = [16, 32, 48, 180, 192, 512]

await Promise.all([
  ...sizes.map((s) =>
    sharp(logo)
      .resize(s, s)
      .png()
      .toFile(resolve(publicDir, `favicon-${s}x${s}.png`)),
  ),
  sharp(logo).resize(32, 32).toFile(resolve(publicDir, 'favicon.ico')),
  sharp(logo).resize(192, 192).webp().toFile(resolve(publicDir, 'favicon.webp')),
  sharp(logo).resize(512, 512).webp().toFile(resolve(publicDir, 'logo-512.webp')),
])

console.log('Favicons generated.')
