import type { Metadata } from "next";
import Link from "next/link";
import { blogTitle, getPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog",
  description: "Carpet, duct, and home-care articles from Carpet & Duct Cleaning in Orange County.",
  alternates: { canonical: "/blog/" },
};

export default function BlogIndex() {
  const posts = getPosts();
  return (
    <article>
      <h1 className="text-4xl font-semibold">Blog</h1>
      <ul className="mt-8 space-y-3">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}/`} className="block rounded-lg border border-navy/10 bg-white px-4 py-3 hover:border-teal">
              {blogTitle(p)}
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
