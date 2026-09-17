import { createReadStream } from 'node:fs'

export async function eachInsert(file, onInsert) {
  const stream = createReadStream(file, { encoding: 'utf8' })
  let buf = ''
  let inStr = false
  let esc = false
  let start = -1

  const flush = async (end) => {
    const stmt = buf.slice(start, end)
    start = -1
    const m = stmt.match(/^INSERT INTO `([^`]+)`/)
    if (m) await onInsert(m[1], stmt)
  }

  for await (const chunk of stream) {
    const from = buf.length
    buf += chunk
    for (let i = from; i < buf.length; i++) {
      const c = buf[i]
      if (start < 0) {
        if (c === 'I' && buf.startsWith('INSERT INTO', i)) start = i
        continue
      }
      if (inStr) {
        if (esc) {
          esc = false
          continue
        }
        if (c === '\\') {
          esc = true
          continue
        }
        if (c === "'") {
          if (buf[i + 1] === "'") {
            i++
            continue
          }
          inStr = false
        }
        continue
      }
      if (c === "'") {
        inStr = true
        continue
      }
      if (c === ';' && buf[i - 1] === ')') {
        await flush(i + 1)
        if (start < 0 && i > 4_000_000) {
          buf = buf.slice(i + 1)
          i = -1
        }
      }
    }
    if (start < 0) buf = ''
    else if (start > 0) {
      buf = buf.slice(start)
      start = 0
    }
  }
}
