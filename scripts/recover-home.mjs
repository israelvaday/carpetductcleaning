import { writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseSqlValues, stripHtml, walkElementor } from './lib/sql.mjs'
import { eachInsert } from './lib/sql-stream.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SQL = join(ROOT, 'raw', 'database.sql')

const revisions = []
let elementor = null
let seo = {}
let thumb = null

await eachInsert(SQL, (table, stmt) => {
  const row = parseSqlValues(stmt)
  if (!row) return
  if (table.endsWith('_posts') && row[17] === '61') {
    revisions.push({
      id: row[0],
      date: row[2],
      title: row[5],
      status: row[7],
      slug: row[11],
      modified: row[14],
      type: row[20],
      content: row[4] || '',
    })
  }
  if (table.endsWith('_postmeta') && row[1] === '61') {
    if (row[2] === '_elementor_data') {
      const acc = { texts: [], images: [], widgets: {} }
      try {
        walkElementor(JSON.parse(row[3]), acc)
        elementor = acc
      } catch {}
    }
    if (row[2] === 'rank_math_title') seo.title = row[3]
    if (row[2] === 'rank_math_description') seo.description = row[3]
    if (row[2] === 'rank_math_focus_keyword') seo.focusKeyword = row[3]
    if (row[2] === '_thumbnail_id') thumb = row[3]
  }
})

revisions.sort((a, b) => String(b.modified).localeCompare(String(a.modified)))
const latest = revisions[0]
const texts = []
const seen = new Set()
for (const t of [...(elementor?.texts || []), stripHtml(latest?.content || '')]) {
  if (t && !seen.has(t)) {
    seen.add(t)
    texts.push(t)
  }
}

const rec = {
  id: 61,
  type: 'page',
  kind: 'utility',
  title: latest?.title || 'Home',
  slug: 'home',
  url: 'https://carpetductcleaning.com/',
  date: latest?.date || '',
  modified: latest?.modified || '',
  excerpt: '',
  seo,
  thumbnailId: thumb ? Number(thumb) : null,
  terms: [],
  wordCount: texts.join(' ').split(/\s+/).filter(Boolean).length,
  usedElementor: Boolean(elementor),
  widgets: elementor?.widgets || {},
  imageRefs: elementor?.images || [],
  text: texts.join('\n\n'),
  recovered: true,
  recoveredFrom: latest ? `revision ${latest.id}` : 'postmeta-only',
  revisionCount: revisions.length,
}

await writeFile(join(ROOT, 'content', 'pages', 'home.json'), JSON.stringify(rec, null, 2))
console.log({
  revisions: revisions.length,
  latest: latest && { id: latest.id, title: latest.title, type: latest.type, status: latest.status },
  hasElementor: Boolean(elementor),
  wordCount: rec.wordCount,
  images: rec.imageRefs.length,
})
