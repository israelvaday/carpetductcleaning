"use client";

import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useQuote } from "@/components/quote-dialog";
import { serviceFromPath } from "@/lib/quote-services";
import { cn } from "@/lib/utils";

export function QuoteButton({
  className,
  dark = false,
  label = "Book",
  service,
}: {
  className?: string;
  dark?: boolean;
  label?: string;
  service?: string;
}) {
  const { openQuote } = useQuote();
  const pathname = usePathname();
  const preset = service !== undefined ? service : serviceFromPath(pathname);

  return (
    <button
      type="button"
      onClick={() => openQuote({ service: preset })}
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-full border px-6 text-sm font-bold uppercase tracking-wide transition active:scale-[0.98]",
        dark
          ? "border-white/30 bg-white/10 text-white backdrop-blur hover:border-gold/60 hover:text-gold"
          : "border-navy/25 bg-white text-navy hover:border-brand hover:text-brand",
        className,
      )}
    >
      {label}
      <ArrowRight className="size-4" />
    </button>
  );
}
