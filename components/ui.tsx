import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Phone, Star } from "lucide-react";
import { asset } from "@/lib/images";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

export function Section({
  children,
  className,
  tone = "light",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "light" | "sand" | "navy";
}) {
  const tones = {
    light: "bg-white",
    sand: "bg-sand",
    navy: "bg-navy text-white",
  };
  return (
    <section className={cn("py-16 md:py-24", tones[tone], className)}>
      <div className="container-page">{children}</div>
    </section>
  );
}

export function SectionHead({
  eyebrow,
  title,
  body,
  tone = "light",
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  tone?: "light" | "navy";
  align?: "left" | "center";
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow ? (
        <p className={cn("eyebrow", tone === "navy" && "text-gold")}>{eyebrow}</p>
      ) : null}
      <h2
        className={cn(
          "mt-3 text-3xl font-bold tracking-tight md:text-4xl lg:text-[2.6rem] lg:leading-[1.1]",
          tone === "navy" ? "text-white" : "text-navy",
        )}
      >
        {title}
      </h2>
      {body ? (
        <p className={cn("mt-4 text-lg leading-relaxed", tone === "navy" ? "text-white/75" : "text-ink/70")}>
          {body}
        </p>
      ) : null}
    </div>
  );
}

export function CallButton({ className, label }: { className?: string; label?: string }) {
  return (
    <a
      href={site.phoneHref}
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gold px-6 text-sm font-bold uppercase tracking-wide text-navy shadow-glow transition hover:bg-gold-dark active:scale-[0.98]",
        className,
      )}
    >
      <Phone className="size-4" />
      {label || `Call ${site.phone}`}
    </a>
  );
}

export function QuoteButton({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <Link
      href="/contact/"
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-full border px-6 text-sm font-bold uppercase tracking-wide transition active:scale-[0.98]",
        dark
          ? "border-white/30 bg-white/10 text-white backdrop-blur hover:border-gold/60 hover:text-gold"
          : "border-navy/25 text-navy hover:border-brand hover:text-brand",
        className,
      )}
    >
      Get a free quote
      <ArrowRight className="size-4" />
    </Link>
  );
}

export function RatingPill({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold",
        dark ? "bg-white/10 text-white ring-1 ring-white/15" : "bg-brand-50 text-brand-dark",
      )}
    >
      <span className="flex" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className="size-3.5 fill-gold text-gold" />
        ))}
      </span>
      {site.rating} Google · {site.jobs} jobs
    </div>
  );
}

export function TrustRow({ dark = false }: { dark?: boolean }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-6 gap-y-4", dark ? "text-white/70" : "text-ink/60")}>
      <Image
        src={asset("/images/google.webp")}
        alt="Google Guaranteed badge"
        width={140}
        height={54}
        className="h-9 w-auto object-contain"
      />
      <Image
        src={asset("/images/bbb.webp")}
        alt="BBB Accredited Business A+ rating"
        width={140}
        height={56}
        className="h-9 w-auto object-contain"
      />
      <span className="text-sm font-semibold">IICRC certified</span>
      <span className="text-sm font-semibold">EPA Safer Choice</span>
      <span className="text-sm font-semibold">Since {site.foundingYear}</span>
    </div>
  );
}

export function Breadcrumb({
  items,
  tone = "light",
}: {
  items: { name: string; href?: string }[];
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("text-sm font-medium", dark ? "text-white/70" : "text-ink/55")}
    >
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, i) => (
          <li key={item.name} className="flex items-center gap-2">
            {i > 0 ? <span aria-hidden>/</span> : null}
            {item.href ? (
              <Link href={item.href} className={dark ? "hover:text-white" : "hover:text-brand"}>
                {item.name}
              </Link>
            ) : (
              <span className={dark ? "text-white" : "text-ink/80"}>{item.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function CheckList({ items, dark = false }: { items: string[]; dark?: boolean }) {
  return (
    <ul className="mt-6 grid gap-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span
            className={cn(
              "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold",
              dark ? "bg-brand text-white" : "bg-brand-50 text-brand-dark",
            )}
            aria-hidden
          >
            ✓
          </span>
          <span className={cn("leading-relaxed", dark ? "text-white/80" : "text-ink/75")}>{item}</span>
        </li>
      ))}
    </ul>
  );
}
