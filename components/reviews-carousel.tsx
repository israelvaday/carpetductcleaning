"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { Review } from "@/lib/reviews";

function Stars({ n }: { n: number }) {
  return (
    <span className="flex items-center gap-0.5 text-gold" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={i < n ? "size-4 fill-current" : "size-4 text-line"} />
      ))}
    </span>
  );
}

// Sleek auto-playing review slider: scroll-snap track, edge fade, pauses on
// hover/touch, arrows + dots. Google Places serves the 5 most relevant
// reviews, refreshed on every deploy.
export function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = reviews.length;

  const scrollTo = (i: number) => {
    const track = trackRef.current;
    const card = track?.children[i] as HTMLElement | undefined;
    if (!track || !card) return;
    track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
    setActive(i);
  };

  const step = (dir: 1 | -1) => scrollTo((active + dir + count) % count);

  // Auto-advance.
  useEffect(() => {
    if (paused || count < 2) return;
    const t = setInterval(() => {
      setActive((a) => {
        const next = (a + 1) % count;
        const track = trackRef.current;
        const card = track?.children[next] as HTMLElement | undefined;
        if (track && card) track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
        return next;
      });
    }, 4500);
    return () => clearInterval(t);
  }, [paused, count]);

  // Keep the active dot in sync when the user swipes manually.
  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    let best = 0;
    let bestDist = Infinity;
    Array.from(track.children).forEach((el, i) => {
      const d = Math.abs((el as HTMLElement).offsetLeft - track.offsetLeft - track.scrollLeft);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setActive(best);
  };

  if (!count) return null;

  return (
    <div
      className="relative mt-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth py-2 [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]"
      >
        {reviews.map((r) => (
          <figure
            key={`${r.author}-${r.publishedAt}`}
            className="flex w-[85%] flex-none snap-start flex-col rounded-2xl border border-line bg-white p-6 shadow-card sm:w-[60%] lg:w-[31.8%]"
          >
            <div className="flex items-center justify-between gap-3">
              <Stars n={r.rating} />
              <span className="text-xs text-ink/50">{r.when}</span>
            </div>
            <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink/80">
              &ldquo;{r.text.length > 260 ? `${r.text.slice(0, 257)}…` : r.text}&rdquo;
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-2 border-t border-line pt-4 text-sm font-semibold text-navy">
              <span className="flex size-8 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                {r.author.charAt(0).toUpperCase()}
              </span>
              <span className="truncate">{r.author}</span>
              <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-ink/40">
                Google review
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Previous review"
          className="flex size-10 items-center justify-center rounded-full border border-line bg-white text-navy shadow-sm transition hover:border-brand hover:text-brand"
        >
          <ChevronLeft className="size-5" />
        </button>
        {count <= 10 ? (
          <div className="flex items-center gap-2">
            {reviews.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`Go to review ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === active ? "w-6 bg-brand" : "w-2 bg-line hover:bg-brand/50"
                }`}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-40 overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-brand transition-all duration-500"
                style={{ width: `${((active + 1) / count) * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium text-ink/50">
              {active + 1} / {count}
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next review"
          className="flex size-10 items-center justify-center rounded-full border border-line bg-white text-navy shadow-sm transition hover:border-brand hover:text-brand"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}
