"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CalendarCheck, ChevronLeft, ChevronRight, ClipboardCheck, Sparkles, Wind } from "lucide-react";
import { img } from "@/lib/images";
import { PhotoFrame } from "@/components/photo";
import { cn } from "@/lib/utils";

const ICONS = {
  book: CalendarCheck,
  inspect: ClipboardCheck,
  clean: Sparkles,
  dry: Wind,
} as const;

const DWELL = 6000;

export type ProcessStep = {
  title: string;
  body: string;
  image: string; // full src path, already basePath-prefixed
  alt: string;
  icon: keyof typeof ICONS; // string, so steps can cross the server/client boundary
};

const DEFAULT_STEPS: ProcessStep[] = [
  {
    title: "Book your slot",
    body: "Call or send the quote form with your address and roughly how much area is involved. We give a price range on the phone and lock the next opening — often same or next day.",
    image: img("process-book").src,
    alt: "Cleaning technician greeting a homeowner at the front door",
    icon: "book",
  },
  {
    title: "Walkthrough & quote",
    body: "We walk the job with you, test the fibers or check the ductwork, and hand you an itemized price before anything starts. No surprises after we set up.",
    image: img("process-inspect").src,
    alt: "Technician checking carpet with a moisture meter before quoting",
    icon: "inspect",
  },
  {
    title: "Protect & deep clean",
    body: "Corners and doorways get protected, then we clean with truck-mounted hot-water extraction or HEPA duct equipment and EPA Safer Choice solutions.",
    image: img("process-clean").src,
    alt: "Hot-water extraction wand leaving a clean stripe on carpet",
    icon: "clean",
  },
  {
    title: "Dry & walk through",
    body: "Air movers speed up drying, then we walk the finished work with you before we pack up. You sign off only when it looks right.",
    image: img("process-dry").src,
    alt: "Air mover drying a freshly cleaned carpet",
    icon: "dry",
  },
];

export function ProcessWizard({ steps = DEFAULT_STEPS }: { steps?: ProcessStep[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dir, setDir] = useState<1 | -1>(1);
  const [progress, setProgress] = useState(0);
  const [run, setRun] = useState(0);
  const [reduce, setReduce] = useState(false);
  const progressRef = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduce(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // One clock drives the photo zoom and every stage's fill, so the motion
  // restarts cleanly on step 1 the same way it does on the later steps.
  useEffect(() => {
    if (paused || reduce) return;
    const origin = performance.now() - progressRef.current * DWELL;
    let raf = 0;
    const loop = (now: number) => {
      const t = (now - origin) / DWELL;
      if (t >= 1) {
        progressRef.current = 0;
        setProgress(0);
        setDir(1);
        setActive((a) => (a + 1) % steps.length);
        return;
      }
      progressRef.current = t;
      setProgress(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [paused, reduce, active, run, steps.length]);

  function go(index: number) {
    const next = (index + steps.length) % steps.length;
    const forwardWrap = active === steps.length - 1 && next === 0;
    const backWrap = active === 0 && next === steps.length - 1;
    setDir(backWrap || (!forwardWrap && next < active) ? -1 : 1);
    progressRef.current = 0;
    setProgress(0);
    setRun((n) => n + 1);
    setActive(next);
  }

  const step = steps[active];
  const ActiveIcon = ICONS[step.icon];
  const played = reduce ? 1 : progress;

  return (
    <div
      className="grid items-center gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <p className="sr-only" aria-live="polite">
        {`Step ${active + 1} of ${steps.length}: ${step.title}`}
      </p>

      <div>
        <ol className="space-y-3">
          {steps.map((s, i) => {
            const isActive = i === active;
            const StepIcon = ICONS[s.icon];
            const fill = i < active ? 100 : isActive ? played * 100 : 0;
            return (
              <li key={s.title}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-current={isActive ? "step" : undefined}
                  className={cn(
                    "group relative flex w-full items-start gap-4 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 sm:p-5",
                    isActive
                      ? "border-brand/40 bg-white shadow-lift"
                      : "border-line/70 bg-white/60 hover:border-brand/30 hover:bg-white",
                  )}
                >
                  <span className="absolute inset-y-0 left-0 w-1 bg-brand/15" aria-hidden>
                    <span className="absolute inset-x-0 top-0 bg-brand" style={{ height: `${fill}%` }} />
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                      isActive ? "scale-105 bg-brand text-white" : "bg-brand-50 text-brand-dark group-hover:bg-brand/15",
                      i < active && !isActive && "bg-brand/15 text-brand-dark",
                    )}
                  >
                    <StepIcon className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-baseline gap-2">
                      <span className={cn("font-mono text-xs font-bold", isActive ? "text-brand" : "text-ink/40")}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className={cn("font-semibold", isActive || i < active ? "text-navy" : "text-ink/80")}>
                        {s.title}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "mt-1 block overflow-hidden text-sm leading-relaxed transition-all duration-500",
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

        <div className="mt-6 flex items-center gap-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => go(active - 1)}
              aria-label="Previous step"
              className="flex size-10 items-center justify-center rounded-full border border-line bg-white text-navy transition hover:border-brand hover:text-brand"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(active + 1)}
              aria-label="Next step"
              className="flex size-10 items-center justify-center rounded-full border border-line bg-white text-navy transition hover:border-brand hover:text-brand"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
          <div className="flex flex-1 gap-1.5" aria-hidden>
            {steps.map((s, i) => {
              const width = i < active ? 100 : i === active ? played * 100 : 0;
              return (
                <div key={s.title} className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand-dark">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand to-gold"
                    style={{ width: `${width}%` }}
                  />
                </div>
              );
            })}
          </div>
          <span className="text-xs font-bold text-ink/50">
            {active + 1} / {steps.length}
          </span>
        </div>
      </div>

      <div className="relative">
        <PhotoFrame ratio="photo" rounded="panel" className="shadow-lift">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className={cn(
                "absolute inset-0 transition-opacity duration-700",
                i === active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0",
                i === active && !reduce && (dir > 0 ? "process-enter-next" : "process-enter-prev"),
              )}
            >
              <Image
                src={s.image}
                alt={s.alt}
                fill
                sizes="(min-width: 1024px) 40rem, 100vw"
                className="object-cover"
                style={{
                  transform: !reduce && i === active ? `scale(${1 + progress * 0.08})` : "scale(1)",
                  transition: i === active ? "none" : "transform 700ms ease",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-transparent" />
            </div>
          ))}
          <div className="absolute inset-x-0 top-0 z-20 h-1 bg-white/25" aria-hidden>
            <div className="h-full bg-gold" style={{ width: `${played * 100}%` }} />
          </div>
          <div key={step.title} className="process-caption absolute bottom-0 left-0 right-0 z-20 flex items-center gap-3 p-5">
            <span className="flex size-10 items-center justify-center rounded-xl bg-white/95 text-brand shadow-card">
              <ActiveIcon className="size-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white/70">Step {active + 1}</p>
              <p className="font-semibold text-white">{step.title}</p>
            </div>
          </div>
        </PhotoFrame>
      </div>
    </div>
  );
}
