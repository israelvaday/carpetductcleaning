# Carpet & Duct Cleaning — Next.js site

Static App Router site for GitHub Pages. Content comes from the WordPress backup pack. Routes follow [`audit/NEXTJS-REBUILD-GUIDE.md`](audit/NEXTJS-REBUILD-GUIDE.md).

## Stack (high-star pieces, not a single clone)

| Piece | Source |
|---|---|
| App Router + static export | [vercel/next.js](https://github.com/vercel/next.js) |
| Tailwind v4 | Official Next + Tailwind |
| Button/nav/FAQ patterns | [shadcn/ui](https://github.com/shadcn-ui/ui) |
| Metadata, JSON-LD, sitemap | Patterns from [ixartz landing](https://github.com/ixartz/Next-JS-Landing-Page-Starter-Template) |
| `/blog` list + post | Patterns from [timlrx/tailwind-nextjs-starter-blog](https://github.com/timlrx/tailwind-nextjs-starter-blog) |

`/{service}` and `/{service}/{city}` come from our plan. No `/cleaner-in-*` 200s.

```
npm install
npm run dev
npm run build
```

GitHub Pages preview (after Actions): `https://israelvaday.github.io/carpetductcleaning/`

# Carpet & Duct Cleaning — Next.js content pack

This is the carpetductcleaning.com workspace. Built from the All-in-One `.wpress` backup only. The live site was not crawled.

## Layout

```
content/pages/*.json     published pages + recovered home
content/posts/*.json     blog posts
content/sitemap.xml      106 public URLs for 301 planning
content/sitemap.json     same list with type/kind
content/redirects.json   current permalinks + Rank Math rules
content/media.json       WebP path, OCR text, tags
content/summary.json     audit counts
media/webp/**            converted photos (378 MB → 133 MB)
audit/CONTENT.md         written audit
raw/                     database.sql + photo index (gitignored)
```

Each page/post JSON has: title, slug, old URL, SEO, word count, extracted text, Elementor widgets, image refs.

**Do not use those flat slugs as-is.** Restructure first:

- Guide: [`audit/NEXTJS-REBUILD-GUIDE.md`](audit/NEXTJS-REBUILD-GUIDE.md)
- 301 / route map: [`audit/next-url-map.json`](audit/next-url-map.json)

New routes: `/`, `/{service}`, `/{service}/{city}`, `/blog/{slug}`. No `/cleaner-in-*` 200s.

## Rebuild from the backup

```
node scripts/extract-raw.mjs
node scripts/parse-content.mjs
node scripts/recover-home.mjs
node scripts/clean-redirects.mjs
node scripts/process-media.mjs
node scripts/clean-media-tags.mjs
node scripts/finalize-pack.mjs
```
