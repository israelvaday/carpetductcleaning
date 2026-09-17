import { readFile, writeFile } from 'node:fs/promises'

const file = new URL('../content/media.json', import.meta.url)
const media = JSON.parse(await readFile(file, 'utf8'))

function goodTag(t) {
  if (!t || t.length < 3) return false
  if (/^\d+$/.test(t)) return false
  if (/^[a-f0-9]{8,}$/i.test(t)) return false
  if (/^(img|dsc|eee|wk|kw|png|jpg|jpeg|webp|copy)$/.test(t)) return false
  return /[a-z]/i.test(t)
}

function cleanOcr(s) {
  return String(s || '')
    .replace(/[^a-zA-Z0-9&.,'"()\-\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

for (const m of media) {
  m.ocrText = cleanOcr(m.ocrText)
  m.tags = [...new Set(m.tags.filter(goodTag))]
}

await writeFile(file, JSON.stringify(media, null, 2))
console.log('cleaned', media.length, 'withTags', media.filter((m) => m.tags.length).length)
