import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { cityEntries } from "@/lib/content";
import { asset } from "@/lib/images";
import { SERVICE_GROUPS } from "@/lib/services";
import { site } from "@/lib/site";
import { titleCase } from "@/lib/utils";

export function Footer() {
  const cities = cityEntries().filter((c) => c.service === "carpet-cleaning");
  const columns = SERVICE_GROUPS.slice(0, 3);

  return (
    <footer className="bg-navy text-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Image src={asset("/images/logo.webp")} alt={`${site.name} logo`} width={220} height={47} className="h-9 w-auto" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
            {site.name} has cleaned carpets, rugs, upholstery, and air ducts across Irvine and Orange County since{" "}
            {site.foundingYear}. IICRC-certified technicians, Google Guaranteed, BBB A+.
          </p>
          <a href={site.phoneHref} className="mt-5 inline-flex items-center gap-2 text-lg font-semibold text-white">
            <Phone className="size-4 text-brand-50" />
            {site.phone}
          </a>
          <p className="mt-2 flex items-center gap-2 text-sm text-white/60">
            <MapPin className="size-4" />
            {site.city}, {site.region} · {site.area}
          </p>
          <div className="mt-5 flex items-center gap-4">
            <Image
              src={asset("/images/google.webp")}
              alt="Google Guaranteed badge"
              width={130}
              height={50}
              className="h-8 w-auto object-contain"
            />
            <Image
              src={asset("/images/bbb.webp")}
              alt="BBB Accredited Business A+ rating"
              width={130}
              height={52}
              className="h-8 w-auto object-contain"
            />
          </div>
        </div>

        {columns.map((group) => (
          <div key={group.title}>
            <p className="text-xs font-bold uppercase tracking-wider text-white/50">{group.title}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {group.slugs.map((slug) => (
                <li key={slug}>
                  <Link href={`/${slug}/`} className="text-white/75 hover:text-white">
                    {titleCase(slug)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-page py-8">
          <p className="text-xs font-bold uppercase tracking-wider text-white/50">Carpet cleaning by city</p>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {cities.map((c) => (
              <li key={c.route}>
                <Link href={`${c.route}/`} className="text-white/70 hover:text-white">
                  {titleCase(c.city)}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/locations/" className="font-semibold text-brand-50 hover:text-white">
                All service areas
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-wrap items-center justify-between gap-4 py-6 text-sm text-white/55">
          <p>
            © {new Date().getFullYear()} {site.name}. Serving Orange County since {site.foundingYear}.
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
