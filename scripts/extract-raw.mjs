import { mkdir, writeFile } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { finished } from 'node:stream/promises'
import { Readable } from 'node:stream'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { iterateWpress, isSkipPath, isPhoto, isWpDerivative, WPRESS } from './lib/wpress.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const RAW = join(ROOT, 'raw')

await mkdir(RAW, { recursive: true })

const photos = []
let sqlWritten = false

for await (const entry of iterateWpress()) {
  if (entry.path === 'database.sql') {
    const out = join(RAW, 'database.sql')
    const stream = createWriteStream(out)
    let left = entry.size
    let pos = entry.offset
    const chunk = Buffer.alloc(8 * 1024 * 1024)
    while (left > 0) {
      const n = Math.min(chunk.length, left)
      const { bytesRead } = await entry.fh.read(chunk, 0, n, pos)
      stream.write(chunk.subarray(0, bytesRead))
      pos += bytesRead
      left -= bytesRead
    }
    stream.end()
    await finished(stream)
    sqlWritten = true
    console.log('wrote database.sql', entry.size)
    continue
  }

  if (isSkipPath(entry.path)) continue
  if (!entry.path.startsWith('uploads/')) continue
  if (!isPhoto(entry.path)) continue
  if (isWpDerivative(entry.path)) continue

  photos.push({
    path: entry.path,
    size: entry.size,
    mtime: entry.mtime,
    offset: entry.offset,
  })
}

photos.sort((a, b) => a.path.localeCompare(b.path))
await writeFile(join(RAW, 'media-index.json'), JSON.stringify({ source: WPRESS, photos }, null, 2))
console.log('photos', photos.length, 'sql', sqlWritten)
console.log('bytes', photos.reduce((s, p) => s + p.size, 0))
