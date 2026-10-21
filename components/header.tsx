"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { ChevronDown, Clock, MapPin, Menu, Phone, X } from "lucide-react";
import { useQuote } from "@/components/quote-dialog";
import { asset } from "@/lib/images";
import { serviceFromPath } from "@/lib/quote-services";
import { SERVICE_GROUPS, serviceName } from "@/lib/services";
import { site } from "@/lib/site";
import { titleCase } from "@/lib/utils";

const navLinks = [
  { href: "/locations/", label: "Locations" },
  { href: "/about/", label: "About" },
  { href: "/blog/", label: "Blog" },
  { href: "/contact/", label: "Contact" },
];

const groups = SERVICE_GROUPS.map((group) => ({
  title: group.title,
  items: group.slugs.map((slug) => ({
    href: `/${slug}/`,
    label: serviceName(slug, titleCase(slug)),
  })),
}));

function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center">
      <Image
        src={asset("/images/logo.webp")}
        alt={site.name}
        width={220}
        height={47}
        className="h-8 w-auto max-w-[38vw] object-contain object-left sm:h-9 sm:max-w-none"
        priority
      />
    </Link>
  );
}

export function Header({ hours }: { hours?: string }) {
  const pathname = usePathname();
  const { openQuote } = useQuote();
  const [menu, setMenu] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMenu("");
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy text-white">
      <div className="border-b border-white/10 bg-navy-800 xl:hidden">
        <div className="container-page flex min-h-9 flex-wrap items-center justify-center gap-x-5 gap-y-0.5 py-1 text-center text-[13px] font-medium text-white/85 sm:text-sm">
          {hours ? (
            <span className="flex items-center gap-2">
              <Clock className="size-4 shrink-0 text-gold" aria-hidden />
              <span>{hours}</span>
            </span>
          ) : null}
          <a
            href={site.mapsUrl}
            target="_blank"
            rel="noopener"
            className="flex items-center gap-2 transition hover:text-white"
          >
            <MapPin className="size-4 shrink-0 text-gold" aria-hidden />
            <span>{`${site.street}, ${site.city}, ${site.region} ${site.postalCode}`}</span>
          </a>
        </div>
      </div>
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-4">
          <Logo />
          <div className="hidden min-w-0 flex-col gap-0.5 border-l border-white/15 pl-4 text-[13px] font-medium leading-snug text-white/85 xl:flex">
            {hours ? (
              <p className="flex items-start gap-2">
                <Clock className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                <span>{hours}</span>
              </p>
            ) : null}
            <a
              href={site.mapsUrl}
              target="_blank"
              rel="noopener"
              className="flex items-start gap-2 transition hover:text-white"
            >
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
              <span>{`${site.street}, ${site.city}, ${site.region} ${site.postalCode}`}</span>
            </a>
          </div>
        </div>

        <NavigationMenu.Root
          value={menu}
          onValueChange={setMenu}
          className="relative hidden lg:block"
        >
          <NavigationMenu.List className="flex items-center gap-1">
            <NavigationMenu.Item className="relative">
              <NavigationMenu.Trigger className="group inline-flex items-center gap-1 rounded-full px-3 py-2 text-[15px] font-medium outline-none hover:bg-white/10 data-[state=open]:bg-white/10">
                Services
                <ChevronDown className="size-4 transition group-data-[state=open]:rotate-180" />
              </NavigationMenu.Trigger>
              <NavigationMenu.Content className="fixed left-1/2 top-[6.5rem] z-50 mt-2 max-h-[calc(100vh-8.5rem)] w-[min(68rem,calc(100vw-2rem))] -translate-x-1/2 overflow-y-auto rounded-2xl border border-line bg-white p-6 text-ink shadow-lift">
                <div className="grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-4">
                  {groups.map((group) => (
                    <div key={group.title}>
                      <p className="text-xs font-bold uppercase tracking-wider text-brand">{group.title}</p>
                      <ul className="mt-2 space-y-0.5">
                        {group.items.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className="block rounded-lg px-2 py-1.5 text-[15px] font-medium text-navy hover:bg-sand hover:text-brand"
                              onClick={() => setMenu("")}
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </NavigationMenu.Content>
            </NavigationMenu.Item>

            {navLinks.map((l) => (
              <NavigationMenu.Item key={l.href}>
                <NavigationMenu.Link asChild>
                  <Link href={l.href} className="inline-flex rounded-full px-3 py-2 text-[15px] font-medium hover:bg-white/10">
                    {l.label}
                  </Link>
                </NavigationMenu.Link>
              </NavigationMenu.Item>
            ))}
          </NavigationMenu.List>
        </NavigationMenu.Root>

        <div className="flex items-center gap-2">
          <a
            href={site.phoneHref}
            aria-label={`Call ${site.phone}`}
            className="inline-flex size-11 items-center justify-center rounded-full bg-cta text-white shadow-glow transition hover:bg-cta-dark lg:hidden"
          >
            <Phone className="size-5" />
          </a>
          <button
            type="button"
            onClick={() => openQuote({ service: serviceFromPath(pathname) })}
            className="inline-flex h-11 items-center rounded-full border border-white/30 px-3.5 text-sm font-bold text-white lg:hidden"
          >
            Book
          </button>
          <a
            href={site.phoneHref}
            className="hidden h-12 items-center gap-2 whitespace-nowrap rounded-full bg-cta px-6 text-sm font-bold uppercase tracking-wide text-white shadow-glow transition hover:bg-cta-dark lg:inline-flex"
          >
            <Phone className="size-4" />
            Call {site.phone}
          </a>
          <button
            type="button"
            onClick={() => openQuote({ service: serviceFromPath(pathname) })}
            className="hidden h-12 items-center rounded-full border-2 border-white/40 px-6 text-sm font-bold uppercase tracking-wide text-white transition hover:border-cta-light hover:text-cta-light lg:inline-flex"
          >
            Book
          </button>

          <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
            <Dialog.Trigger className="inline-flex size-11 items-center justify-center rounded-full border border-white/25 lg:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-navy/70 lg:hidden" />
              <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-[min(100%,22rem)] flex-col bg-white text-ink shadow-lift outline-none lg:hidden">
                <div className="flex items-center justify-between border-b border-line px-4 py-3">
                  <Dialog.Title className="font-semibold text-navy">Menu</Dialog.Title>
                  <Dialog.Close className="rounded-full p-2 text-navy hover:bg-sand" aria-label="Close menu">
                    <X className="size-5" />
                  </Dialog.Close>
                </div>
                <div className="flex-1 overflow-y-auto px-3 py-3">
                  {hours ? (
                    <p className="flex items-start gap-2 rounded-xl bg-sand px-3 py-2.5 text-sm font-medium text-navy">
                      <Clock className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                      {hours}
                    </p>
                  ) : null}
                  <a
                    href={site.mapsUrl}
                    target="_blank"
                    rel="noopener"
                    className="mt-2 flex items-start gap-2 rounded-xl bg-sand px-3 py-2.5 text-sm font-medium text-navy"
                  >
                    <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                    {`${site.street}, ${site.city}, ${site.region} ${site.postalCode}`}
                  </a>
                  <nav className="mt-2 grid">
                    {navLinks.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        className="rounded-xl px-3 py-3 text-base font-semibold text-navy hover:bg-sand"
                      >
                        {l.label}
                      </Link>
                    ))}
                  </nav>
                  {groups.map((group) => (
                    <div key={group.title}>
                      <p className="mt-3 border-t border-line px-3 pt-4 text-xs font-bold uppercase tracking-wider text-ink/50">
                        {group.title}
                      </p>
                      <ul>
                        {group.items.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className="block rounded-lg px-3 py-2.5 text-[15px] font-semibold text-navy hover:bg-sand"
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="border-t border-line p-4">
                  <a
                    href={site.phoneHref}
                    className="flex h-12 items-center justify-center gap-2 rounded-full bg-cta font-bold uppercase tracking-wide text-white shadow-glow"
                  >
                    <Phone className="size-4" />
                    Call {site.phone}
                  </a>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </header>
  );
}
