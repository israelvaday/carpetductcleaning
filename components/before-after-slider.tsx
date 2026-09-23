"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { ChevronDown, ChevronsLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type BeforeAfterPair = {
  before: string;
  after: string;
  width: number;
  height: number;
  alt: string;
};

export function BeforeAfterSlider({
  pair,
  priority = false,
}: {
  pair: BeforeAfterPair;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);

  const setFromClientX = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setPos(pct);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    setFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setFromClientX(e.clientX);
  };
  const stop = () => setDragging(false);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setPos((p) => Math.max(0, p - 5));
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setPos((p) => Math.min(100, p + 5));
    }
  };

  return (
    <figure>
      <div
        ref={ref}
        role="slider"
        aria-label={`${pair.alt} — drag to compare before and after`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stop}
        onPointerCancel={stop}
        onKeyDown={onKeyDown}
        className={cn(
          "aspect-4/3",
          "group relative w-full cursor-ew-resize touch-none select-none overflow-hidden rounded-2xl bg-sand shadow-card outline-none focus-visible:ring-2 focus-visible:ring-gold",
          dragging && "cursor-grabbing",
        )}
      >
        <Image
          src={pair.after}
          alt={`${pair.alt} after cleaning`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
          className="pointer-events-none object-cover"
          draggable={false}
        />
        <Image
          src={pair.before}
          alt={`${pair.alt} before cleaning`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
          className="pointer-events-none object-cover"
          draggable={false}
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_12px_rgba(11,34,55,0.45)]"
          style={{ left: `${pos}%` }}
        >
          <div
            className={cn(
              "absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-navy shadow-lg ring-2 ring-gold/80",
              dragging && "scale-110",
            )}
          >
            <ChevronsLeftRight className="size-5" />
          </div>
        </div>
        <span className="pointer-events-none absolute left-3 top-3 z-20 rounded-full bg-navy/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
          Before
        </span>
        <span className="pointer-events-none absolute right-3 top-3 z-20 rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-navy">
          After
        </span>
      </div>
      <figcaption className="mt-2 line-clamp-2 min-h-10 text-sm text-ink/70">{pair.alt}</figcaption>
    </figure>
  );
}

const INITIAL_COUNT = 6;

export function BeforeAfterGallery({ pairs }: { pairs: BeforeAfterPair[] }) {
  const [open, setOpen] = useState(false);
  const visible = open ? pairs : pairs.slice(0, INITIAL_COUNT);
  const hidden = pairs.length - INITIAL_COUNT;

  return (
    <>
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((pair, i) => (
          <BeforeAfterSlider key={pair.after} pair={pair} priority={i < 3} />
        ))}
      </div>
      {hidden > 0 ? (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-12 items-center gap-2 rounded-full border border-navy/25 px-6 text-sm font-bold uppercase tracking-wide text-navy transition hover:border-brand hover:text-brand"
          >
            {open ? "Show fewer photos" : `Show ${hidden} more photos`}
            <ChevronDown className={cn("size-4 transition", open && "rotate-180")} />
          </button>
        </div>
      ) : null}
    </>
  );
}
