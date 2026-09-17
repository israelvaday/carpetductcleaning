# Carpet & Duct Cleaning — content audit

Source: All-in-One WP Migration backup only. Live site was not requested.

## Inventory
- Pages: 62 (home recovered from revisions)
- Blog posts: 44
- Sitemap URLs: 106
- Photos converted: 1643
- Photos with OCR text: 1407
- WP library attachments: 179

## Kind split
- utility: 4
- location: 31
- service: 27

## Gaps
- Home `wp_posts` row ID 61 was absent; recovered (`content/pages/home.json`).
- No published `/service-area/` page; Rank Math still points old `/locations/*` there.
- 75 URLs have no Rank Math title/description.
- Thin pages (<200 words): 0

## Next.js layout
- `content/pages/*.json` — service, location, utility (old dump; rewrite before render)
- `content/posts/*.json` — blog
- `content/sitemap.xml` + `sitemap.json` — old public URLs
- `content/redirects.json` — old permalinks + Rank Math rules
- `media/webp/**` + `content/media.json` — WebP + OCR tags
- **Rebuild IA:** [`NEXTJS-REBUILD-GUIDE.md`](NEXTJS-REBUILD-GUIDE.md) + [`next-url-map.json`](next-url-map.json)

Workspace: `C:\APEXDEVSITE\carpetductcleaning.com`