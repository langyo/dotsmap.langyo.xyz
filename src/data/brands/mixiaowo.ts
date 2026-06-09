import type { BrandDef } from './types'
import { fromRaw } from './types'
import raw from './mixiaowo.json'

export const mixiaowo: BrandDef = {
  id: 'mixiaowo',
  name: '咪小窝',
  shortName: 'MXW',
  prefix: '',
  paletteSizes: [48, 72, 88, 120, 144, 176],
  colors: raw.map(fromRaw),
}
