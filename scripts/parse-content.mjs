import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseSqlValues, phpSerializedStrings, stripHtml, walkElementor } from './lib/sql.mjs'
import { eachInsert } from './lib/sql-stream.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SQL = join(ROOT, 'raw', 'database.sql')
const CONTENT = join(ROOT, 'content')
const ORIGIN = 'https://carpetductcleaning.com'

const posts = new Map()
const options = {}
const terms = new Map()
const tax = new Map()
const rel = []
const existingRedirects = []

async function eachRow(tables, onRow) {
  const want = new Set(tables)
  await eachInsert(SQL, (table, stmt) => {
    if (!want.has(table)) return
    const row = parseSqlValues(stmt)
    if (row) onRow(table, row)
  })
}

await eachRow(
  [
    'SERVMASK_PREFIX_posts',
    'SERVMASK_PREFIX_options',
    'SERVMASK_PREFIX_terms',
    'SERVMASK_PREFIX_term_taxonomy',
    'SERVMASK_PREFIX_term_relationships',
    'SERVMASK_PREFIX_rank_math_redirections',
  ],
  (table, row) => {
    if (table.endsWith('_posts')) {
      const type = row[20]
      const status = row[7]
      if (
        !(
          ((type === 'page' || type === 'post') && status === 'publish') ||
          type === 'attachment'
        )
      ) {
        return
      }
      posts.set(row[0], {
        id: Number(row[0]),
        date: row[2],
        content: row[4] || '',
        title: row[5] || '',
        excerpt: row[6] || '',
        status,
        slug: row[11],
        modified: row[14],
        guid: row[18],
        type,
        mime: row[21] || '',
      })
    } else if (table.endsWith('_options')) {
      if (['blogname', 'blogdescription', 'siteurl', 'home', 'page_on_front', 'permalink_structure'].includes(row[1])) {
        options[row[1]] = row[2]
      }
    } else if (table === 'SERVMASK_PREFIX_terms') {
      terms.set(row[0], { id: row[0], name: row[1], slug: row[2] })
    } else if (table === 'SERVMASK_PREFIX_term_taxonomy') {
      tax.set(row[0], { tt: row[0], termId: row[1], taxonomy: row[2] })
    } else if (table === 'SERVMASK_PREFIX_term_relationships') {
      if (posts.has(row[0])) rel.push({ objectId: row[0], tt: row[1] })
    } else if (table.endsWith('_rank_math_redirections')) {
      const sources = phpSerializedStrings(row[1] || '')
      existingRedirects.push({
        id: row[0],
        sources,
        urlTo: row[2],
        header: Number(row[3]),
        hits: Number(row[4]),
        status: row[5],
      })
    }
  },
)

console.log('pass1 posts', posts.size)

const keepIds = new Set(posts.keys())
const meta = new Map()
const META_KEEP = new Set([
  '_elementor_data',
  '_wp_attached_file',
  '_wp_attachment_image_alt',
  '_thumbnail_id',
  'rank_math_title',
  'rank_math_description',
  'rank_math_focus_keyword',
  'rank_math_canonical_url',
])

await eachRow(['SERVMASK_PREFIX_postmeta'], (_table, row) => {
  const postId = row[1]
  const key = row[2]
  if (!keepIds.has(postId) || !META_KEEP.has(key)) return
  let bag = meta.get(postId)
  if (!bag) {
    bag = {}
    meta.set(postId, bag)
  }
  if (key === '_elementor_data') {
    const acc = { texts: [], images: [], widgets: {} }
    try {
      walkElementor(JSON.parse(row[3]), acc)
    } catch {}
    bag.elementor = acc
    return
  }
  bag[key] = row[3]
})

function permalink(post) {
  if (post.type === 'page' && (post.slug === 'home' || post.id === Number(options.page_on_front))) {
    return `${ORIGIN}/`
  }
  if (post.type === 'attachment') {
    const file = meta.get(String(post.id))?._wp_attached_file
    return file ? `${ORIGIN}/wp-content/uploads/${file}` : post.guid
  }
  return `${ORIGIN}/${post.slug}/`
}

function termsFor(postId) {
  const out = []
  for (const r of rel) {
    if (r.objectId !== String(postId)) continue
    const ttax = tax.get(r.tt)
    if (!ttax) continue
    const t = terms.get(ttax.termId)
    if (!t) continue
    out.push({ taxonomy: ttax.taxonomy, name: t.name, slug: t.slug })
  }
  return out
}

function classify(post) {
  const slug = `${post.title} ${post.slug}`.toLowerCase()
  if (post.type === 'post') return 'blog'
  if (/(aliso|laguna|rancho|capistrano|anaheim|buena|irvine|tustin|forest|yorba|corona|newport|mission|huntington|santa ana|\borange\b|fullerton|costa|coto|dana|dove|foothill|fountain|garden grove|ladera|placentia|clemente|seal beach|stanton|trabuco|westminster|woodbridge|service-area|locations|cleaner in|carpet cleaning in)/i.test(slug)) {
    return 'location'
  }
  if (/(contact|about|blogs|home|service-area|locations)/i.test(post.slug)) return 'utility'
  return 'service'
}

function extractBody(post) {
  const m = meta.get(String(post.id)) || {}
  const acc = m.elementor || { texts: [], images: [], widgets: {} }
  const htmlText = stripHtml(post.content)
  const unique = []
  const seen = new Set()
  for (const t of [...acc.texts, htmlText]) {
    const x = String(t || '').trim()
    if (!x || x.length < 2 || seen.has(x)) continue
    seen.add(x)
    unique.push(x)
  }
  return {
    text: unique.join('\n\n'),
    wordCount: unique.join(' ').split(/\s+/).filter(Boolean).length,
    images: acc.images || [],
    widgets: acc.widgets || {},
    usedElementor: Boolean(m.elementor),
  }
}

const published = [...posts.values()].filter((p) => p.type === 'page' || p.type === 'post')
const attachments = [...posts.values()].filter((p) => p.type === 'attachment')
const pages = []
const blog = []

for (const post of published.sort((a, b) => a.title.localeCompare(b.title))) {
  const m = meta.get(String(post.id)) || {}
  const body = extractBody(post)
  const rec = {
    id: post.id,
    type: post.type,
    kind: classify(post),
    title: post.title,
    slug: post.slug,
    url: permalink(post),
    date: post.date,
    modified: post.modified,
    excerpt: stripHtml(post.excerpt),
    seo: {
      title: m.rank_math_title || '',
      description: m.rank_math_description || '',
      focusKeyword: m.rank_math_focus_keyword || '',
      canonical: m.rank_math_canonical_url || '',
    },
    thumbnailId: m._thumbnail_id ? Number(m._thumbnail_id) : null,
    terms: termsFor(post.id),
    wordCount: body.wordCount,
    usedElementor: body.usedElementor,
    widgets: body.widgets,
    imageRefs: body.images,
    text: body.text,
  }
  delete post.content
  if (post.type === 'page') pages.push(rec)
  else blog.push(rec)
}

const media = attachments.map((post) => {
  const m = meta.get(String(post.id)) || {}
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    alt: m._wp_attachment_image_alt || '',
    file: m._wp_attached_file || '',
    mime: post.mime,
    url: permalink(post),
    date: post.date,
  }
})

const sitemap = [
  ...pages.map((p) => ({ loc: p.url, lastmod: p.modified, type: 'page', kind: p.kind, slug: p.slug })),
  ...blog.map((p) => ({ loc: p.url, lastmod: p.modified, type: 'post', kind: 'blog', slug: p.slug })),
]

function usefulSource(s) {
  if (!s) return false
  if (['pattern', 'exact', 'regex', 'ignore', 'comparison'].includes(s)) return false
  return /[\/.^a-z0-9-]/i.test(s) && s.length > 1
}

const redirects = [
  ...sitemap.map((s) => ({
    from: new URL(s.loc).pathname,
    to: s.kind === 'blog' ? `/blog/${s.slug}` : s.loc === `${ORIGIN}/` ? '/' : `/${s.slug}`,
    status: 301,
    source: 'current-permalink',
    kind: s.kind,
  })),
  ...existingRedirects
    .filter((r) => r.status === 'active')
    .flatMap((r) =>
      r.sources.filter(usefulSource).map((from) => ({
        from: from.startsWith('^') || from.startsWith('/') ? from : `/${from}`,
        to: r.urlTo,
        status: r.header || 301,
        source: 'rank-math',
        hits: r.hits,
      })),
    ),
]

await mkdir(join(CONTENT, 'pages'), { recursive: true })
await mkdir(join(CONTENT, 'posts'), { recursive: true })

function fileSafe(slug) {
  return String(slug || 'untitled').replace(/[^a-z0-9-_]/gi, '-').slice(0, 80)
}

for (const p of pages) {
  await writeFile(join(CONTENT, 'pages', `${fileSafe(p.slug)}.json`), JSON.stringify(p, null, 2))
}
for (const p of blog) {
  await writeFile(join(CONTENT, 'posts', `${fileSafe(p.slug)}.json`), JSON.stringify(p, null, 2))
}

const usedFiles = new Set()
for (const rec of [...pages, ...blog]) {
  for (const img of rec.imageRefs) {
    const m = String(img.url || '').match(/\/wp-content\/uploads\/(.+)$/)
    if (m) usedFiles.add(m[1].replace(/-\d{2,4}x\d{2,4}(?=\.)/, '').replace(/-scaled(?=\.)/, ''))
  }
}

const summary = {
  site: {
    name: options.blogname,
    tagline: options.blogdescription,
    url: options.siteurl || ORIGIN,
    home: options.home,
  },
  counts: {
    pages: pages.length,
    posts: blog.length,
    attachments: media.length,
    sitemapUrls: sitemap.length,
    redirects: redirects.length,
    pagesByKind: pages.reduce((a, p) => ((a[p.kind] = (a[p.kind] || 0) + 1), a), {}),
  },
}

await writeFile(join(CONTENT, 'sitemap.json'), JSON.stringify({ generatedFrom: 'wpress-db-only', urls: sitemap }, null, 2))
await writeFile(join(CONTENT, 'redirects.json'), JSON.stringify({ note: 'Suggested Next.js 301 map from the backup only.', redirects }, null, 2))
await writeFile(join(CONTENT, 'media-wp.json'), JSON.stringify(media, null, 2))
await writeFile(join(CONTENT, 'used-media.json'), JSON.stringify([...usedFiles].sort(), null, 2))
await writeFile(join(CONTENT, 'summary.json'), JSON.stringify(summary, null, 2))
console.log(JSON.stringify(summary, null, 2))
console.log('used media files', usedFiles.size)
