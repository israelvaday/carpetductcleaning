import { acceptLead, composeLeadEmail, type LeadMail } from "@/lib/leads/model";
import { site } from "@/lib/site";

export type Mailbox = {
  send(mail: LeadMail): Promise<{ providerId: string }>;
};

/**
 * Inbox pipeline: accept the lead JSON, compose the message, hand it to a mailbox.
 * Wire a provider with mailboxFromEnv() once RESEND_API_KEY and LEAD_MAIL_FROM exist.
 */
export async function runInbox(raw: unknown, mailbox: Mailbox = mailboxFromEnv()) {
  const lead = acceptLead(raw);
  const mail = composeLeadEmail(lead);
  const sent = await mailbox.send(mail);
  return { leadId: lead.id, providerId: sent.providerId, subject: mail.subject };
}

export function mailboxFromEnv(): Mailbox {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.LEAD_MAIL_FROM;
  const to = process.env.LEAD_MAIL_TO || site.email;
  if (apiKey && from) return resendMailbox({ apiKey, from, to });
  return unconfiguredMailbox;
}

export function resendMailbox(opts: { apiKey: string; from: string; to: string }): Mailbox {
  return {
    async send(mail) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${opts.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: opts.from,
          to: [opts.to],
          reply_to: mail.replyTo,
          subject: mail.subject,
          text: mail.text,
          html: mail.html,
          headers: { "X-Lead-Id": mail.lead.id },
        }),
      });
      if (!res.ok) {
        const detail = await res.text();
        throw new Error(`Resend rejected the lead email (${res.status}): ${detail.slice(0, 180)}`);
      }
      const data = (await res.json()) as { id?: string };
      return { providerId: data.id || mail.lead.id };
    },
  };
}

export const unconfiguredMailbox: Mailbox = {
  async send() {
    throw new Error("Inbox mailbox is not connected. Set RESEND_API_KEY and LEAD_MAIL_FROM.");
  },
};
