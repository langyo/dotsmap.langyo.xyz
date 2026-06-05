export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = reader.result as string
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export function imageToImageData(img: HTMLImageElement): ImageData {
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)
  return ctx.getImageData(0, 0, img.width, img.height)
}

export function imageDataToCanvas(imageData: ImageData): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = imageData.width
  canvas.height = imageData.height
  const ctx = canvas.getContext('2d')!
  ctx.putImageData(imageData, 0, 0)
  return canvas
}

export function removeBackground(imageData: ImageData, threshold = 30): ImageData {
  const { data, width, height } = imageData
  const result = new Uint8ClampedArray(data)

  const corners: Array<[number, number]> = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ]

  let sr = 0
  let sg = 0
  let sb = 0
  for (const [cx, cy] of corners) {
    const idx = (cy * width + cx) * 4
    sr += data[idx]
    sg += data[idx + 1]
    sb += data[idx + 2]
  }

  const avgR = sr / 4
  const avgG = sg / 4
  const avgB = sb / 4

  for (let i = 0; i < data.length; i += 4) {
    const dr = data[i] - avgR
    const dg = data[i + 1] - avgG
    const db = data[i + 2] - avgB
    if (Math.sqrt(dr * dr + dg * dg + db * db) < threshold) {
      result[i + 3] = 0
    }
  }

  return new ImageData(result, width, height)
}

export function magicWandSelect(
  imageData: ImageData,
  x: number,
  y: number,
  tolerance = 32,
): ImageData {
  const { data, width, height } = imageData
  const result = new Uint8ClampedArray(data)

  const startIdx = (y * width + x) * 4
  const targetR = data[startIdx]
  const targetG = data[startIdx + 1]
  const targetB = data[startIdx + 2]

  const visited = new Uint8Array(width * height)
  const stack: Array<[number, number]> = [[x, y]]

  while (stack.length > 0) {
    const [cx, cy] = stack.pop()!
    if (cx < 0 || cx >= width || cy < 0 || cy >= height) continue

    const vi = cy * width + cx
    if (visited[vi]) continue
    visited[vi] = 1

    const idx = vi * 4
    const dr = data[idx] - targetR
    const dg = data[idx + 1] - targetG
    const db = data[idx + 2] - targetB

    if (Math.sqrt(dr * dr + dg * dg + db * db) <= tolerance) {
      stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1])
    } else {
      result[idx + 3] = 0
    }
  }

  return new ImageData(result, width, height)
}

export function resizeImage(imageData: ImageData, maxDimension: number): ImageData {
  const { width, height } = imageData
  if (width <= maxDimension && height <= maxDimension) return imageData

  const ratio = Math.min(maxDimension / width, maxDimension / height)
  const newWidth = Math.round(width * ratio)
  const newHeight = Math.round(height * ratio)

  const srcCanvas = imageDataToCanvas(imageData)
  const dstCanvas = document.createElement('canvas')
  dstCanvas.width = newWidth
  dstCanvas.height = newHeight
  const ctx = dstCanvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(srcCanvas, 0, 0, newWidth, newHeight)

  return ctx.getImageData(0, 0, newWidth, newHeight)
}

export interface GridCell {
  r: number
  g: number
  b: number
  a: number
  x: number
  y: number
}

export function downsampleToGrid(
  imageData: ImageData,
  gridWidth: number,
  gridHeight: number,
): GridCell[] {
  const { data, width, height } = imageData
  const cellW = width / gridWidth
  const cellH = height / gridHeight
  const cells: GridCell[] = []

  for (let gy = 0; gy < gridHeight; gy++) {
    for (let gx = 0; gx < gridWidth; gx++) {
      const sx = Math.floor(gx * cellW)
      const sy = Math.floor(gy * cellH)
      const ex = Math.floor((gx + 1) * cellW)
      const ey = Math.floor((gy + 1) * cellH)

      let sr = 0
      let sg = 0
      let sb = 0
      let sa = 0
      let count = 0

      for (let py = sy; py < ey; py++) {
        for (let px = sx; px < ex; px++) {
          const idx = (py * width + px) * 4
          sr += data[idx]
          sg += data[idx + 1]
          sb += data[idx + 2]
          sa += data[idx + 3]
          count++
        }
      }

      cells.push({
        x: gx,
        y: gy,
        r: count > 0 ? Math.round(sr / count) : 0,
        g: count > 0 ? Math.round(sg / count) : 0,
        b: count > 0 ? Math.round(sb / count) : 0,
        a: count > 0 ? Math.round(sa / count) : 0,
      })
    }
  }

  return cells
}
