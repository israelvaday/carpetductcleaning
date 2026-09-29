"use client";

import { useState } from "react";
import { ConsentNote } from "@/components/legal";
import { deliverLead, type DeliveryChannel } from "@/lib/leads/deliver";
import { site } from "@/lib/site";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-line bg-sand px-4 py-3 font-normal text-ink outline-none focus:border-brand";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [channel, setChannel] = useState<DeliveryChannel | null>(null);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (k: string) => String(data.get(k) || "").trim();
    const contact = get("contact");
    const email = contact.includes("@") ? contact : "";
    const phone = email ? "" : contact;
    setSending(true);
    setError("");
    try {
      const result = await deliverLead({
        source: "contact-form",
        name: get("name"),
        phone,
        email,
        message: get("body"),
      });
      setChannel(result.channel);
      setSent(true);
    } catch {
      setError("We couldn't send that just now. Call us and we'll take it from here.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={onSubmit}>
      <label className="block text-sm font-semibold text-navy">
        Name
        <input required name="name" autoComplete="name" className={inputClass} />
      </label>
      <label className="block text-sm font-semibold text-navy">
        Phone or email
        <input required name="contact" autoComplete="tel" className={inputClass} />
      </label>
      <label className="block text-sm font-semibold text-navy">
        What do you need cleaned?
        <textarea required name="body" rows={4} className={inputClass} />
      </label>
      <ConsentNote />
      <button
        className="w-full rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-40"
        type="submit"
        disabled={sending}
      >
        {sending ? "Sending…" : "Send quote request"}
      </button>
      {error ? (
        <p className="text-sm font-medium text-navy" role="alert">
          {error}
        </p>
      ) : null}
      {sent && (
        <p className="text-sm text-ink/70" role="status">
          {channel === "inbox" ? (
            "We have your note. We'll reply on the next business day."
          ) : (
            <>
              Your email app should have opened with your request filled in. If it didn&apos;t, call{" "}
              <a className="font-semibold text-brand underline" href={site.phoneHref}>{site.phone}</a>.
            </>
          )}
        </p>
      )}
    </form>
  );
}
