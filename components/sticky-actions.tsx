"use client";

import { CalendarCheck, Phone } from "lucide-react";
import { useQuote } from "@/components/quote-dialog";
import { serviceFromPath } from "@/lib/quote-services";
import { site } from "@/lib/site";
import { usePathname } from "next/navigation";

export function StickyActions() {
  const { open, openQuote } = useQuote();
  const pathname = usePathname();

  if (open) return null;

  return (
    <>
      <div className="fixed bottom-5 left-1/2 z-40 hidden -translate-x-1/2 lg:block">
        <div className="flex items-center gap-1 rounded-full border border-white/15 bg-navy/92 p-1.5 shadow-lift backdrop-blur-md">
          <a
            href={site.phoneHref}
            className="inline-flex h-11 items-center gap-2.5 rounded-full pr-4 pl-1.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-gold text-navy">
              <Phone className="size-4" />
            </span>
            {site.phone}
          </a>
          <button
            type="button"
            onClick={() => openQuote({ service: serviceFromPath(pathname) })}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-gold px-5 text-sm font-bold uppercase tracking-wide text-navy transition hover:bg-gold-dark"
          >
            Book now
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => openQuote({ service: serviceFromPath(pathname) })}
        aria-label="Book now"
        className="fixed right-4 z-40 inline-flex items-center gap-2 rounded-full bg-gold py-3 pr-4 pl-3 text-sm font-bold text-navy shadow-glow lg:hidden bottom-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <CalendarCheck className="size-5" />
        Book
      </button>
    </>
  );
}
