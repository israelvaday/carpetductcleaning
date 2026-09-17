import Link from "next/link";
import { site, moneyServices } from "@/lib/site";
import { cityEntries, serviceSlugs } from "@/lib/content";
import { titleCase } from "@/lib/utils";

export function Footer() {
  const cities = cityEntries().filter((c) => c.service === "carpet-cleaning");
  return (
    <footer className="mt-16 border-t border-navy/10 bg-navy text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4">
        <div>
          <p className="font-semibold">{site.name}</p>
          <p className="mt-2 text-sm text-white/70">
            Irvine / Orange County. Serving homes and businesses since {site.foundingYear}.
          </p>
          <a href={site.phoneHref} className="mt-3 inline-block font-semibold text-teal-200">
            {site.phone}
          </a>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/60">Services</p>
          <ul className="space-y-1 text-sm">
            {moneyServices.map((s) => (
              <li key={s.href}>
                <Link href={s.href} className="text-white/80 hover:text-white">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/60">Cities</p>
          <ul className="columns-2 space-y-1 text-sm">
            {cities.map((c) => (
              <li key={c.route}>
                <Link href={`${c.route}/`} className="text-white/80 hover:text-white">
                  {titleCase(c.city)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/60">Company</p>
          <ul className="space-y-1 text-sm text-white/80">
            <li>
              <Link href="/about/">About</Link>
            </li>
            <li>
              <Link href="/contact/">Contact</Link>
            </li>
            <li>
              <Link href="/blog/">Blog</Link>
            </li>
            <li>
              <Link href="/privacy-policy/">Privacy</Link>
            </li>
            <li>
              <Link href="/terms/">Terms</Link>
            </li>
            <li>
              <Link href="/sms-terms/">SMS terms</Link>
            </li>
          </ul>
          <p className="mt-4 text-xs text-white/50">
            More services:{" "}
            {serviceSlugs()
              .slice(8, 14)
              .map((s) => titleCase(s))
              .join(" · ")}
          </p>
        </div>
      </div>
    </footer>
  );
}
