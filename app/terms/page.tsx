import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  alternates: { canonical: "/terms/" },
};

export default function TermsPage() {
  return (
    <article className="max-w-2xl">
      <h1 className="text-4xl font-semibold">Terms</h1>
      <p className="mt-4 text-navy/75">
        Quotes are confirmed on site. Work begins only after you approve the price. We are licensed and insured. These
        terms apply to services booked through carpetductcleaning.com.
      </p>
    </article>
  );
}
