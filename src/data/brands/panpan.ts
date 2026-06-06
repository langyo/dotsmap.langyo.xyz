import type { BrandDef } from './types'
import { c } from './types'
import raw from './panpan.json'

export const panpan: BrandDef = {
  id: 'panpan',
  name: '盼盼',
  shortName: 'PP',
  prefix: '',
  colors: raw.map(d => c(d.code, d.name, d.hex, d.category as any, d.family as any)),
}
