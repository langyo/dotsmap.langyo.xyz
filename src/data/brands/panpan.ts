import type { BrandDef } from './types'
import { fromRaw } from './types'
import raw from './panpan.json'

export const panpan: BrandDef = {
  id: 'panpan',
  name: '盼盼',
  shortName: 'PP',
  prefix: '',
  paletteSizes: [48, 72, 88, 120, 144, 176],
  colors: raw.map(fromRaw),
}
