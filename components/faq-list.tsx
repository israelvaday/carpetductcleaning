import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/fx";
import { Section, SectionHead } from "@/components/ui";

export function FaqList({
  items,
  title = "Common questions",
  eyebrow = "FAQ",
}: {
  items: { q: string; a: string }[];
  title?: string;
  eyebrow?: string;
}) {
  if (!items.length) return null;
  return (
    <Section tone="light">
      <Reveal from="up">
        <SectionHead eyebrow={eyebrow} title={title} />
      </Reveal>
      <Reveal from="up" delay={0.08} className="mt-8 grid gap-3">
        {items.map((f) => (
          <details
            key={f.q}
            className="group rounded-2xl border border-line bg-white px-5 py-4 shadow-card open:shadow-lift"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-navy">
              {f.q}
              <ChevronDown className="size-5 shrink-0 text-brand transition group-open:rotate-180" />
            </summary>
            <p className="mt-3 leading-relaxed text-ink/70">{f.a}</p>
          </details>
        ))}
      </Reveal>
    </Section>
  );
}
