import Link from "next/link";
import { Phone } from "lucide-react";
import { moneyServices, site } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy/95 text-white backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-semibold tracking-tight">
          {site.shortName}
        </Link>
        <nav className="hidden items-center gap-5 text-sm md:flex">
          <details className="relative">
            <summary className="cursor-pointer list-none">Services</summary>
            <div className="absolute left-0 top-full mt-2 grid w-72 gap-1 rounded-lg bg-white p-3 text-navy shadow-xl">
              {moneyServices.map((s) => (
                <Link key={s.href} href={s.href} className="rounded px-2 py-1.5 hover:bg-sand">
                  {s.label}
                </Link>
              ))}
            </div>
          </details>
          <Link href="/locations/" className="hover:text-teal-200">
            Locations
          </Link>
          <Link href="/blog/" className="hover:text-teal-200">
            Blog
          </Link>
          <Link href="/about/" className="hover:text-teal-200">
            About
          </Link>
          <Link href="/contact/" className="hover:text-teal-200">
            Contact
          </Link>
        </nav>
        <a
          href={site.phoneHref}
          className="inline-flex items-center gap-2 rounded-full bg-teal px-3 py-2 text-sm font-semibold text-white"
        >
          <Phone className="size-4" />
          <span className="hidden sm:inline">{site.phone}</span>
          <span className="sm:hidden">Call</span>
        </a>
      </div>
    </header>
  );
}
