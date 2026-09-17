"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CalendarCheck, ChevronLeft, ChevronRight, ClipboardCheck, Sparkles, Wind } from "lucide-react";
import { asset } from "@/lib/images";
import { cn } from "@/lib/utils";

export type ProcessStep = {
  title: string;
  body: string;
  image: string; // key under /images
  alt: string;
  Icon: typeof CalendarCheck;
};

const DEFAULT_STEPS: ProcessStep[] = [
  {
    title: "Book your slot",
    body: "Call or send the quote form with your address and roughly how much area is involved. We give a price range on the phone and lock the next opening — often same or next day.",
    image: "process-book",
    alt: "Booking a carpet cleaning appointment on a phone",
    Icon: CalendarCheck,
  },
  {
    title: "Walkthrough & quote",
    body: "We walk the job with you, test the fibers or check the ductwork, and hand you an itemized price before anything starts. No surprises after we set up.",
    image: "process-inspect",
    alt: "Technician inspecting carpet and quoting the job on-site",
    Icon: ClipboardCheck,
  },
  {
    title: "Protect & deep clean",
    body: "Corners and doorways get protected, then we clean with truck-mounted hot-water extraction or HEPA duct equipment and EPA Safer Choice solutions.",
    image: "process-clean",
    alt: "Truck-mounted hot-water extraction cleaning a carpet",
    Icon: Sparkles,
  },
  {
    title: "Dry & walk through",
    body: "Air movers speed up drying, then we walk the finished work with you before we pack up. You sign off only when it looks right.",
    image: "process-dry",
    alt: "Clean, fresh carpet drying after professional cleaning",
    Icon: Wind,
  },
];

export function ProcessWizard({ steps = DEFAULT_STEPS }: { steps?: ProcessStep[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-advance every 5s unless the user is interacting.
  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(() => setActive((a) => (a + 1) % steps.length), 5000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, steps.length]);

  const step = steps[active];
  const progress = ((active + 1) / steps.length) * 100;

  return (
    <div
      className="grid items-center gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Step list */}
      <div>
        <ol className="space-y-3">
          {steps.map((s, i) => {
            const isActive = i === active;
            return (
              <li key={s.title}>
                <button
                  type="button"
                  onClick={() => {
                    setActive(i);
                    setPaused(true);
                  }}
                  aria-current={isActive ? "step" : undefined}
                  className={cn(
                    "group flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-all duration-300 sm:p-5",
                    isActive
                      ? "border-brand/40 bg-white shadow-lift"
                      : "border-line/70 bg-white/60 hover:border-brand/30 hover:bg-white",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                      isActive ? "bg-brand text-white" : "bg-brand-50 text-brand-dark group-hover:bg-brand/15",
                    )}
                  >
                    <s.Icon className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-baseline gap-2">
                      <span className={cn("font-mono text-xs font-bold", isActive ? "text-brand" : "text-ink/40")}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className={cn("font-semibold", isActive ? "text-navy" : "text-ink/80")}>{s.title}</span>
                    </span>
                    <span
                      className={cn(
                        "mt-1 block overflow-hidden text-sm leading-relaxed transition-all duration-300",
                        isActive ? "max-h-40 text-ink/70 opacity-100" : "max-h-0 opacity-0",
                      )}
                    >
                      {s.body}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Progress + controls */}
        <div className="mt-6 flex items-center gap-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setActive((a) => (a - 1 + steps.length) % steps.length);
                setPaused(true);
              }}
              aria-label="Previous step"
              className="flex size-10 items-center justify-center rounded-full border border-line bg-white text-navy transition hover:border-brand hover:text-brand"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setActive((a) => (a + 1) % steps.length);
                setPaused(true);
              }}
              aria-label="Next step"
              className="flex size-10 items-center justify-center rounded-full border border-line bg-white text-navy transition hover:border-brand hover:text-brand"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand-dark">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand to-gold transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-bold text-ink/50">
            {active + 1} / {steps.length}
          </span>
        </div>
      </div>

      {/* Image panel */}
      <div className="relative">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-lift">
          {steps.map((s, i) => (
            <div
              key={s.image}
              className={cn(
                "absolute inset-0 transition-opacity duration-700",
                i === active ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              <Image
                src={asset(`/images/${s.image}.webp`)}
                alt={s.alt}
                fill
                sizes="(min-width: 1024px) 40rem, 100vw"
                className={cn("object-cover transition-transform duration-[1400ms]", i === active && "scale-105")}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-transparent" />
            </div>
          ))}
          <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-5">
            <span className="flex size-10 items-center justify-center rounded-xl bg-white/95 text-brand shadow-card">
              <step.Icon className="size-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white/70">Step {active + 1}</p>
              <p className="font-semibold text-white">{step.title}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
