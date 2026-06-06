import type { BrandDef } from './types'
import { c } from './types'
import raw from './coco.json'

export const coco: BrandDef = {
  id: 'coco',
  name: 'COCO',
  shortName: 'COC',
  prefix: '',
  colors: raw.map(d => c(d.code, d.name, d.hex, d.category as any, d.family as any)),
}
