const DB_NAME = 'dotsmap'
const STORE_NAME = 'state'
const KEY = 'app-state'
const MAX_PERSIST_DIM = 256
const PERSIST_QUALITY = 0.7

export interface PersistedState {
  sourceDataURL: string
  brandId: string
  paletteCount: number
  gridWidth: number
  gridHeight: number
  preprocessMode: string
  bgThreshold: number
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function compressDataURL(dataURL: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const { width, height } = img
      if (width <= MAX_PERSIST_DIM && height <= MAX_PERSIST_DIM) {
        resolve(dataURL)
        return
      }
      const ratio = Math.min(MAX_PERSIST_DIM / width, MAX_PERSIST_DIM / height)
      const newW = Math.round(width * ratio)
      const newH = Math.round(height * ratio)
      const canvas = document.createElement('canvas')
      canvas.width = newW
      canvas.height = newH
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, newW, newH)
      resolve(canvas.toDataURL('image/jpeg', PERSIST_QUALITY))
    }
    img.onerror = () => resolve(dataURL)
    img.src = dataURL
  })
}

export async function saveState(state: PersistedState): Promise<void> {
  const compressed = await compressDataURL(state.sourceDataURL)
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put({ ...state, sourceDataURL: compressed }, KEY)
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => { db.close(); reject(tx.error) }
  })
}

export async function loadState(): Promise<PersistedState | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(KEY)
    req.onsuccess = () => { db.close(); resolve(req.result ?? null) }
    req.onerror = () => { db.close(); reject(req.error) }
  })
}

export async function clearState(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(KEY)
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => { db.close(); reject(tx.error) }
  })
}
