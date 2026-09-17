import type { Metadata } from "next";
import Link from "next/link";
import { cityEntries, serviceSlugs } from "@/lib/content";
import { titleCase } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Service areas",
  description: "Carpet and air duct cleaning across Irvine and Orange County. City pages with matching service URLs.",
  alternates: { canonical: "/locations/" },
};

export default function LocationsPage() {
  const all = cityEntries();
  const groups = new Map<string, typeof all>();
  for (const c of all) {
    const list = groups.get(c.service) || [];
    list.push(c);
    groups.set(c.service, list);
  }
  return (
    <article>
      <h1 className="text-4xl font-semibold">Locations</h1>
      <p className="mt-3 max-w-2xl text-navy/70">
        One city, one service, one URL. We do not use vague /cleaner-in-* pages. Cities without unique copy are listed
        on the service hubs until we write them.
      </p>
      {[...groups.entries()].map(([service, cities]) => (
        <section key={service} className="mt-10">
          <h2 className="text-xl font-semibold">
            <Link href={`/${service}/`} className="hover:text-teal">
              {titleCase(service)}
            </Link>
          </h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {cities.map((c) => (
              <li key={c.route}>
                <Link href={`${c.route}/`} className="rounded-lg border border-navy/10 bg-white px-3 py-2 block hover:border-teal">
                  {titleCase(c.city)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="mt-10 text-sm text-navy/60">
        All service hubs:{" "}
        {serviceSlugs().map((s, i) => (
          <span key={s}>
            {i ? " · " : ""}
            <Link href={`/${s}/`} className="underline">
              {titleCase(s)}
            </Link>
          </span>
        ))}
      </p>
    </article>
  );
}
