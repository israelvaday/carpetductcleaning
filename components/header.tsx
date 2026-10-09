"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import { useQuote } from "@/components/quote-dialog";
import { asset } from "@/lib/images";
import { serviceFromPath } from "@/lib/quote-services";
import { serviceBlurb } from "@/lib/services";
import { moneyServices, site } from "@/lib/site";

const navLinks = [
  { href: "/locations/", label: "Locations" },
  { href: "/about/", label: "About" },
  { href: "/blog/", label: "Blog" },
  { href: "/contact/", label: "Contact" },
];

const featured = moneyServices.map((s) => ({
  href: s.href,
  label: s.label,
  slug: s.href.replaceAll("/", ""),
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

export function Header() {
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
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Logo />

        <NavigationMenu.Root
          value={menu}
          onValueChange={setMenu}
          className="relative hidden lg:block"
        >
          <NavigationMenu.List className="flex items-center gap-1">
            <NavigationMenu.Item className="relative">
              <NavigationMenu.Trigger className="group inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium outline-none hover:bg-white/10 data-[state=open]:bg-white/10">
                Services
                <ChevronDown className="size-4 transition group-data-[state=open]:rotate-180" />
              </NavigationMenu.Trigger>
              <NavigationMenu.Content className="fixed left-1/2 top-16 z-50 mt-2 w-[min(52rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-line bg-white p-5 text-ink shadow-lift">
                <p className="px-2 text-xs font-semibold uppercase tracking-wider text-brand">Most booked</p>
                <ul className="mt-2 grid grid-cols-2 gap-1">
                  {featured.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="block rounded-xl px-3 py-2.5 hover:bg-sand"
                        onClick={() => setMenu("")}
                      >
                        <span className="block text-sm font-semibold text-navy">{item.label}</span>
                        <span className="mt-0.5 block text-xs leading-snug text-ink/60">
                          {serviceBlurb(item.slug, item.label)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </NavigationMenu.Content>
            </NavigationMenu.Item>

            {navLinks.map((l) => (
              <NavigationMenu.Item key={l.href}>
                <NavigationMenu.Link asChild>
                  <Link href={l.href} className="inline-flex rounded-full px-3 py-2 text-sm font-medium hover:bg-white/10">
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
            className="inline-flex size-11 items-center justify-center rounded-full text-gold ring-1 ring-gold/70 transition hover:bg-gold hover:text-navy lg:hidden"
          >
            <Phone className="size-4" />
          </a>
          <button
            type="button"
            onClick={() => openQuote({ service: serviceFromPath(pathname) })}
            className="inline-flex h-11 items-center rounded-full bg-gold px-3.5 text-sm font-bold text-navy lg:hidden"
          >
            Book
          </button>
          <a
            href={site.phoneHref}
            className="hidden items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark lg:inline-flex"
          >
            <Phone className="size-4" />
            {site.phone}
          </a>

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
                  <nav className="grid">
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
                  <p className="mt-3 border-t border-line px-3 pt-4 text-xs font-semibold uppercase tracking-wider text-ink/45">
                    Services
                  </p>
                  <ul>
                    {featured.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-navy hover:bg-sand"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-t border-line p-4">
                  <a
                    href={site.phoneHref}
                    className="flex h-12 items-center justify-center gap-2 rounded-full bg-brand font-semibold text-white"
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
