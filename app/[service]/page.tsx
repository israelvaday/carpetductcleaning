import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cta } from "@/components/cta";
import { FaqList } from "@/components/faq-list";
import { getServiceDoc, serviceSlugs } from "@/lib/content";
import { titleCase } from "@/lib/utils";

export function generateStaticParams() {
  return serviceSlugs().map((service) => ({ service }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>;
}): Promise<Metadata> {
  const { service } = await params;
  const doc = getServiceDoc(service);
  if (!doc) return {};
  return {
    title: { absolute: doc.title },
    description: doc.description,
    alternates: { canonical: `/${doc.slug}/` },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params;
  const doc = getServiceDoc(service);
  if (!doc) notFound();
  return (
    <article>
      <p className="text-sm font-semibold text-teal">
        <Link href="/">Home</Link> / Services
      </p>
      <h1 className="mt-2 text-4xl font-semibold">{doc.h1}</h1>
      <div className="mt-6 space-y-4 leading-relaxed text-navy/80">
        {doc.paragraphs.map((p) => (
          <p key={p.slice(0, 48)}>{p}</p>
        ))}
      </div>
      {doc.cities.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Cities we cover for {doc.name.toLowerCase()}</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {doc.cities.map((c) => (
              <li key={c.route}>
                <Link href={`${c.route}/`} className="block rounded-lg border border-navy/10 bg-white px-3 py-2 hover:border-teal">
                  {titleCase(c.city)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <FaqList items={doc.faqs} />
      <Cta title={`Book ${doc.name.toLowerCase()}`} />
    </article>
  );
}
