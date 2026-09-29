import { site } from "@/lib/site";

export const LEAD_SOURCES = ["quote-wizard", "contact-form"] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

/** What the browser collects. The inbox rebuilds the email from this, not from client HTML. */
export type LeadDraft = {
  source: LeadSource;
  name: string;
  phone?: string;
  email?: string;
  city?: string;
  service?: string;
  property?: string;
  timing?: string;
  message?: string;
  page?: string;
};

export type LeadRecord = {
  id: string;
  submittedAt: string;
  source: LeadSource;
  name: string;
  phone: string;
  email: string;
  city: string;
  service: string;
  property: string;
  timing: string;
  message: string;
  page: string;
};

export type LeadMail = {
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
  lead: LeadRecord;
};

export class LeadValidationError extends Error {
  readonly fields: string[];

  constructor(fields: string[]) {
    super(`Lead is missing ${fields.join(", ")}`);
    this.name = "LeadValidationError";
    this.fields = fields;
  }
}

const LIMITS = {
  name: 120,
  phone: 40,
  email: 160,
  city: 80,
  service: 80,
  property: 80,
  timing: 80,
  message: 4000,
  page: 180,
} as const;

export function createLeadId() {
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `cdc_${time}${rand}`;
}

export function acceptLead(raw: unknown, id?: string, submittedAt?: string): LeadRecord {
  if (!raw || typeof raw !== "object") throw new LeadValidationError(["body"]);
  const input = raw as Partial<LeadDraft> & { id?: unknown; submittedAt?: unknown };
  const source = input.source;
  if (source !== "quote-wizard" && source !== "contact-form") throw new LeadValidationError(["source"]);

  const name = clip(input.name, LIMITS.name);
  const phone = clip(input.phone, LIMITS.phone);
  const email = clip(input.email, LIMITS.email).toLowerCase();
  const city = clip(input.city, LIMITS.city);
  const service = clip(input.service, LIMITS.service);
  const property = clip(input.property, LIMITS.property);
  const timing = clip(input.timing, LIMITS.timing);
  const message = clip(input.message, LIMITS.message, true);
  const page = safePage(input.page);

  const missing: string[] = [];
  if (!name) missing.push("name");
  if (source === "quote-wizard") {
    if (digits(phone).length < 7) missing.push("phone");
    if (!city) missing.push("city");
    if (!service) missing.push("service");
  } else if (digits(phone).length < 7 && !isEmail(email)) {
    missing.push("phone or email");
  }
  if (email && !isEmail(email)) missing.push("email");
  if (message.length === 0 && source === "contact-form") missing.push("message");
  if (missing.length) throw new LeadValidationError(missing);

  const stampInput = submittedAt || (typeof input.submittedAt === "string" ? input.submittedAt : "");
  const stamp = Number.isNaN(Date.parse(stampInput)) ? new Date().toISOString() : stampInput;
  const idInput = id || (typeof input.id === "string" ? input.id : "");
  const leadId = /^cdc_[a-z0-9]{8,32}$/.test(idInput) ? idInput : createLeadId();

  return {
    id: leadId,
    submittedAt: stamp,
    source,
    name,
    phone,
    email,
    city,
    service,
    property,
    timing,
    message,
    page,
  };
}

export function composeLeadEmail(lead: LeadRecord): LeadMail {
  const sourceLabel = lead.source === "quote-wizard" ? "Guided quote" : "Contact form";
  const place = lead.city ? ` in ${lead.city}` : "";
  const about = lead.service ? `${lead.service}${place}` : `cleaning${place}`;
  const subject = `Quote request — ${about}`;
  const rows: [string, string][] = [
    ["Lead", lead.id],
    ["Received", formatStamp(lead.submittedAt)],
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

  const text = [
    subject,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Details:",
    lead.message || "—",
  ].join("\n");

  const htmlRows = rows
    .map(
      ([label, value]) =>
        `<tr><th style="text-align:left;padding:8px 12px;color:#5c6b7a;font-weight:600;width:120px;border-bottom:1px solid #efe9df">${esc(label)}</th><td style="padding:8px 12px;color:#0a1526;border-bottom:1px solid #efe9df">${esc(value)}</td></tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html><html><body style="margin:0;background:#f7f4ee;font-family:Georgia,serif;color:#0a1526">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4ee;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
        <tr><td style="background:#0b2237;padding:20px 24px">
          <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#f0a92e">Carpet &amp; Duct Cleaning</p>
          <h1 style="margin:8px 0 0;font-size:22px;line-height:1.3;color:#ffffff">${esc(subject)}</h1>
        </td></tr>
        <tr><td style="padding:8px 12px 4px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${htmlRows}</table>
        </td></tr>
        <tr><td style="padding:8px 24px 24px;font-family:Arial,sans-serif;font-size:14px;line-height:1.5">
          <p style="margin:12px 0 6px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#0e7f7a">Details</p>
          <p style="margin:0;white-space:pre-wrap">${esc(lead.message || "—")}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return {
    to: site.email,
    replyTo: lead.email || undefined,
    subject,
    text,
    html,
    lead,
  };
}

function clip(value: unknown, max: number, keepBreaks = false) {
  const text = String(value ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
  if (keepBreaks) {
    return text.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim().slice(0, max);
  }
  return text.replace(/\s+/g, " ").trim().slice(0, max);
}

function digits(value: string) {
  return value.replace(/\D/g, "");
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function safePage(value: unknown) {
  const page = clip(value, LIMITS.page);
  if (!page.startsWith("/") || page.startsWith("//")) return "";
  return page;
}

function formatStamp(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Los_Angeles",
  }).format(date);
}

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
