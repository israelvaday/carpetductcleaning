"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Accordion from "@radix-ui/react-accordion";
import * as Dialog from "@radix-ui/react-dialog";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import { asset } from "@/lib/images";
import { SERVICE_GROUPS, serviceBlurb } from "@/lib/services";
import { moneyServices, site } from "@/lib/site";
import { titleCase } from "@/lib/utils";

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
    <Link href="/" className="flex shrink-0 items-center" aria-label={`${site.name} home`}>
      <Image
        src={asset("/images/logo.webp")}
        alt=""
        width={220}
        height={47}
        className="h-9 w-auto"
        priority
      />
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
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
                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-line pt-4 sm:grid-cols-3">
                  {SERVICE_GROUPS.map((group) => {
                    const slugs = group.slugs.filter((slug) => !featured.some((f) => f.slug === slug));
                    if (!slugs.length) return null;
                    return (
                    <div key={group.title}>
                      <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-ink/45">{group.title}</p>
                      <ul className="mt-1">
                        {slugs.map((slug) => (
                          <li key={slug}>
                            <Link
                              href={`/${slug}/`}
                              className="block rounded-lg px-2 py-1.5 text-sm text-ink/80 hover:bg-sand hover:text-navy"
                              onClick={() => setMenu("")}
                            >
                              {titleCase(slug)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    );
                  })}
                </div>
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
            className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            <Phone className="size-4" />
            <span className="hidden sm:inline">{site.phone}</span>
            <span className="sm:hidden">Call</span>
          </a>

          <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
            <Dialog.Trigger className="inline-flex items-center rounded-full border border-white/25 p-2.5 lg:hidden" aria-label="Open menu">
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
                  <Accordion.Root type="single" collapsible className="mt-2 border-t border-line">
                    {SERVICE_GROUPS.map((group) => (
                      <Accordion.Item key={group.title} value={group.title} className="border-b border-line">
                        <Accordion.Header>
                          <Accordion.Trigger className="group flex w-full items-center justify-between px-3 py-3 text-left text-sm font-semibold text-navy">
                            {group.title}
                            <ChevronDown className="size-4 text-ink/50 transition group-data-[state=open]:rotate-180" />
                          </Accordion.Trigger>
                        </Accordion.Header>
                        <Accordion.Content className="overflow-hidden pb-2">
                          <ul>
                            {group.slugs.map((slug) => (
                              <li key={slug}>
                                <Link
                                  href={`/${slug}/`}
                                  className="block rounded-lg px-3 py-2.5 text-sm text-ink/80 hover:bg-sand"
                                >
                                  {titleCase(slug)}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </Accordion.Content>
                      </Accordion.Item>
                    ))}
                  </Accordion.Root>
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
