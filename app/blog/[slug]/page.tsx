import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ImageHero } from "@/components/blocks";
import { Cta } from "@/components/cta";
import { JsonLd } from "@/components/json-ld";
import { Section, SectionHead } from "@/components/ui";
import { blogTitle, getPost, getPosts } from "@/lib/content";
import { postImage } from "@/lib/images";
import { breadcrumbs } from "@/lib/schema";
import { cleanParagraphs, composeMeta } from "@/lib/text";
import { metaTitle } from "@/lib/utils";

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const title = blogTitle(post);
  return {
    title: { absolute: metaTitle(title) },
    description: composeMeta([cleanParagraphs(post.text || "", 1)[0] || title], [
      "Carpet & Duct Cleaning serves Irvine and Orange County. Call (949) 992-3299.",
      "Serving Irvine and Orange County. Call (949) 992-3299.",
      "Call (949) 992-3299.",
    ]),
    alternates: { canonical: `/blog/${post.slug}/` },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const title = blogTitle(post);
  const paras = cleanParagraphs(post.text || "", 16);
  const more = getPosts()
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  return (
    <>
      <JsonLd
        data={breadcrumbs([
          { name: "Home", href: "/" },
          { name: "Blog", href: "/blog/" },
          { name: title, href: `/blog/${slug}/` },
        ])}
      />

      <ImageHero
        image={postImage(slug, title)}
        breadcrumb={[{ name: "Home", href: "/" }, { name: "Blog", href: "/blog/" }, { name: title }]}
        eyebrow="Guide"
        title={title}
      />

      <Section tone="light">
        <div className="prose-body mx-auto max-w-3xl">
          {paras.map((p) => (
            <p key={p.slice(0, 48)}>{p}</p>
          ))}
        </div>
      </Section>

      <Section tone="sand">
        <SectionHead eyebrow="Keep reading" title="More from the blog" />
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {more.map((p) => {
            const t = blogTitle(p);
            const image = postImage(p.slug, t);
            return (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}/`}
                className="group overflow-hidden rounded-2xl border border-line bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="relative aspect-16/10">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 640px) 20rem, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold leading-snug text-navy">{t}</h3>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                    Read
                    <ArrowRight className="size-4" />
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
