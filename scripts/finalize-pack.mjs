import { readdir, readFile, writeFile, stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const pages = []
for (const f of await readdir(join(ROOT, 'content', 'pages'))) {
  if (!f.endsWith('.json')) continue
  pages.push(JSON.parse(await readFile(join(ROOT, 'content', 'pages', f), 'utf8')))
}
const posts = []
for (const f of await readdir(join(ROOT, 'content', 'posts'))) {
  if (!f.endsWith('.json')) continue
  posts.push(JSON.parse(await readFile(join(ROOT, 'content', 'posts', f), 'utf8')))
}

const sitemap = [
  ...pages.map((p) => ({ loc: p.url, lastmod: p.modified, type: 'page', kind: p.kind, slug: p.slug })),
  ...posts.map((p) => ({ loc: p.url, lastmod: p.modified, type: 'post', kind: 'blog', slug: p.slug })),
]
sitemap.sort((a, b) => a.loc.localeCompare(b.loc))

await writeFile(
  join(ROOT, 'content', 'sitemap.json'),
  JSON.stringify({ generatedFrom: 'wpress-db-only', note: 'Not fetched from the live site.', urls: sitemap }, null, 2),
)

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${String(u.lastmod || '').slice(0, 10)}</lastmod>
  </url>`,
  )
  .join('\n')}
</urlset>
`
await writeFile(join(ROOT, 'content', 'sitemap.xml'), xml)

let media = []
try {
  media = JSON.parse(await readFile(join(ROOT, 'content', 'media.json'), 'utf8'))
} catch {}

const ok = media.filter((m) => !m.error)
const withOcr = ok.filter((m) => m.ocrText)
const used = ok.filter((m) => m.usedOnSite)
const thin = [...pages, ...posts].filter((p) => (p.wordCount || 0) < 200)
const noSeo = [...pages, ...posts].filter((p) => !p.seo?.title && !p.seo?.description)

const summary = {
  site: {
    name: 'Carpet And Duct Cleaning',
    tagline: "Irvine's Google Guaranteed Carpet & Air Duct Cleaning Company",
    url: 'https://carpetductcleaning.com',
    phone: '(949) 992-3299',
  },
  counts: {
    pages: pages.length,
    posts: posts.length,
    sitemapUrls: sitemap.length,
    pagesByKind: pages.reduce((a, p) => ((a[p.kind] = (a[p.kind] || 0) + 1), a), {}),
    attachmentsInLibrary: 179,
    photosConverted: ok.length,
    photosWithOcr: withOcr.length,
    photosUsedOnPages: used.length,
  },
  gaps: {
    missingPublishedHomeRow: 'Home page ID 61 was missing from wp_posts; recovered from 581 revisions + Elementor meta.',
    missingServiceAreaPage: 'Rank Math sends /locations/* to /service-area/ but no published service-area page exists. /locations/ does.',
    thinPages: thin.map((p) => ({ slug: p.slug, words: p.wordCount })),
    missingSeo: noSeo.length,
  },
  nextjs: {
    content: 'sites/carpetductcleaning/content/pages|posts/*.json',
    media: 'sites/carpetductcleaning/media/webp + content/media.json',
    redirects: 'sites/carpetductcleaning/content/redirects.json',
    sitemap: 'sites/carpetductcleaning/content/sitemap.xml',
  },
}

if (ok.length) {
  summary.mediaBytes = {
    in: ok.reduce((s, m) => s + (m.bytesIn || 0), 0),
    out: ok.reduce((s, m) => s + (m.bytesOut || 0), 0),
  }
}

await writeFile(join(ROOT, 'content', 'summary.json'), JSON.stringify(summary, null, 2))

const lines = [
  '# Carpet & Duct Cleaning — content audit',
  '',
  'Source: All-in-One WP Migration backup only. Live site was not requested.',
  '',
  `## Inventory`,
  `- Pages: ${pages.length} (home recovered from revisions)`,
  `- Blog posts: ${posts.length}`,
  `- Sitemap URLs: ${sitemap.length}`,
  `- Photos converted: ${ok.length}`,
  `- Photos with OCR text: ${withOcr.length}`,
  `- WP library attachments: 179`,
  '',
  '## Kind split',
  ...Object.entries(summary.counts.pagesByKind).map(([k, v]) => `- ${k}: ${v}`),
  '',
  '## Gaps',
  `- Home \`wp_posts\` row ID 61 was absent; recovered (\`content/pages/home.json\`).`,
  `- No published \`/service-area/\` page; Rank Math still points old \`/locations/*\` there.`,
  `- ${noSeo.length} URLs have no Rank Math title/description.`,
  `- Thin pages (<200 words): ${thin.length}`,
  ...thin.slice(0, 20).map((p) => `  - ${p.slug} (${p.wordCount})`),
  '',
  '## Next.js layout',
  '- `content/pages/*.json` — service, location, utility',
  '- `content/posts/*.json` — blog',
  '- `content/sitemap.xml` + `sitemap.json` — 301 source list',
  '- `content/redirects.json` — current permalinks + Rank Math rules',
  '- `media/webp/**` + `content/media.json` — WebP + OCR tags',
]

await writeFile(join(ROOT, 'audit', 'CONTENT.md'), lines.join('\n'))
console.log(JSON.stringify(summary.counts, null, 2))
console.log('thin', thin.length, 'noSeo', noSeo.length, 'media', ok.length)
