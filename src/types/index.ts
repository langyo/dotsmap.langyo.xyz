export interface PatternCell {
  x: number
  y: number
  colorCode: string
  colorName: string
  hex: string
}

export interface BeadPattern {
  cells: PatternCell[]
  gridWidth: number
  gridHeight: number
  beadSize: number
  paletteLabel: string
  paletteCount: number
  sourceWidth: number
  sourceHeight: number
}

export type PreprocessMode = 'none' | 'remove-bg'
