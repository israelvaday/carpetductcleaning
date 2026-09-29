import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ImageHero } from "@/components/blocks";
import { Cta } from "@/components/cta";
import { JsonLd } from "@/components/json-ld";
import { Section, SectionHead } from "@/components/ui";
import { blogDescription, blogMeta, blogSeoTitle, blogSlug, getPost, getPosts } from "@/lib/content";
import { postImage } from "@/lib/images";
import { blogPosting, breadcrumbs } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";
import { cleanParagraphs } from "@/lib/text";
import { siteUrl } from "@/lib/site";

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: blogSlug(p) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const title = blogSeoTitle(post);
  return pageMeta({
    title,
    description: blogDescription(post),
    path: `/blog/${blogSlug(post)}/`,
  });
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const title = blogSeoTitle(post);
  const description = blogDescription(post);
  const gen = blogMeta(post);
  const sections = gen?.sections?.filter((s) => s.heading && s.body) ?? [];
  const paras = sections.length ? [] : cleanParagraphs(post.text || "", 16);
  const baseImage = postImage(post.slug);
  const image = gen?.heroAlt ? { ...baseImage, alt: gen.heroAlt } : baseImage;
  const links = (gen?.links ?? []).filter((l) => l.href.startsWith("/") && l.label);
  const more = getPosts()
    .filter((p) => blogSlug(p) !== slug)
    .slice(0, 3);

  return (
    <>
      <JsonLd
        data={breadcrumbs([
          { name: "Home", href: "/" },
          { name: "Blog", href: "/blog/" },
          { name: title, href: `/blog/${blogSlug(post)}/` },
        ])}
      />
      <JsonLd
        data={blogPosting({
          title,
          description,
          path: `/blog/${blogSlug(post)}/`,
          date: post.date,
          image: image.src.startsWith("http") ? image.src : `${siteUrl()}${image.src}`,
        })}
      />

      <ImageHero
        image={image}
        breadcrumb={[{ name: "Home", href: "/" }, { name: "Blog", href: "/blog/" }, { name: title }]}
        eyebrow="Guide"
        title={title}
      />

      <Section tone="light">
        <div className="prose-body mx-auto max-w-3xl">
          {sections.map((s) => (
            <div key={s.heading}>
              <h2>{s.heading}</h2>
              <p>{s.body}</p>
            </div>
          ))}
          {paras.map((p) => (
            <p key={p.slice(0, 48)}>{p}</p>
          ))}
          {links.length ? (
            <p>
              {links.length > 1 ? "Related services: " : "Related service: "}
              {links.map((l, i) => (
                <span key={l.href}>
                  {i > 0 ? (i === links.length - 1 ? " and " : ", ") : null}
                  <Link href={l.href} className="font-semibold text-brand underline-offset-2 hover:underline">
                    {l.label}
                  </Link>
                </span>
              ))}
              .
            </p>
          ) : null}
        </div>
      </Section>

      <Section tone="sand">
        <SectionHead eyebrow="Keep reading" title="More from the blog" />
        {/* Text cards: each post's photo appears on its own page and the blog
            index only — never burned on a shared "more" rail. */}
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {more.map((p) => {
            const t = blogSeoTitle(p);
            return (
              <Link
                key={blogSlug(p)}
                href={`/blog/${blogSlug(p)}/`}
                className="group flex flex-col items-center justify-between rounded-2xl border border-line bg-white p-5 text-center shadow-card transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lift md:items-start md:text-left"
              >
                <h3 className="font-semibold leading-snug text-navy group-hover:text-brand">{t}</h3>
                <span className="mt-4 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-brand">
                  Read
                  <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </Section>

      <Cta />
    </>
  );
}
