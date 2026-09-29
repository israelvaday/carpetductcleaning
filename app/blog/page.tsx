import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ImageHero } from "@/components/blocks";
import { Cta } from "@/components/cta";
import { JsonLd } from "@/components/json-ld";
import { Section } from "@/components/ui";
import { blogMeta, blogSeoTitle, blogSlug, getPosts } from "@/lib/content";
import { img, postImage } from "@/lib/images";
import { breadcrumbs } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";
import { cleanParagraphs } from "@/lib/text";

export const metadata: Metadata = pageMeta({
  title: "Carpet, Rug, and Air Duct Cleaning Guides for Homes",
  description:
    "Guides to carpet cleaning, air duct cleaning, rug care, upholstery, and dryer vent cleaning. What each service does and when to book. Call (949) 992-3299.",
  path: "/blog/",
});

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
        eyebrow="Guides"
        title="Carpet, rug, duct, and upholstery guides"
        body="What each cleaning service does, when to schedule it, and how the work protects the fiber, the finish, or the air in the house."
      />

      <Section tone="light">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => {
            const title = blogSeoTitle(p);
            const gen = blogMeta(p);
            const baseImage = postImage(p.slug);
            const image = gen?.heroAlt ? { ...baseImage, alt: gen.heroAlt } : baseImage;
            const rawExcerpt = gen?.description || gen?.excerpt || cleanParagraphs(p.text || "", 1)[0] || "";
            const excerpt = rawExcerpt.length > 155 ? `${rawExcerpt.slice(0, 152).trimEnd()}…` : rawExcerpt;
            return (
              <Link
                key={blogSlug(p)}
                href={`/blog/${blogSlug(p)}/`}
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
                <div className="flex flex-1 flex-col items-center p-5 text-center md:items-start md:text-left">
                  <h2 className="text-lg font-semibold leading-snug text-navy">{title}</h2>
                  {excerpt ? <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/70">{excerpt}</p> : null}
                  <span className="mt-4 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-brand">
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
