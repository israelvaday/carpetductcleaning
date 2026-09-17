import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cta } from "@/components/cta";
import { FaqList } from "@/components/faq-list";
import { cityEntries, getCityDoc } from "@/lib/content";

export function generateStaticParams() {
  return cityEntries().map((c) => ({ service: c.service, city: c.city }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string; city: string }>;
}): Promise<Metadata> {
  const { service, city } = await params;
  const doc = getCityDoc(service, city);
  if (!doc) return {};
  return {
    title: { absolute: doc.title },
    description: doc.description,
    alternates: { canonical: `/${doc.service}/${doc.city}/` },
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ service: string; city: string }>;
}) {
  const { service, city } = await params;
  const doc = getCityDoc(service, city);
  if (!doc) notFound();
  return (
    <article>
      <p className="text-sm text-teal">
        <Link href={`/${doc.service}/`}>{doc.serviceName}</Link> / {doc.cityName}
      </p>
      <h1 className="mt-2 text-4xl font-semibold">{doc.h1}</h1>
      {doc.rewrite === "required" || doc.rewrite === "new-write" ? (
        <p className="mt-3 rounded-lg bg-white px-3 py-2 text-sm text-navy/60">
          This URL matches the service. Old WordPress copy that targeted a different service was not used as the H1.
        </p>
      ) : null}
      <div className="mt-6 space-y-4 leading-relaxed text-navy/80">
        {doc.paragraphs.map((p) => (
          <p key={p.slice(0, 48)}>{p}</p>
        ))}
      </div>
      <FaqList items={doc.faqs} />
      <Cta title={`${doc.serviceName} in ${doc.cityName}`} />
    </article>
  );
}
