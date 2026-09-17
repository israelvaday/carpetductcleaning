import { site } from "@/lib/site";

export function Cta({ title = "Need service in Orange County?" }: { title?: string }) {
  return (
    <section className="mt-14 rounded-2xl bg-navy px-6 py-10 text-white">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-xl text-white/75">
        Same-day and next-day openings. IICRC technicians. Upfront quotes. Google Guaranteed.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a href={site.phoneHref} className="rounded-full bg-teal px-5 py-2.5 font-semibold">
          Call {site.phone}
        </a>
        <a href="/contact/" className="rounded-full border border-white/30 px-5 py-2.5">
          Request a quote
        </a>
      </div>
    </section>
  );
}
