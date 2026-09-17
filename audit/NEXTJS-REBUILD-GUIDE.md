# Next.js rebuild guide — carpetductcleaning.com

Use this before any Next.js code. The WordPress backup gave us **copy and photos**. It did **not** give us a URL structure worth keeping.

Source of truth:

- Content pack: `content/pages/*.json`, `content/posts/*.json`
- Photos: `media/webp/**` + `content/media.json`
- Old live SEO crawl: 30 Aug 2026 (194 URLs, 132 with issues, 45 critical)
- This backup inventory: 17 Sep 2026 (62 pages + 44 posts = 106 URLs)

Do not crawl the live site to “fill gaps.” Hostinger already 500s sitemaps and 508s under load.

---

## 1. What we are building

A static-friendly Next.js App Router site for a **lead-gen cleaning company** in Irvine / Orange County.

- Phone: `(949) 992-3299`
- Brand: Carpet And Duct Cleaning
- Proof to keep: Google Guaranteed, BBB A+, IICRC, EPA Safer Choice, 10,000+ jobs, 4.9 Google
- Founding year: **2013** (homepage). About said 2021. Lock **2013** unless the client documents otherwise.

This is not a store. No WordPress, no Elementor, no Rank Math, no `/cleaner-in-*` pages.

---

## 2. Why the old site failed SEO

The Aug 30 crawl is the constraint list for the new IA. Do not reintroduce any of these.

| Old failure | What it did | New rule |
|---|---|---|
| `/cleaner-in-{city}/` | Slug names no service. 32 URLs. | Nested `/{service}/{city}` only |
| H1 ≠ service (Irvine = boats, HB = ducts, Tustin = rugs) | Google cannot rank the money query | H1 = `{Service} in {City}, CA` |
| 20 city pages with no H1 | Title stuffing only | Exactly one H1, visible, matching title |
| Rank Math listicle titles on the wrong blog post | Slug says rugs, title says ducts | Title, H1, slug, first paragraph = same topic |
| Homepage LocalBusiness JSON-LD was an editor dump | No NAP / geo / rating for Google | Hand-built `CleaningService` JSON-LD |
| Org + Person on one `@id` | Entity confusion | One `@type`, one `@id` |
| SearchAction → `/?s=` while robots blocks it | Advertises a blocked URL | No site-search schema |
| About / Contact typed as Article | Wrong page type | `AboutPage` / `ContactPage` |
| `/upholstery-cleaning/` 301 → blog post | Service URL stolen | Real service hub |
| `/tile-and-grout-cleaning/` → homepage; live page was `-3` | Split equity | Clean slug, 301 the leftover |
| Privacy / Terms / SMS 404 | Form named pages that did not exist | Publish all three before launch |
| `/service-area/` vs `/locations/` | Two hubs, one job | Keep `/locations`, 301 `/service-area` |
| 2013 vs 2021 | E-E-A-T conflict | One year: 2013 |
| 73 pages missing image alt | Same template images | Every `<img>` has a real alt |
| Titles >65, metas >165, “#1 / Best / Trusted” stacking | SERP rewrite / truncate | 50–60 title, 140–155 meta, no superlative stacks |
| 182/194 pages flagged AI, 114 high-duplicate | Thin city clones | Unique local proof or do not publish |
| Full service × city matrix | Air-duct city set was the only clean pattern; carpet set was junk | **No generated city pages.** Only pages with unique copy |

Air-duct city URLs (`/air-duct-cleaning-{city}/`) were the **only** location pattern that worked. Steal that idea. Nested is cleaner for App Router:

```
/air-duct-cleaning              ← hub
/air-duct-cleaning/aliso-viejo  ← city (only if we have unique copy)
```

---

## 3. Information architecture

```
/                                 Home (Irvine + OC lead magnet)
/about
/contact
/locations                        City index (one hub)
/privacy-policy
/terms
/sms-terms
/blog
/blog/{slug}

/{service}                        Service hub
/{service}/{city}                 Service + city (unique copy only)
```

Trailing slashes: pick **no trailing slash** in Next.js and 301 the old `/slug/` form.

### 3.1 Service hubs (keep)

These are money pages. New slug on the left. Old backup slug on the right.

| New route | Old slug | Notes |
|---|---|---|
| `/carpet-cleaning` | `carpet-cleaning` | Primary |
| `/air-duct-cleaning` | `air-duct-cleaning` | Primary |
| `/dryer-vent-cleaning` | `dryer-vent-cleaning` | Strong page (2853 words) |
| `/water-damage-restoration` | `water-damage-restoration` | Strong page (2919 words) |
| `/area-rug-cleaning` | `area-rug-cleaning` | |
| `/oriental-rug-cleaning` | `oriental-rug-cleaning` | |
| `/rug-pickup` | `rug-pickup-drop-off` | Shorter slug |
| `/upholstery-cleaning` | `furniture-upholstery-cleaning` | Restore the stolen keyword |
| `/couch-cleaning` | `couch-sectional-cleaning` | |
| `/leather-furniture-cleaning` | `leather-furniture-cleaning` | |
| `/microfiber-couch-cleaning` | `microfiber-couch-cleaning` | |
| `/hardwood-floor-cleaning` | `hardwood-floor-cleaning` | |
| `/tile-and-grout-cleaning` | `tile-and-grout-cleaning-3` | Kill the `-3` |
| `/vinyl-floor-cleaning` | `vinyl-floor-cleaning` | |
| `/natural-stone-cleaning` | `natural-stone-cleaning` | |
| `/pet-stain-odor` | `pet-stain-odor-treatment` | |
| `/commercial-carpet-cleaning` | `commercial-carpet-cleaning` | |
| `/commercial-air-duct-cleaning` | `commercial-air-duct-cleaning` | |
| `/car-seat-cleaning` | `car-seat-cleaning` | |
| `/drape-cleaning` | `drapes-curtain-cleaning` | |
| `/outdoor-furniture-cleaning` | `outdoor-furniture-cushion-cleaning` | |
| `/encapsulation-carpet-cleaning` | `encapsulation-carpet-cleaning` | Keep; 301 if later merged into carpet |
| `/emergency-cleaning` | `emergency-cleaning-services` | |

### 3.2 Service hubs to merge or demote

Do **not** give these a top-nav item. 301 or treat as a section on a parent.

| Old slug | Action |
|---|---|
| `commercial-cleaning-services` (440 words) | Fold into a `/commercial` hub that links carpet + duct commercial. Or 301 → `/` commercial CTA. Prefer a real `/commercial` page using this copy. |
| `floor-cleaning` (819 words) | Hub that links hardwood / tile / vinyl / stone. Keep `/floor-cleaning` as the parent. |
| `indoor-air-quality-services` (610 words) | Section on `/air-duct-cleaning`, 301 the old URL there. |
| `outdoor-cleaning-services` | Parent of outdoor furniture. Keep or merge into `/outdoor-furniture-cleaning`. |

Do not resurrect old crawl-only services that are **not** in this backup (`/marble/`, `/granite/`, `/travertine/`, `/wool-rugs/`, `/blood-stains/`, `/wine-stains/`, `/chair-cleaning/`). 301 those leftovers to the nearest hub (stone → `/natural-stone-cleaning`, wool → `/oriental-rug-cleaning` or `/area-rug-cleaning`).

### 3.3 Location pages we actually have

**Do not invent the rest of Orange County.** Home lists ~40 cities. The backup only has unique copy for the rows below.

#### Carpet + city (rewrite `/cleaner-in-*` onto these)

| New route | Source JSON | Rewrite required |
|---|---|---|
| `/carpet-cleaning/anaheim` | `carpet-cleaning-in-anaheim` | Light (already on-topic) |
| `/carpet-cleaning/costa-mesa` | `carpet-cleaning-in-costa-mesa` | Light |
| `/carpet-cleaning/stanton` | `carpet-cleaning-in-stanton` | Light |
| `/carpet-cleaning/coto-de-caza` | `carpet-cleaning-coto-de-caza` | Light |
| `/carpet-cleaning/dove-canyon` | `carpet-cleaning-dove-canyon` | Light |
| `/carpet-cleaning/east-irvine` | `carpet-cleaning-east-irvine` | Light |
| `/carpet-cleaning/aliso-viejo` | `residential-carpet-cleaning-aliso-viejo` | Light |
| `/carpet-cleaning/anaheim-hills` | `cleaner-in-anaheim-hills` | **Yes — H1 was wood floors** |
| `/carpet-cleaning/buena-park` | `cleaner-in-buena-park` | **Yes — H1 was upholstery** |
| `/carpet-cleaning/corona-del-mar` | `cleaner-in-corona-del-mar` | Yes — generic “cleaner” |
| `/carpet-cleaning/dana-point` | `cleaner-in-dana-point` | **Yes — H1 was vinyl** |
| `/carpet-cleaning/foothill-ranch` | `cleaner-in-foothill-ranch` | **Yes — H1 was leather** |
| `/carpet-cleaning/fountain-valley` | `cleaner-in-fountain-valley` | Yes |
| `/carpet-cleaning/fullerton` | `cleaner-in-fullerton` | Yes |
| `/carpet-cleaning/garden-grove` | `cleaner-in-garden-grove` | **Yes — H1 was flood** |
| `/carpet-cleaning/huntington-beach` | *no on-topic source* | **New write.** Do not use the old page as the carpet URL |
| `/carpet-cleaning/irvine` | `cleaner-in-irvine` | **Yes — page is boats/vehicles.** Keep local Irvine facts only |
| `/carpet-cleaning/ladera-ranch` | `cleaner-in-ladera-ranch` | **Yes — H1 was rug pickup** |
| `/carpet-cleaning/laguna-beach` | `cleaner-in-laguna-beach` | **Yes — H1 was flood** |
| `/carpet-cleaning/laguna-hills` | `cleaner-in-laguna-hills` | **Yes — H1 was RV** |
| `/carpet-cleaning/santa-ana` | `cleaner-in-santa-ana` | Yes (no H1) |
| `/carpet-cleaning/seal-beach` | `cleaner-in-seal-beach` | Yes (no H1) |
| `/carpet-cleaning/trabuco-canyon` | `cleaner-in-trabuco-canyon` | Yes (no H1) |
| `/carpet-cleaning/tustin` | `cleaner-in-tustin` | **Yes — visible heading was rugs** |
| `/carpet-cleaning/tustin-ranch` | `cleaner-in-tustin-ranch` | Yes (no H1) |
| `/carpet-cleaning/westminster` | `cleaner-in-westminster` | Yes (no H1) |
| `/carpet-cleaning/woodbridge` | `cleaner-in-woodbridge` | Yes (Irvine village; say that) |
| `/carpet-cleaning/yorba-linda` | `cleaner-in-yorba-linda` | Yes (no H1) |

#### Other service + city (already the good pattern — keep)

| New route | Source JSON |
|---|---|
| `/air-duct-cleaning/aliso-viejo` | `air-duct-cleaning-aliso-viejo` |
| `/hardwood-floor-cleaning/aliso-viejo` | `hardwood-floor-cleaning-aliso-viejo` |
| `/air-duct-cleaning/huntington-beach` | `cleaner-in-huntington-beach` | Reuse the duct-themed body here, not as a carpet page |

#### Do not publish yet

Cities named on the home page but **with no unique page in the backup**: Lake Forest, Newport Beach, Newport Coast, North Irvine, Mission Viejo, Laguna Niguel, Orange, Placentia, Rancho Santa Margarita, San Clemente, San Juan Capistrano.

The Aug crawl had `/cleaner-in-*` for several of these. They are **not** in this dump. List them on `/locations` as “we serve {city}” linking to the nearest service hub. Do not auto-generate a page.

If the client later wants more city pages: write unique local copy (neighborhoods, housing stock, soil, coastal vs inland). Never clone Irvine and swap the city name.

---

## 4. Full 301 plan

Machine copy: `audit/next-url-map.json`.

Rules:

1. Every old public URL 301s to **one** new URL.
2. Never 301 a service URL to a blog post.
3. Never 301 a location URL to the homepage unless it was spam/hack residue.
4. Keep Rank Math junk (`/products/*.htm`, `/zozo/`, `/goods.html`) → `/`.
5. `/locations/*` old paths → the matching `/{service}/{city}` when we know it, else `/locations`.
6. Rank Math’s `/locations/*` → `/service-area/` becomes **`/locations`**. There is no `/service-area` page in the backup.

### Must-fix 301s (old audit + backup)

```
/cleaner-in-irvine/                    → /carpet-cleaning/irvine
/cleaner-in-huntington-beach/          → /air-duct-cleaning/huntington-beach
/cleaner-in-tustin/                    → /carpet-cleaning/tustin
/cleaner-in-anaheim/                   → /carpet-cleaning/anaheim
/cleaner-in-stanton/                   → /carpet-cleaning/stanton
/carpet-cleaning-stanton/              → /carpet-cleaning/stanton
/cleaner-in-dove-canyon/               → /carpet-cleaning/dove-canyon
/cleaner-in-east-irvine                → /carpet-cleaning/east-irvine
/cleaner-in-north-irvine/              → /carpet-cleaning/east-irvine   (no north-irvine page)
/tile-and-grout-cleaning-3/            → /tile-and-grout-cleaning
/tile-and-grout-cleaning/              → /tile-and-grout-cleaning
/tile-grout-cleaning                   → /tile-and-grout-cleaning
/upholstery-cleaning/                  → /upholstery-cleaning
/furniture-upholstery-cleaning/        → /upholstery-cleaning
/about-us/                             → /about
/about                                 → /about
/blogs/                                → /blog
/articles                              → /blog
/contact/                              → /contact
/called                                → /contact
/recruit                               → /contact
/service-area/                         → /locations
/locations/                            → /locations
/duct-cleaning                         → /air-duct-cleaning
/services                              → /
/services/carpet-cleaning              → /carpet-cleaning
/indoor-air-quality-services/          → /air-duct-cleaning
```

Old `/locations/carpet-and-duct-cleaning-in-huntington-beach` → `/air-duct-cleaning/huntington-beach`  
Old `/locations/carpet-and-air-duct-cleaning-in-irvine` → `/carpet-cleaning/irvine`

Blog slugs stay the same under `/blog/{slug}`. Old `/{slug}/` 301s to `/blog/{slug}`.

---

## 5. On-page SEO rules (non-negotiable)

Apply on every template.

### Title

```
{Service} in {City}, CA | Carpet & Duct Cleaning
```

Home: `Carpet Cleaning in Irvine, CA | Air Duct Cleaning`

- 50–60 characters
- City + service in the title when the page is a city page
- No `#1`, `Best`, `Trusted`, `5-Star` stacks
- Blog: rewrite so title matches slug (see §8)

### H1

- Exactly one
- City page: `Carpet Cleaning in Irvine, CA` (or the actual service)
- Service hub: `Carpet Cleaning in Orange County`
- Must match the URL service. If you cannot write that H1 honestly, do not publish the page

### Meta description

- 140–155 characters
- City + service + phone or “same-day”
- No duplicate descriptions across cities

### Canonical

- Self-canonical on every indexable page
- `https://carpetductcleaning.com` apex, https, no www
- Noindex: thank-you page, any staging, author-style leftovers

### Headings

- H2s are real section titles, never empty Elementor widgets
- FAQ questions can be H3

### Internal links

- Home → 6–8 service hubs (not 27)
- Service hub → its city pages + related services
- City page → parent service + 2 sibling services + `/locations`
- Blog → one service hub, never a random other post title
- Footer: services, locations, legal, phone

Do not link “Huntington Beach” to a duct page from a carpet paragraph.

### Images

- WebP from `media/webp`
- Prefer OCR/library files with van, logo, BBB, Google Guaranteed, before/after carpets, ducts
- Ignore decorative Elementor chrome (`bg_pattern`, `quote.png`)
- Alt: what is in the photo + city or service. Not “image1”
- `photosUsedOnPages: 29` in the pack is a parser miss (Elementor). Home already has 17 real refs. Pick 4–8 photos per template, not 1,643

### Copy

- First 80 words must name the service and the city
- Keep local facts (Turtle Rock, Spectrum, salt air, dry dust, construction)
- Delete keyword-stuffed “cleaner in irvine” loops
- One founding year
- Spell-check leftovers (`Water Demage`, `Cleaner In Irvine - Professional Services`)

---

## 6. Schema for the Next.js build

Hand-write JSON-LD. Do not port Rank Math.

**Every page**

- `BreadcrumbList`
- `Organization` / `CleaningService` `@id`: `https://carpetductcleaning.com/#business`

**Home**

```json
{
  "@type": "CleaningService",
  "name": "Carpet And Duct Cleaning",
  "url": "https://carpetductcleaning.com/",
  "telephone": "+19499923299",
  "areaServed": { "@type": "AdministrativeArea", "name": "Orange County, CA" },
  "address": { "@type": "PostalAddress", "addressLocality": "Irvine", "addressRegion": "CA", "addressCountry": "US" },
  "foundingDate": "2013",
  "sameAs": ["GOOGLE_GBP_URL", "BBB_URL"]
}
```

Add `aggregateRating` only if the live Google count is confirmed at build time. Do not invent reviewCount.

**Service hub:** `Service` with `serviceType`, `areaServed`, `provider` → `#business`

**City page:** `Service` + `areaServed` = that city

**Blog:** `Article` + `author` (person or org, pick one and stick)

**About:** `AboutPage`  
**Contact:** `ContactPage` + `ContactPoint`

**FAQ:** `FAQPage` only for questions visible on that page

No `Person` on the business `@id`. No `SearchAction`. No `Article` on About/Contact.

---

## 6.5 Starter repos (GitHub, Sep 2026)

There is **no** high-star Next.js repo that is a local service × city lead-gen site. Home-service templates on GitHub have 0–2 stars. Do not fork those.

Use a thin official Next.js app, our `audit/next-url-map.json`, and steal pieces from these:

| Repo | Stars | Use for us | Skip |
|---|---|---|---|
| [ixartz/Next-JS-Landing-Page-Starter-Template](https://github.com/ixartz/Next-JS-Landing-Page-Starter-Template) | ~2.1k | Closest **site** start: Tailwind sections, JSON-LD, OG, lighthouse | Next 14, one landing page, no blog, no `/{service}/{city}` |
| [ixartz/Next-js-Boilerplate](https://github.com/ixartz/Next-js-Boilerplate) | ~13k | Next 16 + Tailwind 4 + lint/test DX | Auth, Drizzle, Sentry — delete or never install |
| [timlrx/tailwind-nextjs-starter-blog](https://github.com/timlrx/tailwind-nextjs-starter-blog) | ~10.5k | `/blog`, MDX, RSS, sitemap patterns | It is a personal blog, not a business site |
| [shadcn-ui/taxonomy](https://github.com/shadcn-ui/taxonomy) | ~19k | App Router metadata + content pages | Next 13-era, dashboard/auth. Patterns only |
| [shadcn-ui/ui](https://github.com/shadcn-ui/ui) | ~124k | Buttons, accordion FAQ, form, sheet nav | Not a site |
| [magicuidesign/magicui](https://github.com/magicuidesign/magicui) | ~22k | Hero/CTA motion if we want polish | Do not make a SaaS landing |
| [cruip/open-react-template](https://github.com/cruip/open-react-template) / [cruip/tailwind-landing-page-template](https://github.com/cruip/tailwind-landing-page-template) | ~4.5–4.7k | Visual reference | SaaS look, often not App Router |
| [payloadcms/payload](https://github.com/payloadcms/payload) | ~45k | Later, if they want an admin | Overkill. We already have the JSON pack |

**Recommended start:** `create-next-app` (App Router, TS, Tailwind) + shadcn + this guide. Copy SEO helpers from the ixartz landing repo, blog list/detail from the Tailwind blog starter. Do not clone Taxonomy or the 13k boilerplate as the project root.

---

## 7. Next.js app shape

```
app/
  layout.tsx                 NAP, phone, JSON-LD business, header/footer
  page.tsx                   home
  about/page.tsx
  contact/page.tsx
  locations/page.tsx
  privacy-policy/page.tsx
  terms/page.tsx
  sms-terms/page.tsx
  blog/page.tsx
  blog/[slug]/page.tsx
  [service]/page.tsx
  [service]/[city]/page.tsx
  sitemap.ts
  robots.ts
  not-found.tsx
lib/
  content.ts                 read JSON pack
  seo.ts                     title/meta/canonical helpers
  schema.ts
  redirects.ts               from audit/next-url-map.json
next.config.ts               trailingSlash: false, redirects()
```

`generateStaticParams` from the content pack + the new URL map. Unknown `[service]/[city]` = 404, not a generated stub.

`sitemap.ts` emits only indexable new routes (not old aliases).

`robots.ts`: allow all, sitemap URL, **do not** copy the old `Disallow: /*?[0-9]*` or hack-path museum.

Redirects load from `audit/next-url-map.json` so we do not hardcode 100+ rules in config by hand.

---

## 8. Blog

Keep all **44** posts. Move to `/blog/{slug}`.

Rewrite title + H1 + intro so they match the slug. These were critical mismatches on the old site (some slugs are gone from this backup; fix the ones we still have):

| Slug | Old title problem | New title direction |
|---|---|---|
| `air-duct-cleaning-tustin-ca` | “Top Carpet and Duct Cleaning Service” | Air duct cleaning in Tustin, CA |
| `carpet-cleaning-air-quality-lake-forest-ca` | Area-rug tips | Carpet cleaning and air quality in Lake Forest |
| `curtain-cleaning-tips-for-lasting-elegance` | Upholstery tips | Curtain and drape cleaning tips |
| `water-damage-restoration-in-irvine-ca` | Carpet cleaning tips | Water damage restoration in Irvine |
| `7-powerful-tips-cleaning-outdoor-furniture` | “5 Best…” vs “7” in slug | Outdoor furniture cleaning tips |
| `premium-sofa-and-couch-cleaning-yorba-linda` | `#1 Premium…` | Sofa and couch cleaning in Yorba Linda |

If both Yorba Linda sofa posts exist later, keep `premium-sofa-and-couch-cleaning-yorba-linda` and 301 the duplicate.

Blog index: `/blog` (301 `/blogs`). Cards use the **rewritten** title, not Rank Math.

---

## 9. New pages that must exist before launch

Not in the backup. Write short, real pages.

1. `/privacy-policy`
2. `/terms`
3. `/sms-terms` — must match the SMS consent paragraph already on home
4. `/carpet-cleaning/huntington-beach` — unique carpet copy (the old “cleaner” URL is a duct page)
5. `/carpet-cleaning/irvine` — unique **carpet** copy (old page is boats)

Contact (`327` words) can stay thin: form, phone, service area, hours. Do not keyword-stuff it.

---

## 10. How to reuse the JSON pack

Each `content/pages/{slug}.json` is a **source dump**, not a page model.

Transform into something like:

```ts
type PageDoc = {
  route: string
  type: 'home' | 'service' | 'city' | 'blog' | 'utility'
  service?: string          // carpet-cleaning
  city?: string             // irvine
  title: string             // SEO title
  h1: string
  description: string
  body: PortableText | MDX  // rewritten, not raw Elementor text
  faq: { q: string; a: string }[]
  images: { src: string; alt: string; width: number; height: number }[]
  related: string[]         // other routes
}
```

Use `text` as the research draft. Strip “Call Now / Book Now / Divider / span / Learn More” chrome. Pull FAQs into an array. Do not render the raw dump.

Home is recovered (`recovered: true`, 581 revisions). Use it. It is the best on-brand copy in the pack.

---

## 11. Photos

- 1,643 WebP files, 133 MB, OCR on 1,407
- Build a **shortlist** (van, technicians, carpets, ducts, rugs, badges) in `content/media-shortlist.json` during the Next.js pass
- Hero: van + Google Guaranteed / BBB
- Service pages: one proof photo that matches the service
- Do not use stock greenhouse / 40 MB backup-folder leftovers (those were skipped at extract, keep it that way)

---

## 12. Nav and conversion

**Header:** Services (mega: 8 money links), Locations, Blog, About, `Call (949) 992-3299`, Book

**Money services in the mega:** Carpet, Air ducts, Dryer vents, Water damage, Rugs, Upholstery, Floors, Commercial

**Footer:** full service list, city list (only published city routes), legal, SMS disclosure

**Forms:** contact + SMS consent linking to the three legal pages. Thank-you route `noindex`.

---

## 13. Build order

1. Next.js shell, NAP, redirects from `audit/next-url-map.json`, sitemap, robots
2. Home from `home.json` (clean the chrome, keep 2013 + FAQs + schema)
3. Legal pages + contact form
4. 21 service hubs with clean slugs (tile, upholstery first — they were broken)
5. On-topic city pages (Anaheim, Costa Mesa, Stanton, Aliso Viejo, East Irvine, Dove Canyon, Coto)
6. Rewrite `/cleaner-in-*` into `/carpet-cleaning/{city}` (Irvine and Huntington Beach first)
7. `/locations` index
8. Blog move + title fixes
9. Media shortlist + alts
10. JSON-LD + Search Console + 301 QA (hit every old URL in `next-url-map.json`)

---

## 14. Launch QA (SEO)

For every new route:

- [ ] 200, self-canonical, one H1, title 50–60, meta 140–155
- [ ] H1 service matches the path
- [ ] No `/cleaner-in-*` left as a 200
- [ ] `/upholstery-cleaning` is a service page
- [ ] `/tile-and-grout-cleaning` is a service page (not home)
- [ ] `/privacy-policy`, `/terms`, `/sms-terms` 200 and linked from the form
- [ ] `/service-area` 301 → `/locations`
- [ ] Homepage JSON-LD parses in Rich Results test
- [ ] Apex https, www 301
- [ ] Sitemap = new URLs only
- [ ] No empty headings
- [ ] About says 2013

---

## 15. Do not

- Port Elementor, Rank Math, or WP Rocket
- Generate 31 air-duct city pages that are not in the backup
- Keep `/cleaner-in-*` “for equity” as live pages (301 only)
- 301 a service to a blog
- Put `Article` schema on About
- Advertise site search
- Hit the live WordPress host to scrape “the rest”
- Ship `#1 trusted professional cleaning services” titles

When this conflicts with a JSON file in `content/`, **this guide wins**. The JSON is the old site.
