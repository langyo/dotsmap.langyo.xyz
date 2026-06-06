import type { BrandDef } from './types'
import { c } from './types'
import raw from './manman.json'

export const manman: BrandDef = {
  id: 'manman',
  name: '漫漫',
  shortName: 'MM',
  prefix: '',
  colors: raw.map(d => c(d.code, d.name, d.hex, d.category as any, d.family as any)),
}
