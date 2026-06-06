import type { BrandDef } from './types'
import { c } from './types'
import raw from './mard.json'

export const mard: BrandDef = {
  id: 'mard',
  name: 'MARD (黄豆豆)',
  shortName: 'MARD',
  prefix: '',
  colors: raw.map(d => c(d.code, d.name, d.hex, d.category as any, d.family as any)),
}
