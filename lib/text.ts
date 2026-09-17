const CHROME =
  /^(call now|book now|divider|span|p|div|h3|learn more|submit|who we are|what we do|testimonials|stay informed|common questions)$/i;

export function cleanParagraphs(raw: string, limit = 14): string[] {
  const parts = String(raw || "")
    .replace(/\u00a0/g, " ")
    .split(/\n+/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length > 40 && !CHROME.test(p) && !/^<[^>]+>$/.test(p));

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
  const text = String(raw || "").replace(/\s+/g, " ");
  const faqs: { q: string; a: string }[] = [];
  const re = /([A-Z][^?]{12,180}\?)\s+([^?]{40,400}?)(?=\s+[A-Z][^?]{12,180}\?|$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) && faqs.length < max) {
    const q = m[1].trim();
    const a = m[2].replace(/Stay Informed.*$/i, "").trim();
    if (q.split(" ").length < 4) continue;
    faqs.push({ q, a });
  }
  return faqs;
}

export function cityIntro(serviceName: string, cityName: string) {
  return `Professional ${serviceName.toLowerCase()} in ${cityName}, CA from Carpet & Duct Cleaning. IICRC-certified technicians, Google Guaranteed, BBB A+, serving Orange County since 2013. Same-day openings. Call (949) 992-3299.`;
}
