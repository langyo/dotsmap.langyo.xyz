import type { BrandDef } from './types'
import { c } from './types'
import raw from './mard.json'

export const mard: BrandDef = {
  id: 'mard',
  name: 'MARD (黄豆豆)',
  shortName: 'MARD',
  prefix: '',
  paletteSizes: [48, 72, 88, 120, 144, 176, 221],
  colors: raw.map(d => c(d.code, d.name, d.hex, d.category as any, d.family as any)),
}
