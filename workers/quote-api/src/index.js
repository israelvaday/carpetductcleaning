const DEFAULT_TO = "info@carpetductcleaning.com";
const DEFAULT_FROM = "quotes@carpetductcleaning.com";
const DEFAULT_ORIGIN = "https://carpetductcleaning.com";

function esc(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function clip(value, max) {
  return String(value || "").trim().slice(0, max);
}

function allowOrigin(request, siteOrigin) {
  const origin = request.headers.get("Origin") || "";
  const allowed = new Set([siteOrigin, "https://www.carpetductcleaning.com"]);
  return allowed.has(origin) ? origin : siteOrigin;
}

function telHref(raw) {
  const digits = String(raw || "").replace(/[^0-9]/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return digits ? `+${digits}` : "";
}

function jobText(lead) {
  const lines = ["Carpet & Duct Cleaning"];
  for (const [label, value] of [
    ["Name", lead.name],
    ["Phone", lead.phone],
    ["Email", lead.email],
    ["Service", lead.service],
    ["City", lead.city],
    ["Property", lead.property],
    ["Timing", lead.timing],
  ]) {
    if (value) lines.push("", `${label}: ${value}`);
  }
  if (lead.message) lines.push("", "Details:", lead.message);
  return lines.join("\n");
}

function copyHref(lead) {
  const query = new URLSearchParams();
  const fields = { n: lead.name, p: lead.phone, e: lead.email, s: lead.service, c: lead.city, r: lead.property, i: lead.timing, m: lead.message };
  for (const [key, value] of Object.entries(fields)) {
    if (value) query.set(key, value);
  }
  return `https://api.carpetductcleaning.com/copy?${query.toString()}`;
}

function copyPage(url) {
  const lead = {
    name: clip(url.searchParams.get("n"), 120),
    phone: clip(url.searchParams.get("p"), 40),
    email: clip(url.searchParams.get("e"), 160),
    service: clip(url.searchParams.get("s"), 80),
    city: clip(url.searchParams.get("c"), 80),
    property: clip(url.searchParams.get("r"), 80),
    timing: clip(url.searchParams.get("i"), 80),
    message: clip(url.searchParams.get("m"), 4000),
  };
  const job = jobText(lead);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Copy job</title>
</head>
<body style="margin:0;background:#f7f4ee;font-family:Arial,sans-serif;color:#0a1526">
  <main style="max-width:560px;margin:0 auto;padding:24px 16px">
    <p style="margin:0;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#0e7f7a">Carpet &amp; Duct Cleaning</p>
    <h1 style="margin:8px 0 16px;font-size:28px">Copy job</h1>
    <pre id="job" style="white-space:pre-wrap;background:#fff;border-radius:16px;padding:16px;font-family:Arial,sans-serif;font-size:16px;line-height:1.5">${esc(job)}</pre>
    <button id="copy" type="button" style="display:block;width:100%;margin-top:16px;background:#0b2237;color:#fff;border:0;border-radius:999px;padding:14px 18px;font-size:16px;font-weight:700">Copy job</button>
    <p id="status" style="min-height:1.4em;font-size:14px;color:#5c6b7a"></p>
  </main>
  <script>
    const job = document.getElementById("job");
    const status = document.getElementById("status");
    document.getElementById("copy").addEventListener("click", async () => {
      const text = job.textContent || "";
      try {
        await navigator.clipboard.writeText(text);
        status.textContent = "Copied. Paste it into your text.";
      } catch (err) {
        const range = document.createRange();
        range.selectNodeContents(job);
        const sel = getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        status.textContent = "Hold the job text, then tap Copy.";
      }
    });
  </script>
</body>
</html>`;
}

function mailFor(lead) {
  const sourceLabel = lead.source === "quote-wizard" ? "Guided quote" : "Contact form";
  const place = lead.city ? ` in ${lead.city}` : "";
  const about = lead.service ? `${lead.service}${place}` : `cleaning${place}`;
  const subject = `Quote request — ${about}`;
  const phoneLink = telHref(lead.phone);
  const rows = [
    ["Source", sourceLabel],
    ["Name", lead.name],
    ["Phone", lead.phone || "—"],
    ["Email", lead.email || "—"],
    ["City", lead.city || "—"],
    ["Service", lead.service || "—"],
    ["Property", lead.property || "—"],
    ["Timing", lead.timing || "—"],
  ];
  const text = [subject, "", ...rows.map(([k, v]) => `${k}: ${v}`), "", "Details:", lead.message || "—"].join("\n");
  const htmlRows = rows
    .map(
      ([k, v]) =>
        `<tr><th style="text-align:left;padding:8px 12px;color:#5c6b7a;width:120px;border-bottom:1px solid #efe9df">${esc(k)}</th><td style="padding:8px 12px;color:#0a1526;border-bottom:1px solid #efe9df">${esc(v)}</td></tr>`,
    )
    .join("");
  const callButton = phoneLink
    ? `<a href="tel:${phoneLink}" style="display:block;background:#f0a92e;color:#0b2237;text-decoration:none;font-family:Arial,sans-serif;font-weight:700;font-size:16px;text-align:center;padding:14px 18px;border-radius:999px">Call client</a>`
    : "";
  const copyButton = `<a href="${esc(copyHref(lead))}" style="display:block;background:#0b2237;color:#fff;text-decoration:none;font-family:Arial,sans-serif;font-weight:700;font-size:16px;text-align:center;padding:14px 18px;border-radius:999px">Copy job</a>`;
  const html = `<!doctype html><body style="margin:0;background:#f7f4ee;font-family:Georgia,serif;color:#0a1526">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4ee;padding:24px 12px"><tr><td align="center">
    <table role="presentation" width="100%" style="max-width:560px;background:#fff;border-radius:16px">
      <tr><td style="background:#0b2237;padding:20px 24px">
        <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#f0a92e">Carpet &amp; Duct Cleaning</p>
        <h1 style="margin:8px 0 0;font-size:22px;color:#fff">${esc(subject)}</h1>
      </td></tr>
      <tr><td style="padding:8px 12px"><table width="100%" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${htmlRows}</table></td></tr>
      <tr><td style="padding:8px 24px 8px;font-family:Arial,sans-serif;font-size:14px;line-height:1.5">
        <p style="margin:12px 0 6px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#0e7f7a">Details</p>
        <p style="margin:0;white-space:pre-wrap">${esc(lead.message || "—")}</p>
      </td></tr>
      <tr><td style="padding:16px 24px 8px">${callButton}</td></tr>
      <tr><td style="padding:8px 24px 24px">${copyButton}</td></tr>
    </table>
  </td></tr></table></body>`;
  return { subject, text, html };
}

export default {
  async fetch(request, env) {
    const siteOrigin = env.SITE_ORIGIN || DEFAULT_ORIGIN;
    const headers = {
      "Access-Control-Allow-Origin": allowOrigin(request, siteOrigin),
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
      Vary: "Origin",
    };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname.replace(/\/$/, "") === "/copy") {
      return new Response(copyPage(url), {
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
      });
    }
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers });

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400, headers });
    }

    const source = body?.source === "quote-wizard" ? "quote-wizard" : body?.source === "contact-form" ? "contact-form" : "";
    const name = clip(body?.name, 120);
    if (!source || !name) {
      return Response.json({ error: "Missing required fields" }, { status: 400, headers });
    }
    if (source === "contact-form" && !clip(body?.message, 4000)) {
      return Response.json({ error: "Missing message" }, { status: 400, headers });
    }

    const lead = {
      source,
      name,
      phone: clip(body.phone, 40),
      email: clip(body.email, 160),
      city: clip(body.city, 80),
      service: clip(body.service, 80),
      property: clip(body.property, 80),
      timing: clip(body.timing, 80),
      message: clip(body.message, 4000),
      page: clip(body.page, 180),
    };
    const mail = mailFor(lead);
    try {
      const sent = await env.EMAIL.send({
        to: env.QUOTE_TO || DEFAULT_TO,
        from: env.FROM_EMAIL || DEFAULT_FROM,
        replyTo: lead.email || undefined,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
      });
      return Response.json({ ok: true, id: sent?.messageId || "" }, { headers });
    } catch (error) {
      return Response.json({ ok: false, error: error?.message || "Email failed" }, { status: 502, headers });
    }
  },
};
