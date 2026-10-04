const DEFAULT_TO = "israelvaday97@gmail.com";
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

function mailFor(lead) {
  const sourceLabel = lead.source === "quote-wizard" ? "Guided quote" : "Contact form";
  const place = lead.city ? ` in ${lead.city}` : "";
  const about = lead.service ? `${lead.service}${place}` : `cleaning${place}`;
  const subject = `Quote request — ${about}`;
  const rows = [
    ["Source", sourceLabel],
    ["Page", lead.page || "—"],
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
  const html = `<!doctype html><body style="margin:0;background:#f7f4ee;font-family:Georgia,serif;color:#0a1526">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4ee;padding:24px 12px"><tr><td align="center">
    <table role="presentation" width="100%" style="max-width:560px;background:#fff;border-radius:16px">
      <tr><td style="background:#0b2237;padding:20px 24px">
        <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#f0a92e">Carpet &amp; Duct Cleaning</p>
        <h1 style="margin:8px 0 0;font-size:22px;color:#fff">${esc(subject)}</h1>
      </td></tr>
      <tr><td style="padding:8px 12px"><table width="100%" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${htmlRows}</table></td></tr>
      <tr><td style="padding:8px 24px 24px;font-family:Arial,sans-serif;font-size:14px;line-height:1.5">
        <p style="margin:12px 0 6px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#0e7f7a">Details</p>
        <p style="margin:0;white-space:pre-wrap">${esc(lead.message || "—")}</p>
      </td></tr>
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
