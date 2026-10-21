import Image from "next/image";
import Link from "next/link";
import { Phone, Star } from "lucide-react";
import { asset } from "@/lib/images";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

export function Section({
  children,
  className,
  tone = "light",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "light" | "sand" | "navy";
  id?: string;
}) {
  const tones = {
    light: "bg-white",
    sand: "bg-sand",
    navy: "bg-navy text-white",
  };
  return (
    <section id={id} className={cn("overflow-x-clip py-14 md:py-20", tones[tone], className)}>
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
    <div className={cn("mx-auto max-w-2xl text-center md:mx-0 md:text-left", align === "center" && "md:mx-auto md:text-center")}>
      {eyebrow ? (
        <p className={cn("eyebrow", tone === "navy" && "text-gold")}>{eyebrow}</p>
      ) : null}
      <h2
        className={cn(
          "mt-3 text-3xl font-semibold tracking-tight md:text-4xl lg:text-[2.5rem] lg:leading-[1.12]",
          tone === "navy" ? "text-white" : "text-navy",
        )}
      >
        {title}
      </h2>
      {body ? (
        <p className={cn("mt-4 text-lg leading-relaxed", tone === "navy" ? "text-white/85" : "text-ink/80")}>
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
        "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-cta px-6 text-sm font-bold uppercase tracking-wide text-white shadow-glow transition hover:bg-cta-dark active:scale-[0.98]",
        className,
      )}
    >
      <Phone className="size-4" />
      {label || `Call ${site.phone}`}
    </a>
  );
}

export { QuoteButton } from "@/components/quote-button";

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
          <Star key={i} className={cn("size-3.5", dark ? "fill-gold text-gold" : "fill-cta text-cta")} />
        ))}
      </span>
      {site.rating} Google · {site.jobs} jobs
    </div>
  );
}

export function TrustBadges({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-6 gap-y-3", className)}>
      <Image
        src={asset("/images/google.webp")}
        alt="Google Guaranteed badge"
        width={220}
        height={84}
        className="h-14 w-auto rounded-md bg-white object-contain px-2 py-1 lg:h-20"
      />
      <Image
        src={asset("/images/bbb.webp")}
        alt="BBB Accredited Business A+ rating"
        width={220}
        height={88}
        className="h-14 w-auto rounded-md bg-white object-contain px-2 py-1 lg:h-20"
      />
    </div>
  );
}

export function TrustRow({ dark = false, className }: { dark?: boolean; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-6 gap-y-4", dark ? "text-white/80" : "text-ink/70", className)}>
      <Image
        src={asset("/images/google.webp")}
        alt="Google Guaranteed badge"
        width={160}
        height={62}
        className="h-10 w-auto rounded-md bg-white object-contain px-1.5 py-1 lg:h-12"
      />
      <Image
        src={asset("/images/bbb.webp")}
        alt="BBB Accredited Business A+ rating"
        width={160}
        height={64}
        className="h-10 w-auto rounded-md bg-white object-contain px-1.5 py-1 lg:h-12"
      />
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
      className={cn("text-sm font-medium", dark ? "text-white/80" : "text-ink/70")}
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
    <ul className="mx-auto mt-6 grid w-fit max-w-full gap-3 text-left md:mx-0">
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
