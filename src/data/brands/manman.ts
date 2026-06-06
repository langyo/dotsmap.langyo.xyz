import type { BrandDef } from './types'
import { c } from './types'
import raw from './manman.json'

export const manman: BrandDef = {
  id: 'manman',
  name: '漫漫',
  shortName: 'MM',
  prefix: '',
  paletteSizes: [48, 72, 88, 120, 144, 176],
  colors: raw.map(d => c(d.code, d.name, d.hex, d.category as any, d.family as any)),
}
