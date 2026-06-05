export interface PerlerColor {
  id: string
  name: string
  hex: string
  r: number
  g: number
  b: number
  category: 'solid' | 'pearl' | 'neon' | 'glow' | 'glitter' | 'striped' | 'metallic'
}

export interface PaletteSet {
  label: string
  count: number
  colors: PerlerColor[]
}

function hexToRgb(hex: string): [number, number, number] {
  const v = parseInt(hex.slice(1), 16)
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255]
}

function c(name: string, hex: string, category: PerlerColor['category'] = 'solid'): PerlerColor {
  const [r, g, b] = hexToRgb(hex)
  return { id: name.toLowerCase().replace(/\s+/g, '-'), name, hex, r, g, b, category }
}

const allPerlerColors: PerlerColor[] = [
  c('White', '#F1F1F1'),
  c('Cream', '#E0DEA9'),
  c('Light Gray', '#EEE3CF'),
  c('Gray', '#8A8D91'),
  c('Dark Gray', '#4D5156'),
  c('Black', '#2E2F32'),
  c('Red', '#F01820'),
  c('Bubblegum', '#DD669B'),
  c('Pink', '#E44892'),
  c('Light Pink', '#F6B3DD'),
  c('Raspberry', '#A53061'),
  c('Magenta', '#F22A7B'),
  c('Cranapple', '#801922'),
  c('Hot Coral', '#FF3851'),
  c('Blush', '#FF8285'),
  c('Orange', '#ED6120'),
  c('Cheddar', '#F1AA0C'),
  c('Yellow', '#ECD800'),
  c('Pastel Yellow', '#FEF875'),
  c('Prickly Pear', '#BDDA01'),
  c('Kiwi Lime', '#6CBE13'),
  c('Bright Green', '#4FAD42'),
  c('Dark Green', '#1C753E'),
  c('Light Green', '#56BA9F'),
  c('Evergreen', '#114938'),
  c('Pastel Green', '#76C882'),
  c('Toothpaste', '#93C8D4'),
  c('Light Blue', '#3370C0'),
  c('Dark Blue', '#2B3F87'),
  c('Pastel Blue', '#5390D1'),
  c('Periwinkle Blue', '#647CBE'),
  c('Blueberry Cream', '#8297D9'),
  c('Turquoise', '#2B89C6'),
  c('Purple', '#604089'),
  c('Plum', '#A24B9C'),
  c('Pastel Lavender', '#8A72C1'),
  c('Light Lavender', '#AD98D4'),
  c('Brown', '#513931'),
  c('Light Brown', '#815D34'),
  c('Tan', '#BC9371'),
  c('Sand', '#E4B690'),
  c('Rust', '#8C372C'),
  c('Peach', '#EEBAB2'),
  c('Gold', '#BB7634'),
  c('Butterscotch', '#D48437'),
  c('Glow Green', '#BEC696'),
  c('Parrot Green', '#067C81'),

  c('Neon Orange', '#FF7700', 'neon'),
  c('Neon Yellow', '#DCE002', 'neon'),
  c('Neon Green', '#019E43', 'neon'),
  c('Neon Pink', '#FF3991', 'neon'),
  c('Neon Blue', '#0066FF', 'neon'),
  c('Neon Purple', '#AA00FF', 'neon'),

  c('Pearl Coral', '#F97E79', 'pearl'),
  c('Pearl Light Pink', '#D7A8A2', 'pearl'),
  c('Pearl Yellow', '#CAC033', 'pearl'),
  c('Pearl Green', '#84B791', 'pearl'),
  c('Pearl Light Blue', '#7AAEA2', 'pearl'),
  c('Silver', '#777B81', 'pearl'),

  c('Stone', '#9E9E9E'),
  c('Caribbean Sea', '#008B8B'),
  c('Carnation', '#FFA6C9'),
  c('Cocoa', '#6B4226'),
  c('Frosted Lilac', '#D8BFD8'),
  c('Twilight Plum', '#4A3055'),
  c('Coral', '#FF7F50'),
  c('Rich Butter', '#F0C75E'),
  c('Brick', '#B22222'),
  c('Peacock', '#2FA4B2'),
  c('Sky Blue', '#87CEEB'),
  c('Mint', '#98FB98'),
  c('Apricot', '#FBCEB1'),
  c('Lemon Lime', '#E3FF00'),
  c('Teal', '#008080'),
  c('Cherry', '#DE3163'),
  c('Honey', '#EB9605'),
  c('Slate', '#708090'),
  c('Khaki', '#C3B091'),
  c('Ivory', '#FFFFF0'),
  c('Mustard', '#FFDB58'),
  c('Salmon', '#FA8072'),
  c('Fuchsia', '#FF00FF'),
  c('Maroon', '#800000'),
  c('Olive', '#808000'),
  c('Navy', '#000080'),
  c('Aqua', '#00FFFF'),
  c('Lime', '#00FF00'),
  c('Grape', '#6F2DA8'),
  c('Copper', '#B87333'),
  c('Bronze', '#CD7F32'),
  c('Platinum', '#E5E4E2'),
  c('Rose Gold', '#B76E79', 'metallic'),
  c('Arctic Blue', '#B0E0E6'),
  c('Dusty Rose', '#C9A6B8'),
  c('Sage', '#BCB88A'),
  c('Mocha', '#8B6F4E'),
  c('Mauve', '#E0B0FF'),
  c('Indigo', '#4B0082'),
  c('Violet', '#8F00FF'),
  c('Chartreuse', '#7FFF00'),
  c('Amber', '#FFBF00'),
  c('Ruby', '#E0115F'),
  c('Emerald', '#50C878'),
  c('Sapphire', '#0F52BA'),
  c('Topaz', '#FFC87C'),
  c('Jade', '#00A86B'),
  c('Garnet', '#733635'),
  c('Opal', '#A8C3BC'),
  c('Pearl White', '#F8F8FF', 'pearl'),
  c('Goldenrod', '#DAA520'),
  c('Cerulean', '#007BA7'),
  c('Crimson', '#DC143C'),
  c('Tangerine', '#F28500'),
  c('Citrine', '#E4D00A'),
  c('Peridot', '#B4C424'),
  c('Tanzanite', '#7F80CA'),
  c('Zircon', '#D4E0F0'),
  c('Onyx', '#353839'),
  c('Moss', '#8A9A5B'),
  c('Clay', '#B66A50'),
  c('Lilac', '#C8A2C8'),
  c('Ice Blue', '#E8F4F8'),
  c('Charcoal', '#36454F'),
  c('Eggplant', '#614051'),
  c('Wine', '#722F37'),
  c('Taupe', '#483C32'),
  c('Beige', '#F5F5DC'),
  c('Coffee', '#6F4E37'),
  c('Espresso', '#3B1C0A'),
  c('Denim', '#1560BD'),
  c('Army Green', '#4B5320'),
]

function hexDistance(a: PerlerColor, b: PerlerColor): number {
  const dr = a.r - b.r
  const dg = a.g - b.g
  const db = a.b - b.b
  return dr * dr + dg * dg + db * db
}

function selectDiverse(colors: PerlerColor[], count: number): PerlerColor[] {
  if (colors.length <= count) return [...colors]

  const essential: PerlerColor[] = []
  const essentialIds = new Set([
    'white', 'black', 'red', 'orange', 'yellow', 'green', 'dark-green',
    'light-blue', 'dark-blue', 'purple', 'brown', 'gray', 'pink', 'tan',
  ])
  for (const c of colors) {
    if (essentialIds.has(c.id) || essentialIds.has(c.name.toLowerCase())) {
      essential.push(c)
    }
  }

  const seen = new Set(essential.map((c) => c.id))
  const remaining = colors.filter((c) => !seen.has(c.id))
  seen.clear()

  const selected: PerlerColor[] = [...essential]

  while (selected.length < count) {
    let best: PerlerColor | null = null
    let bestMinDist = -1

    for (const c of remaining) {
      if (seen.has(c.id)) continue
      let minDist = Infinity
      for (const s of selected) {
        const d = hexDistance(c, s)
        if (d < minDist) minDist = d
      }
      if (minDist > bestMinDist) {
        bestMinDist = minDist
        best = c
      }
    }

    if (!best) break
    selected.push(best)
    seen.add(best.id)
  }

  return selected
}

function buildPalette(count: number): PerlerColor[] {
  return selectDiverse(allPerlerColors, count)
}

export const paletteSets: PaletteSet[] = [
  { label: '24色', count: 24, colors: buildPalette(24) },
  { label: '48色', count: 48, colors: buildPalette(48) },
  { label: '72色', count: 72, colors: buildPalette(72) },
  { label: '144色', count: 144, colors: buildPalette(144) },
  { label: '288色', count: 288, colors: buildPalette(Math.min(288, allPerlerColors.length)) },
]

export function getPaletteByCount(count: number): PerlerColor[] {
  const found = paletteSets.find((p) => p.count === count)
  if (found) return found.colors
  return buildPalette(count)
}

export { allPerlerColors }
