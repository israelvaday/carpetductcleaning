import { createReadStream } from 'node:fs'
import { createInterface } from 'node:readline'
import { parseSqlValues } from './lib/sql.mjs'

const rl = createInterface({
  input: createReadStream(new URL('../raw/database.sql', import.meta.url), { encoding: 'utf8' }),
  crlfDelay: Infinity,
})

const hits = []
for await (const line of rl) {
  if (!line.startsWith('INSERT INTO `SERVMASK_PREFIX_posts`')) continue
  const row = parseSqlValues(line)
  if (!row) continue
  const id = row[0]
  const title = row[5] || ''
  const status = row[7]
  const slug = row[11]
  const type = row[20]
  if (id === '61' || slug === 'home' || slug === '' || /top-rated duct/i.test(title)) {
    hits.push({ id, type, status, slug, title: title.slice(0, 80), parent: row[17] })
  }
}
console.log(hits.slice(0, 40))
console.log('count', hits.length)
