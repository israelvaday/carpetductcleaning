import type { Metadata } from "next";
import { Cta } from "@/components/cta";
import { getUtility } from "@/lib/content";
import { cleanParagraphs } from "@/lib/text";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description: `Carpet & Duct Cleaning has served Irvine and Orange County since ${site.foundingYear}. IICRC certified, Google Guaranteed.`,
  alternates: { canonical: "/about/" },
};

export default function AboutPage() {
  const page = getUtility("about-us");
  const paras = cleanParagraphs(page?.text || "", 8);
  return (
    <article>
      <h1 className="text-4xl font-semibold">About Carpet & Duct Cleaning</h1>
      <p className="mt-3 text-navy/70">
        Founded in {site.foundingYear}. Irvine, California. Phone {site.phone}.
      </p>
      <div className="mt-6 space-y-4 leading-relaxed text-navy/80">
        {paras.map((p) => (
          <p key={p.slice(0, 40)}>{p.replace(/2021/g, String(site.foundingYear))}</p>
        ))}
      </div>
      <Cta title="Work with a local Irvine crew" />
    </article>
  );
}
