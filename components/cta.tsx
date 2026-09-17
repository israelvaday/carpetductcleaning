import { Phone, Star, ShieldCheck, Clock } from "lucide-react";
import { CallButton, QuoteButton, TrustRow } from "@/components/ui";
import { site } from "@/lib/site";

export function Cta({
  title = "Book a cleaning in Orange County",
  body = "Same-day and next-day openings. IICRC technicians, itemized quotes on-site, and products that are safe for kids and pets.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="container-page">
        <div className="grid overflow-hidden rounded-3xl bg-navy text-white shadow-lift lg:grid-cols-2">
          <div className="p-8 md:p-12">
            <p className="eyebrow text-brand-50">Ready when you are</p>
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">{title}</h2>
            <p className="mt-4 text-lg leading-relaxed text-white/75">{body}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CallButton />
              <QuoteButton dark />
            </div>
            <p className="mt-6 text-sm text-white/60">
              Call {site.phone} · Serving {site.city} and {site.area} since {site.foundingYear}
            </p>
            <div className="mt-6">
              <TrustRow dark />
            </div>
          </div>
          {/* No photo here — the CTA band renders on every page, and repeating
              one image site-wide is against the house rule. A stat panel keeps
              the layout balanced without burning a photo. */}
          <div className="relative flex min-h-64 flex-col justify-center gap-6 bg-gradient-to-br from-brand/25 via-navy to-navy p-8 md:p-12 lg:min-h-full">
            <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
            <div className="relative">
              <p className="flex items-center gap-1 text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-5 fill-current" />
                ))}
              </p>
              <p className="mt-2 text-2xl font-semibold">{site.rating} on Google</p>
              <p className="text-sm text-white/65">from {site.reviewCount}+ verified reviews</p>
            </div>
            <div className="relative flex flex-col gap-3 text-sm">
              <p className="flex items-center gap-2.5 text-white/80">
                <ShieldCheck className="size-4 shrink-0 text-brand-50" />
                Google Guaranteed · BBB A+ · IICRC certified
              </p>
              <p className="flex items-center gap-2.5 text-white/80">
                <Clock className="size-4 shrink-0 text-brand-50" />
                Same-day and next-day openings
              </p>
              <a
                href={site.phoneHref}
                className="mt-1 flex items-center gap-2.5 text-xl font-bold text-white transition hover:text-brand-50"
              >
                <Phone className="size-5 shrink-0 text-gold" />
                {site.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
