import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu, Phone } from "lucide-react";
import { site } from "@/lib/site";
import { SERVICE_GROUPS } from "@/lib/services";
import { asset, serviceImage } from "@/lib/images";
import { titleCase } from "@/lib/utils";

const featured = ["carpet-cleaning", "air-duct-cleaning", "upholstery-cleaning", "water-damage-restoration"];

const navLinks = [
  { href: "/locations/", label: "Locations" },
  { href: "/about/", label: "About" },
  { href: "/blog/", label: "Blog" },
  { href: "/contact/", label: "Contact" },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label={`${site.name} home`}>
      <Image
        src={asset("/images/logo.webp")}
        alt={`${site.name} logo`}
        width={220}
        height={47}
        className="h-9 w-auto"
        priority
      />
      <span className="sr-only">{site.name}</span>
    </Link>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-navy/95 text-white backdrop-blur supports-backdrop-filter:bg-navy/85 lg:relative">
      <p className="hidden border-b border-white/10 py-2 text-center text-sm text-white/70 md:block">
        Serving Irvine and Orange County since {site.foundingYear} · Same-day openings ·{" "}
        <a href={site.phoneHref} className="font-semibold text-white hover:text-brand-50">
          {site.phone}
        </a>
      </p>
      <div className="container-page flex items-center justify-between gap-4 py-3">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          <details className="group [&[open]>summary>svg]:rotate-180">
            <summary className="flex cursor-pointer list-none items-center gap-1 rounded-full px-3 py-2 text-sm font-medium hover:bg-white/10">
              Services
              <ChevronDown className="size-4 transition" />
            </summary>
            <div className="absolute inset-x-0 top-full z-50 mx-auto mt-2 w-[min(58rem,calc(100vw-3rem))] rounded-2xl border border-line bg-white p-6 text-ink shadow-lift">
              <div className="grid gap-6 md:grid-cols-[1fr_1fr_1fr]">
                {SERVICE_GROUPS.map((group) => (
                  <div key={group.title}>
                    <p className="text-xs font-bold uppercase tracking-wider text-brand">{group.title}</p>
                    <ul className="mt-2 space-y-1">
                      {group.slugs.map((slug) => (
                        <li key={slug}>
                          <Link
                            href={`/${slug}/`}
                            className="block rounded-lg px-2 py-1.5 text-sm text-ink/80 hover:bg-sand hover:text-navy"
                          >
                            {titleCase(slug)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-3 border-t border-line pt-5 sm:grid-cols-4">
                {featured.map((slug) => {
                  const image = serviceImage(slug, "card");
                  return (
                    <Link key={slug} href={`/${slug}/`} className="group/card block">
                      <span className="block overflow-hidden rounded-xl">
                        <Image
                          src={image.src}
                          alt={image.alt}
                          width={360}
                          height={240}
                          className="h-24 w-full object-cover transition group-hover/card:scale-105"
                        />
                      </span>
                      <span className="mt-2 block text-sm font-semibold text-navy">{titleCase(slug)}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </details>

          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-2 text-sm font-medium hover:bg-white/10"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={site.phoneHref}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            <Phone className="size-4" />
            <span className="hidden sm:inline">{site.phone}</span>
            <span className="sm:hidden">Call</span>
          </a>
          <details className="relative lg:hidden">
            <summary className="flex cursor-pointer list-none items-center rounded-full border border-white/25 p-2.5">
              <Menu className="size-5" />
              <span className="sr-only">Menu</span>
            </summary>
            <div className="absolute right-0 top-full z-50 mt-2 max-h-[70vh] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-line bg-white p-4 text-ink shadow-lift">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="block rounded-lg px-3 py-2 font-medium text-navy hover:bg-sand"
                >
                  {l.label}
                </Link>
              ))}
              {SERVICE_GROUPS.map((group) => (
                <div key={group.title} className="mt-3 border-t border-line pt-3">
                  <p className="px-3 text-xs font-bold uppercase tracking-wider text-brand">{group.title}</p>
                  <ul className="mt-1">
                    {group.slugs.map((slug) => (
                      <li key={slug}>
                        <Link
                          href={`/${slug}/`}
                          className="block rounded-lg px-3 py-1.5 text-sm text-ink/80 hover:bg-sand"
                        >
                          {titleCase(slug)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
