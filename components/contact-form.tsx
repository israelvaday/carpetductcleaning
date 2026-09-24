"use client";

import { useState } from "react";
import { ConsentNote } from "@/components/legal";
import { site } from "@/lib/site";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-line bg-sand px-4 py-3 font-normal text-ink outline-none focus:border-brand";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (k: string) => String(data.get(k) || "").trim();
    // Mail apps only read subject and body from a mailto link, so every field goes into the body.
    const subject = encodeURIComponent(`Quote request from ${get("name")}`);
    const body = encodeURIComponent(`Name: ${get("name")}\nPhone or email: ${get("contact")}\n\n${get("body")}`);
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
    setSent(true);
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
        className="w-full rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark"
        type="submit"
      >
        Send quote request
      </button>
      {sent && (
        <p className="text-sm text-ink/70" role="status">
          Your email app should have opened with your request filled in. If it didn&apos;t, call{" "}
          <a className="font-semibold text-brand underline" href={site.phoneHref}>{site.phone}</a>.
        </p>
      )}
    </form>
  );
}
