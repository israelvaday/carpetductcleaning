import Link from "next/link";
import { CallButton, Section } from "@/components/ui";
import { moneyServices } from "@/lib/site";
import { titleCase } from "@/lib/utils";

export default function NotFound() {
  return (
    <Section tone="sand">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-4xl font-semibold text-navy">That page is not on the new site</h1>
      <p className="mt-4 max-w-xl text-lg text-ink/70">
        We rebuilt the site so every service and city has one clear URL. Try one of these, or call and we will point
        you to the right page.
      </p>
      <ul className="mt-8 flex flex-wrap gap-2">
        {moneyServices.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="inline-block rounded-full border border-line bg-white px-4 py-2 font-medium text-navy hover:border-brand hover:text-brand"
            >
              {titleCase(s.href.replaceAll("/", ""))}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap gap-3">
        <CallButton />
        <Link
          href="/"
          className="inline-flex items-center rounded-full border border-navy/20 px-6 py-3 font-semibold text-navy hover:border-navy/50"
        >
          Back home
        </Link>
      </div>
    </Section>
  );
}
