import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const file = join(ROOT, 'content', 'redirects.json')
const data = JSON.parse(await readFile(file, 'utf8'))

const permalinks = data.redirects.filter((r) => r.source === 'current-permalink')
const rank = data.redirects.filter((r) => r.source === 'rank-math')

function keepRank(r) {
  const from = String(r.from || '')
  if (from.length < 3 || from.length > 180) return false
  if (['pattern', 'exact', 'regex', 'ignore', 'comparison', 'url_to'].includes(from.replace(/^\//, ''))) return false
  if (/^\/\d+$/.test(from)) return false
  if (/^https?:\/\//i.test(from) && !/carpetductcleaning\.com/i.test(from)) return false
  return (
    from.startsWith('/') ||
    from.startsWith('^') ||
    from.includes('.htm') ||
    /[a-z0-9-]+\/[a-z0-9-]/.test(from)
  )
}

const cleanedRank = []
const seen = new Set()
for (const r of rank) {
  if (!keepRank(r)) continue
  const key = `${r.from}=>${r.to}`
  if (seen.has(key)) continue
  seen.add(key)
  cleanedRank.push(r)
}

const out = {
  note: 'Suggested Next.js 301 map from the backup only. Permalinks are the live public URLs. Rank Math rules are existing redirects already on the old site.',
  permalinks,
  rankMath: cleanedRank,
}
await writeFile(file, JSON.stringify(out, null, 2))
console.log({ permalinks: permalinks.length, rankMath: cleanedRank.length, dropped: rank.length - cleanedRank.length })
