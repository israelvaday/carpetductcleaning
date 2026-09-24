import type { ReactNode } from "react";
import Link from "next/link";
import { Section } from "@/components/ui";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export const LEGAL_UPDATED = "September 23, 2026";

export function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: { heading: string; body: ReactNode[] }[];
}) {
  return (
    <Section tone="light">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-semibold text-navy">{title}</h1>
        <p className="mt-2 text-sm text-ink/55">Last updated {LEGAL_UPDATED}</p>
        <p className="prose-body mt-6">{intro}</p>
        {sections.map((s) => (
          <section key={s.heading} className="mt-10">
            <h2 className="text-xl font-semibold text-navy">{s.heading}</h2>
            {s.body.map((p, i) => (
              <p key={i} className="prose-body mt-3">
                {p}
              </p>
            ))}
          </section>
        ))}
        <p className="prose-body mt-10">
          Questions? Call <a className="underline" href={site.phoneHref}>{site.phone}</a> or email{" "}
          <a className="underline" href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </div>
    </Section>
  );
}

export function ConsentNote({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs leading-relaxed text-ink/55", className)}>
      By sending this request you agree that {site.shortName} may call or text you at the number provided about your
      quote and appointment. Consent is not a condition of purchase. Message and data rates may apply; reply STOP to opt
      out. See our{" "}
      <Link className="underline" href="/privacy-policy/">Privacy Policy</Link>,{" "}
      <Link className="underline" href="/terms/">Terms</Link>, and{" "}
      <Link className="underline" href="/sms-terms/">SMS terms</Link>.
    </p>
  );
}
