import { open } from 'node:fs/promises'

export const HEADER = 4377
export const WPRESS =
  'c:/Users/israe/Downloads/carpetductcleaning-com-20260917-001904-iih2ordm40em.wpress'

function cstr(buf, start, len) {
  const end = buf.indexOf(0, start)
  const slice = buf.subarray(start, end === -1 || end > start + len ? start + len : end)
  return slice.toString('utf8').replace(/\0+$/g, '').trim()
}

export async function* iterateWpress(src = WPRESS) {
  const fh = await open(src, 'r')
  const header = Buffer.alloc(HEADER)
  let offset = 0
  try {
    while (true) {
      const { bytesRead } = await fh.read(header, 0, HEADER, offset)
      if (bytesRead < HEADER) break
      if (header.every((b) => b === 0)) break
      const name = cstr(header, 0, 255)
      const size = Number(cstr(header, 255, 14))
      const mtime = Number(cstr(header, 269, 12)) || 0
      const prefix = cstr(header, 281, 4096)
      if (!name || !Number.isFinite(size) || size < 0) break
      const path = [prefix && prefix !== '.' ? prefix : '', name].filter(Boolean).join('/').replace(/\\/g, '/')
      const bodyOffset = offset + HEADER
      yield { path, size, mtime, offset: bodyOffset, fh }
      offset = bodyOffset + size
    }
  } finally {
    await fh.close()
  }
}

export async function readEntry(src, bodyOffset, size) {
  const fh = await open(src, 'r')
  try {
    const buf = Buffer.alloc(size)
    await fh.read(buf, 0, size, bodyOffset)
    return buf
  } finally {
    await fh.close()
  }
}

export function isWpDerivative(path) {
  return /-\d{2,4}x\d{2,4}(?=\.[a-z0-9]+$)/i.test(path) || /-(scaled|rotated)(?=\.[a-z0-9]+$)/i.test(path)
}

export function isPhoto(path) {
  return /\.(jpe?g|png|webp|gif|avif|tiff?|bmp)$/i.test(path)
}

export function isSkipPath(path) {
  return (
    path.startsWith('cache/') ||
    path.startsWith('plugins/') ||
    path.startsWith('themes/') ||
    path.startsWith('mu-plugins/') ||
    path.startsWith('aiowps_backups/') ||
    path.startsWith('wp-rocket-config/') ||
    path.startsWith('litespeed/') ||
    path.startsWith('uploads/backup/') ||
    path.startsWith('uploads/wp-activity-log/') ||
    path === 'advanced-cache.php' ||
    path === 'index.php'
  )
}
