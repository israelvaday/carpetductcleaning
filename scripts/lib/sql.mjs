export function parseSqlValues(line) {
  const idx = line.indexOf('VALUES ')
  if (idx < 0) return null
  let i = idx + 7
  while (line[i] === ' ') i++
  if (line[i] !== '(') return null
  i++
  const out = []
  while (i < line.length) {
    const ch = line[i]
    if (ch === ')') break
    if (ch === ',' || ch === ' ') {
      i++
      continue
    }
    if (ch === "'") {
      let s = ''
      i++
      while (i < line.length) {
        const c = line[i]
        if (c === '\\') {
          const n = line[i + 1]
          if (n === 'n') s += '\n'
          else if (n === 'r') s += '\r'
          else if (n === 't') s += '\t'
          else if (n === '0') s += '\0'
          else s += n
          i += 2
          continue
        }
        if (c === "'") {
          if (line[i + 1] === "'") {
            s += "'"
            i += 2
            continue
          }
          i++
          break
        }
        s += c
        i++
      }
      out.push(s)
      continue
    }
    if (ch === 'N' && line.slice(i, i + 4) === 'NULL') {
      out.push(null)
      i += 4
      continue
    }
    let n = ''
    while (i < line.length && /[-0-9.eE]/.test(line[i])) n += line[i++]
    out.push(n)
  }
  return out
}

export function phpSerializedStrings(blob) {
  const out = []
  const re = /s:\d+:"((?:\\.|[^"\\])*)"/g
  let m
  while ((m = re.exec(blob))) out.push(m[1].replace(/\\"/g, '"').replace(/\\'/g, "'"))
  return out
}

export function stripHtml(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

export function walkElementor(node, acc) {
  if (!node) return acc
  if (Array.isArray(node)) {
    for (const n of node) walkElementor(n, acc)
    return acc
  }
  if (typeof node !== 'object') return acc
  const s = node.settings || {}
  const widget = node.widgetType || node.elType || ''
  const textKeys = [
    'title',
    'header_size',
    'header_text',
    'editor',
    'text',
    'description_text',
    'caption',
    'alert_title',
    'alert_description',
    'button_text',
    'inner_text',
    'description',
    'sub_title',
    'heading',
    'html',
    'testimonial_content',
    'testimonial_name',
    'name',
    'title_text',
    'description_text',
    'item_description',
    'tab_title',
    'tab_content',
    'accordion_title',
    'accordion_content',
  ]
  for (const k of textKeys) {
    if (typeof s[k] === 'string' && s[k].trim()) acc.texts.push(stripHtml(s[k]))
  }
  if (Array.isArray(s.icon_list)) {
    for (const item of s.icon_list) {
      if (item.text) acc.texts.push(stripHtml(item.text))
    }
  }
  if (Array.isArray(s.tabs)) {
    for (const t of s.tabs) {
      if (t.tab_title) acc.texts.push(stripHtml(t.tab_title))
      if (t.tab_content) acc.texts.push(stripHtml(t.tab_content))
    }
  }
  const pushImg = (img) => {
    if (!img) return
    if (typeof img === 'string' && img.startsWith('http')) acc.images.push({ url: img })
    else if (img.url) acc.images.push({ id: img.id, url: img.url, alt: img.alt || '' })
  }
  pushImg(s.image)
  pushImg(s.background_image)
  if (Array.isArray(s.background_slideshow_gallery)) s.background_slideshow_gallery.forEach(pushImg)
  if (Array.isArray(s.gallery)) s.gallery.forEach(pushImg)
  if (Array.isArray(s.carousel)) s.carousel.forEach(pushImg)
  if (node.elements) walkElementor(node.elements, acc)
  acc.widgets[widget] = (acc.widgets[widget] || 0) + 1
  return acc
}
