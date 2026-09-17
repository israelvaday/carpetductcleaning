import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Cta } from "@/components/cta";
import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbs, faqLd } from "@/lib/schema";
import { moneyServices, site } from "@/lib/site";
import { getUtility } from "@/lib/content";
import { cleanParagraphs, extractFaqs } from "@/lib/text";

const HOME_FAQS = [
  {
    q: "How much does carpet cleaning cost in Irvine, CA?",
    a: "Carpet cleaning in Irvine typically costs $35 to $65 per room or $150 to $300 for a whole home depending on size and condition. We quote on-site before work begins.",
  },
  {
    q: "How long does carpet cleaning take to dry in Irvine?",
    a: "Most carpets dry within 4 to 8 hours after hot-water extraction. Keep HVAC on Auto and open windows to speed drying.",
  },
  {
    q: "Is professional carpet cleaning safe for kids and pets?",
    a: "We use EPA Safer Choice certified, residue-free solutions. Products are safe for children, pets, and allergy sufferers once dry.",
  },
  {
    q: "Do you offer same-day carpet cleaning in Irvine?",
    a: "Yes. Same-day and next-day openings across Irvine and Orange County. Call (949) 992-3299.",
  },
];

export const metadata: Metadata = {
  title: { absolute: "Carpet Cleaning in Irvine, CA | Air Duct Cleaning" },
  description:
    "Irvine’s Google Guaranteed carpet and air duct cleaning since 2013. IICRC certified. Call (949) 992-3299.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const home = getUtility("home");
  const paras = cleanParagraphs(home?.text || "", 4);
  const faqs = extractFaqs(home?.text || "").length ? extractFaqs(home?.text || "") : HOME_FAQS;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbs([{ name: "Home", href: "/" }]),
          faqLd(faqs) as Record<string, unknown>,
        ].filter(Boolean) as Record<string, unknown>[]}
      />
      <section className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal">
            Irvine · Orange County · Since {site.foundingYear}
          </p>
          <h1 className="mt-2 text-4xl font-semibold leading-tight text-navy md:text-5xl">
            Carpet cleaning in Irvine, CA
          </h1>
          <p className="mt-4 text-lg text-navy/70">
            {paras[0] ||
              "Google Guaranteed carpet and air duct cleaning. Truck-mounted extraction, HEPA duct cleaning, IICRC technicians."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={site.phoneHref} className="rounded-full bg-teal px-5 py-3 font-semibold text-white">
              Call {site.phone}
            </a>
            <Link href="/contact/" className="rounded-full border border-navy/20 px-5 py-3 font-semibold">
              Book a visit
            </Link>
          </div>
          <p className="mt-4 text-sm text-navy/60">
            {site.jobs} jobs · {site.rating} Google · BBB A+ · Google Guaranteed
          </p>
        </div>
        <Image
          src="/images/van.webp"
          alt="Carpet and Duct Cleaning van in Irvine, CA"
          width={900}
          height={600}
          className="rounded-2xl object-cover shadow-lg"
          priority
        />
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold">Services</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {moneyServices.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="rounded-xl border border-navy/10 bg-white p-4 font-medium hover:border-teal"
            >
              {s.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold">Why homeowners call us</h2>
          <ul className="mt-4 space-y-2 text-navy/75">
            <li>IICRC-certified technicians</li>
            <li>Google Guaranteed and BBB A+</li>
            <li>EPA Safer Choice products — safe for kids and pets</li>
            <li>Upfront pricing. No bait-and-switch.</li>
            <li>Same-day service across Orange County</li>
          </ul>
        </div>
        <Image
          src="/images/carpet.webp"
          alt="Clean carpet after professional extraction in Irvine"
          width={800}
          height={520}
          className="rounded-2xl object-cover"
        />
      </section>

      <FaqList items={faqs} />
      <Cta />
    </>
  );
}
