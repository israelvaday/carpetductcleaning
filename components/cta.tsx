import Image from "next/image";
import { CallButton, QuoteButton, TrustRow } from "@/components/ui";
import { asset } from "@/lib/images";
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
          <div className="relative min-h-64 lg:min-h-full">
            <Image
              src={asset("/images/truck-mount.webp")}
              alt="Truck-mounted extraction hose running into an Orange County home"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
