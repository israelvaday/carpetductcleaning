import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { cityEntries } from "@/lib/content";
import { asset } from "@/lib/images";
import { moneyServices, site } from "@/lib/site";
import { titleCase } from "@/lib/utils";

const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${site.name} ${site.street} ${site.city} ${site.region} ${site.postalCode}`,
)}`;

export function Footer() {
  const cities = cityEntries().filter((c) => c.service === "carpet-cleaning");

  return (
    <footer className="bg-navy text-white">
      <div className="container-page grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Image src={asset("/images/logo.webp")} alt={`${site.name} logo`} width={220} height={47} className="h-9 w-auto" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
            Carpet, rug, upholstery, and air duct cleaning across {site.area} since {site.foundingYear}.
          </p>
          <a href={site.phoneHref} className="mt-5 inline-flex items-center gap-2 text-lg font-semibold text-white">
            <Phone className="size-4 text-brand-50" />
            {site.phone}
          </a>
          <a href={mapsHref} className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-white/70 hover:text-white">
            <MapPin className="mt-0.5 size-4 shrink-0 text-brand-50" />
            <span>
              {site.street}
              <br />
              {site.city}, {site.region} {site.postalCode}
            </span>
          </a>
          <div className="mt-5 flex items-center gap-4">
            <Image src={asset("/images/google.webp")} alt="Google Guaranteed badge" width={130} height={50} className="h-8 w-auto object-contain" />
            <Image src={asset("/images/bbb.webp")} alt="BBB Accredited Business A+ rating" width={130} height={52} className="h-8 w-auto object-contain" />
          </div>
        </div>

        <div className="lg:col-span-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Services</p>
          <ul className="mt-3 space-y-2 text-sm">
            {moneyServices.map((s) => (
              <li key={s.href}>
                <Link href={s.href} className="text-white/75 hover:text-white">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Cities</p>
          <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-2 text-sm">
            {cities.map((c) => (
              <li key={c.route}>
                <Link href={`${c.route}/`} className="text-white/70 hover:text-white">
                  {titleCase(c.city)}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/locations/" className="mt-4 inline-block text-sm font-semibold text-brand-50 hover:text-white">
            All service areas
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-wrap items-center justify-between gap-4 py-5 text-sm text-white/55">
          <p>
            © {new Date().getFullYear()} {site.name}
          </p>
          <nav className="flex flex-wrap gap-4">
            <Link href="/privacy-policy/" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/terms/" className="hover:text-white">
              Terms
            </Link>
            <Link href="/sms-terms/" className="hover:text-white">
              SMS terms
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
