import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Cta } from "@/components/cta";
import { blogTitle, getPost, getPosts } from "@/lib/content";
import { cleanParagraphs } from "@/lib/text";

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const title = blogTitle(post);
  return {
    title,
    description: cleanParagraphs(post.text || "", 1)[0]?.slice(0, 155) || title,
    alternates: { canonical: `/blog/${post.slug}/` },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const title = blogTitle(post);
  const paras = cleanParagraphs(post.text || "", 16);
  return (
    <article className="max-w-3xl">
      <p className="text-sm text-teal">Blog</p>
      <h1 className="mt-1 text-4xl font-semibold">{title}</h1>
      <div className="mt-6 space-y-4 leading-relaxed text-navy/80">
        {paras.map((p) => (
          <p key={p.slice(0, 48)}>{p}</p>
        ))}
      </div>
      <Cta />
    </article>
  );
}
