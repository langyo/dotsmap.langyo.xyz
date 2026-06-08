import type { BrandDef } from './types'
import { fromRaw } from './types'
import raw from './coco.json'

export const coco: BrandDef = {
  id: 'coco',
  name: 'COCO',
  shortName: 'COC',
  prefix: '',
  paletteSizes: [48, 72, 88, 120, 144, 176],
  colors: raw.map(fromRaw),
}
