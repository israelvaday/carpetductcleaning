const CHROME =
  /^(call now|book now|divider|span|p|div|h3|learn more|submit|who we are|what we do|testimonials|stay informed|common questions)$/i;

// Leftover WordPress badge strips and superlative headlines the audit told us to drop.
const BADGE = /jobs completed.*google rating|google guaranteed\s*⭐|bbb a\+ rated\s*$/i;
const SUPERLATIVE = /(#\s?1\b|most trusted|best\s+\w+\s+(company|service)|top[- ]rated|5[- ]star)/i;

const ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&quot;": '"',
  "&apos;": "'",
  "&#039;": "'",
  "&lt;": "<",
  "&gt;": ">",
};

export function decodeEntities(input: string) {
  return String(input || "")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&[a-z]+;|&#\d+;/gi, (ent) => ENTITIES[ent.toLowerCase()] ?? ent);
}

const FOREIGN_DOMAIN = /\b(?!carpetductcleaning\b)[a-z0-9][a-z0-9-]{2,}\.(com|net|org|co)\b/i;

const QUESTION_START =
  /^(how|what|why|when|where|which|who|is|are|do|does|did|can|could|should|will|would|may|must)\b/i;

function starCount(s: string) {
  return (s.match(/[★⭐]/g) || []).length;
}

// WordPress card blocks were exported twice in places, so the same sentence
// shows up back to back inside one paragraph.
function dedupeSentences(paragraph: string) {
  const sentences = paragraph.match(/[^.!?]+[.!?]+\s*|[^.!?]+$/g);
  if (!sentences || sentences.length < 2) return paragraph;
  const seen = new Set<string>();
  const kept: string[] = [];
  for (const sentence of sentences) {
    const key = sentence.toLowerCase().trim();
    if (key.length > 20 && seen.has(key)) continue;
    seen.add(key);
    kept.push(sentence.trim());
  }
  return kept.join(" ");
}

export function cleanParagraphs(raw: string, limit = 14): string[] {
  const parts = decodeEntities(raw)
    .replace(/\u00a0/g, " ")
    .split(/\n+/)
    .map((p) => dedupeSentences(p.replace(/\s+/g, " ").trim()))
    .filter(
      (p) =>
        p.length > 40 &&
        !CHROME.test(p) &&
        !/^<[^>]+>$/.test(p) &&
        !BADGE.test(p) &&
        !FOREIGN_DOMAIN.test(p) &&
        starCount(p) < 3 &&
        !(p.length < 80 && SUPERLATIVE.test(p)),
    );

  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    const key = p.slice(0, 80).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
    if (out.length >= limit) break;
  }
  return out;
}

export function extractFaqs(raw: string, max = 6): { q: string; a: string }[] {
  const text = decodeEntities(raw).replace(/\s+/g, " ").trim();

  // A question is a run with no sentence break that ends in "?", so an answer
  // above it can never bleed into the question text.
  const found: { q: string; end: number; start: number }[] = [];
  const re = /[^.?!]{12,200}\?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    // Trailing fragment only, so a run-on like "Air Duct Cleaning Need help?"
    // is judged on "Need help?" and dropped rather than shipped as a question.
    const q = m[0].trim().replace(/^.*?(?=\b(How|What|Why|When|Where|Which|Who|Is|Are|Do|Does|Can|Could|Should|Will|Would|May|Must)\b)/, "");
    if (!QUESTION_START.test(q) || q.split(" ").length < 4) continue;
    found.push({ q, start: m.index, end: re.lastIndex });
  }

  const faqs: { q: string; a: string }[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < found.length && faqs.length < max; i += 1) {
    const nextStart = i + 1 < found.length ? found[i + 1].start : text.length;
    const a = text
      .slice(found[i].end, nextStart)
      .replace(/Stay Informed.*$/i, "")
      .trim();
    // The WordPress dump had competitor citations and clipped first letters
    // pasted into answers. Drop those instead of publishing them.
    if (a.length < 40 || /^[a-z]/.test(a)) continue;
    if (FOREIGN_DOMAIN.test(a) || /https?:\/\//i.test(a)) continue;
    const key = found[i].q.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    faqs.push({ q: found[i].q, a: a.length > 420 ? `${a.slice(0, 417).trimEnd()}…` : a });
  }
  return faqs;
}

// Audit target for meta descriptions is 140-155 characters. Required sentences
// always ship; optional ones are added only while they still fit.
export function composeMeta(required: string[], optional: string[] = [], min = 140, max = 155) {
  let out = required.join(" ").replace(/\s+/g, " ").trim();
  if (out.length > max) {
    const cut = out.slice(0, max);
    const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf(" "));
    out = stop > min ? cut.slice(0, stop + 1).trim() : cut.trim();
  }
  if (out.length >= min) return out;
  const fits = optional.map((part) => `${out} ${part}`).filter((s) => s.length >= min && s.length <= max);
  if (fits.length) return fits.reduce((a, b) => (b.length > a.length ? b : a));
  for (const part of optional) {
    if (out.length >= min) break;
    const next = `${out} ${part}`;
    if (next.length <= max) out = next;
  }
  return out;
}

export function cityIntro(serviceName: string, cityName: string) {
  return `Professional ${serviceName.toLowerCase()} in ${cityName}, CA from Carpet & Duct Cleaning. IICRC-certified technicians, Google Guaranteed, BBB A+, serving Orange County since 2013. Same-day openings. Call (949) 992-3299.`;
}
