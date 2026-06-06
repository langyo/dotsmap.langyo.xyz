import type { BrandDef } from './types'
import { c } from './types'
import raw from './mixiaowo.json'

export const mixiaowo: BrandDef = {
  id: 'mixiaowo',
  name: '咪小窝',
  shortName: 'MXW',
  prefix: '',
  colors: raw.map(d => c(d.code, d.name, d.hex, d.category as any, d.family as any)),
}
