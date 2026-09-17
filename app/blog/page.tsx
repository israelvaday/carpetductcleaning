import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ImageHero } from "@/components/blocks";
import { Cta } from "@/components/cta";
import { JsonLd } from "@/components/json-ld";
import { Section } from "@/components/ui";
import { blogMeta, blogTitle, getPosts } from "@/lib/content";
import { img, postImage } from "@/lib/images";
import { breadcrumbs } from "@/lib/schema";
import { cleanParagraphs } from "@/lib/text";

export const metadata: Metadata = {
  title: { absolute: "Cleaning Tips and Guides | Carpet & Duct Cleaning" },
  description:
    "Carpet, rug, upholstery, and air duct advice from the Orange County crew that has cleaned homes here since 2013. Questions? Call (949) 992-3299.",
  alternates: { canonical: "/blog/" },
};

export default function BlogIndex() {
  const posts = getPosts();
  return (
    <>
      <JsonLd
        data={breadcrumbs([
          { name: "Home", href: "/" },
          { name: "Blog", href: "/blog/" },
        ])}
      />

      <ImageHero
        image={img("carpet-protect")}
        breadcrumb={[{ name: "Home", href: "/" }, { name: "Blog" }]}
        eyebrow="Guides and tips"
        title="Cleaning advice for Orange County homes"
        body="What we have learned from a decade of carpets, rugs, ducts, and upholstery in this climate."
      />

      <Section tone="light">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => {
            const title = blogTitle(p);
            const gen = blogMeta(p);
            const image = postImage(p.slug);
            const excerpt = gen?.excerpt || cleanParagraphs(p.text || "", 1)[0]?.slice(0, 140);
            return (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}/`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="relative aspect-16/10 overflow-hidden">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    priority={i < 3}
                    sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-lg font-semibold leading-snug text-navy">{title}</h2>
                  {excerpt ? <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/70">{excerpt}…</p> : null}
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                    Read article
                    <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </Section>

      <Cta />
    </>
  );
}
