import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises'
import { dirname, join, posix } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { readEntry, WPRESS } from './lib/wpress.mjs'

const require = createRequire(import.meta.url)
const sharp = require(join(dirname(fileURLToPath(import.meta.url)), '../../../node_modules/sharp'))

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const RAW = join(ROOT, 'raw')
const MEDIA = join(ROOT, 'media', 'webp')
const TESS = 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe'
const CONCURRENCY = 5

const index = JSON.parse(await readFile(join(RAW, 'media-index.json'), 'utf8'))
let wpMedia = []
try {
  wpMedia = JSON.parse(await readFile(join(ROOT, 'content', 'media-wp.json'), 'utf8'))
} catch {}
const used = new Set()
try {
  for (const f of JSON.parse(await readFile(join(ROOT, 'content', 'used-media.json'), 'utf8'))) used.add(f.replace(/\\/g, '/'))
} catch {}

const byFile = new Map()
for (const m of wpMedia) {
  if (m.file) byFile.set(m.file.replace(/\\/g, '/'), m)
}

function slugTags(...parts) {
  const tags = new Set()
  for (const part of parts) {
    const words = String(part || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/[\s/_-]+/)
      .filter((w) => w.length >= 3 && !/^(the|and|for|with|from|this|that|your|our|img|image|jpeg|jpg|png|webp|dsc|copy)$/.test(w))
    for (const w of words) tags.add(w)
  }
  return [...tags]
}

function ocr(buffer) {
  return new Promise((resolve) => {
    const child = spawn(TESS, ['stdin', 'stdout', '--psm', '6', '-l', 'eng'], {
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    let out = ''
    child.stdout.on('data', (d) => (out += d))
    child.on('error', () => resolve(''))
    child.on('close', () => resolve(out.replace(/\s+/g, ' ').trim()))
    child.stdin.write(buffer)
    child.stdin.end()
  })
}

await mkdir(MEDIA, { recursive: true })
const seenHash = new Map()
const manifest = []
let done = 0

async function processOne(photo) {
  const rel = photo.path.replace(/^uploads\//, '')
  const destRel = rel.replace(/\.[a-z0-9]+$/i, '.webp')
  const dest = join(MEDIA, destRel)
  await mkdir(dirname(dest), { recursive: true })

  const raw = await readEntry(WPRESS, photo.offset, photo.size)
  const hash = createHash('sha1').update(raw).digest('hex')
  const wp = byFile.get(rel) || {}

  let info
  let webp
  try {
    const img = sharp(raw, { failOn: 'none', animated: false }).rotate()
    info = await img.metadata()
    webp = await img
      .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 78, effort: 4 })
      .toBuffer()
    await writeFile(dest, webp)
  } catch (err) {
    manifest.push({
      source: photo.path,
      error: String(err.message || err),
      hash,
    })
    return
  }

  let ocrText = ''
  const prior = seenHash.get(hash)
  if (prior) {
    ocrText = prior.ocrText
  } else if ((info.width || 0) >= 80 && (info.height || 0) >= 80) {
    const ocrBuf = await sharp(raw, { failOn: 'none' })
      .rotate()
      .resize({ width: 1280, height: 1280, fit: 'inside', withoutEnlargement: true })
      .grayscale()
      .jpeg({ quality: 85 })
      .toBuffer()
    ocrText = await ocr(ocrBuf)
    seenHash.set(hash, { ocrText })
  }

  const tags = slugTags(rel, wp.title, wp.alt, ocrText)
  const rec = {
    id: wp.id || null,
    source: photo.path,
    file: rel,
    webp: posix.join('media/webp', destRel),
    bytesIn: photo.size,
    bytesOut: webp.length,
    width: info.width || 0,
    height: info.height || 0,
    hash,
    usedOnSite: used.has(rel),
    wpTitle: wp.title || '',
    wpAlt: wp.alt || '',
    ocrText,
    tags,
  }
  manifest.push(rec)
}

async function pool(items, limit, fn) {
  let i = 0
  const workers = Array.from({ length: limit }, async () => {
    while (i < items.length) {
      const cur = items[i++]
      await fn(cur)
      done++
      if (done % 50 === 0 || done === items.length) {
        console.log(`media ${done}/${items.length}`)
      }
    }
  })
  await Promise.all(workers)
}

await pool(index.photos, CONCURRENCY, processOne)
manifest.sort((a, b) => String(a.file).localeCompare(String(b.file)))
await writeFile(join(ROOT, 'content', 'media.json'), JSON.stringify(manifest, null, 2))

const ok = manifest.filter((m) => !m.error)
const withOcr = ok.filter((m) => m.ocrText)
console.log(
  JSON.stringify(
    {
      photos: ok.length,
      errors: manifest.length - ok.length,
      withOcr: withOcr.length,
      usedOnSite: ok.filter((m) => m.usedOnSite).length,
      bytesIn: ok.reduce((s, m) => s + m.bytesIn, 0),
      bytesOut: ok.reduce((s, m) => s + (m.bytesOut || 0), 0),
    },
    null,
    2,
  ),
)
