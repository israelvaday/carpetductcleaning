import { acceptLead, composeLeadEmail, createLeadId, type LeadDraft } from "@/lib/leads/model";

export type DeliveryChannel = "inbox" | "mailto";

export type DeliveryResult = {
  channel: DeliveryChannel;
  id: string;
};

/**
 * Sends a lead through the inbox endpoint when NEXT_PUBLIC_LEAD_ENDPOINT is set.
 * Until that hook exists, opens the visitor's mail app with the same composed message.
 */
export async function deliverLead(draft: LeadDraft): Promise<DeliveryResult> {
  const id = createLeadId();
  const submittedAt = new Date().toISOString();
  const page = draft.page || (typeof window !== "undefined" ? window.location.pathname : "");
  const lead = acceptLead({ ...draft, page }, id, submittedAt);
  const endpoint = process.env.NEXT_PUBLIC_LEAD_ENDPOINT;

  if (endpoint) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...lead }),
      });
      if (res.ok) return { channel: "inbox", id: lead.id };
    } catch {
      // The mailbox is optional until it is connected. Fall through to the mail app.
    }
  }

  const mail = composeLeadEmail(lead);
  const href = `mailto:${encodeURIComponent(mail.to)}?subject=${encodeURIComponent(mail.subject)}&body=${encodeURIComponent(mail.text)}`;
  window.location.href = href;
  return { channel: "mailto", id: lead.id };
}
