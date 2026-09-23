import { Star, ExternalLink, BadgeCheck } from "lucide-react";
import { Reveal } from "@/components/fx";
import { Section, SectionHead } from "@/components/ui";
import { getReviews } from "@/lib/reviews";
import { site } from "@/lib/site";

function Stars({ n }: { n: number }) {
  return (
    <span className="flex items-center gap-0.5 text-gold" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={i < n ? "size-4 fill-current" : "size-4 text-line"} />
      ))}
    </span>
  );
}

// Real Google reviews, refreshed from the Places API on every deploy.
// Until GOOGLE_PLACES_API_KEY is configured (scripts/fetch-reviews.mjs), this
// renders the rating summary with a link to the Google profile instead.
export function Reviews() {
  const data = getReviews();

  return (
    <Section tone="sand">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHead
          eyebrow="Reviews"
          title="What Orange County says about the work"
          body={
            data
              ? `${data.rating} out of 5 across ${data.totalRatings} Google ratings — pulled live from our Google Business Profile.`
              : `${site.rating} on Google. Read the reviews on our Google Business Profile.`
          }
        />
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-white px-5 py-4 shadow-card">
          <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand">
            <BadgeCheck className="size-6" />
          </span>
          <div>
            <p className="flex items-center gap-2 text-lg font-bold text-navy">
              {data ? data.rating : site.rating}
              <Stars n={5} />
            </p>
            <p className="text-xs text-ink/60">
              {data ? `${data.totalRatings} ratings on Google` : "Google Business Profile"}
            </p>
          </div>
        </div>
      </div>

      {data && data.reviews.length > 0 ? (
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data.reviews.slice(0, 6).map((r, i) => (
            <Reveal key={`${r.author}-${r.publishedAt}`} delay={Math.min(i, 5) * 0.06}>
              <figure className="flex h-full flex-col rounded-2xl border border-line bg-white p-6 shadow-card">
                <div className="flex items-center justify-between gap-3">
                  <Stars n={r.rating} />
                  <span className="text-xs text-ink/50">{r.when}</span>
                </div>
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink/80">
                  &ldquo;{r.text.length > 280 ? `${r.text.slice(0, 277)}…` : r.text}&rdquo;
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-2 border-t border-line pt-4 text-sm font-semibold text-navy">
                  <span className="flex size-8 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                    {r.author.charAt(0).toUpperCase()}
                  </span>
                  {r.author}
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-ink/40">
                    Google review
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      ) : null}

      <div className="mt-8">
        <a
          href={data?.mapsUrl || "https://www.google.com/maps/search/Carpet+And+Duct+Cleaning+191+Pinestone+Irvine+CA+92604"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-semibold text-brand transition hover:text-brand-dark"
        >
          {data ? "Read every review on Google" : "Read our reviews on Google"}
          <ExternalLink className="size-4" />
        </a>
      </div>
    </Section>
  );
}
