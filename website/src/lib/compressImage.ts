/** Stay safely under typical PHP upload_max_filesize (often 2 Mo). */
const TARGET_BYTES = Math.floor(1.75 * 1024 * 1024)
const MAX_DIMENSION = 2400
/** Re-encode via canvas when above this size (or when still over TARGET_BYTES). */
const COMPRESS_IF_LARGER = 180 * 1024

export interface CompressResult {
  file: File
  compressed: boolean
  originalSize: number
  finalSize: number
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Impossible de lire cette image.'))
    }
    img.src = url
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('Compression échouée'))),
      type,
      quality,
    )
  })
}

function scaleDimensions(width: number, height: number, maxW: number, maxH: number) {
  const ratio = Math.min(1, maxW / width, maxH / height)
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  }
}

function outputExtension(mime: string): string {
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  return 'jpg'
}

/** Formats sent as-is (no canvas re-encode). Must already fit TARGET_BYTES. */
const PASS_THROUGH_TYPES = new Set([
  'image/gif',
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon',
])

function tooLargeMessage(): string {
  return `Fichier trop volumineux après compression (max ${Math.round(TARGET_BYTES / 1024 / 1024 * 10) / 10} Mo).`
}

function pickOutputType(file: File, forceJpeg: boolean): string {
  if (forceJpeg) return 'image/jpeg'
  if (file.type === 'image/png') return 'image/png'
  if (file.type === 'image/webp') return 'image/webp'
  return 'image/jpeg'
}

/**
 * Resize & re-encode raster images via canvas before upload.
 * Keeps output under ~1.75 Mo for PHP upload limits.
 */
const RASTER_NAME = /\.(jpe?g|png|gif|webp|avif|bmp|jfif)$/i

export async function compressImage(file: File): Promise<CompressResult> {
  const looksImage = file.type.startsWith('image/') || RASTER_NAME.test(file.name)
  if (!looksImage) {
    throw new Error('Le fichier doit être une image.')
  }

  if (PASS_THROUGH_TYPES.has(file.type)) {
    if (file.size <= TARGET_BYTES) {
      return { file, compressed: false, originalSize: file.size, finalSize: file.size }
    }
    throw new Error(
      `${file.type.includes('svg') ? 'SVG' : 'GIF/ICO'} trop volumineux (max ${Math.round(TARGET_BYTES / 1024 / 1024 * 10) / 10} Mo).`,
    )
  }

  if (file.size <= COMPRESS_IF_LARGER) {
    return { file, compressed: false, originalSize: file.size, finalSize: file.size }
  }

  const img = await loadImage(file)
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'image'

  let maxW = MAX_DIMENSION
  let maxH = MAX_DIMENSION
  let { width, height } = scaleDimensions(img.naturalWidth, img.naturalHeight, maxW, maxH)
  let forceJpeg = false
  let mime = pickOutputType(file, forceJpeg)
  let blob: Blob | null = null

  const draw = () => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas non disponible')
    if (mime === 'image/jpeg') {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
    }
    ctx.drawImage(img, 0, 0, width, height)
    return canvas
  }

  for (let attempt = 0; attempt < 16; attempt++) {
    mime = pickOutputType(file, forceJpeg)
    let quality = mime === 'image/png' ? 0.92 : 0.88

    for (let qPass = 0; qPass < 8; qPass++) {
      blob = await canvasToBlob(draw(), mime, quality)
      if (blob.size <= TARGET_BYTES) break
      if (mime !== 'image/png' && quality > 0.5) {
        quality -= 0.08
        continue
      }
      break
    }

    if (blob && blob.size <= TARGET_BYTES) break

    if (mime === 'image/png' && !forceJpeg) {
      forceJpeg = true
      continue
    }

    maxW = Math.round(maxW * 0.78)
    maxH = Math.round(maxH * 0.78)
    ;({ width, height } = scaleDimensions(img.naturalWidth, img.naturalHeight, maxW, maxH))
  }

  if (!blob) throw new Error('Compression échouée')
  if (blob.size > TARGET_BYTES) throw new Error(tooLargeMessage())

  const ext = outputExtension(mime)
  const compressedFile = new File([blob], `${baseName}.${ext}`, {
    type: mime,
    lastModified: Date.now(),
  })

  return {
    file: compressedFile,
    compressed: true,
    originalSize: file.size,
    finalSize: compressedFile.size,
  }
}
