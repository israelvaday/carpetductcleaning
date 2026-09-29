"use client";

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";

function useInView<T extends HTMLElement>(once: boolean, rootMargin = "-60px") {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            if (once) io.disconnect();
          } else if (!once) {
            setShown(false);
          }
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, rootMargin]);
  return { ref, shown };
}

export type RevealFrom = "up" | "down" | "left" | "right";

/**
 * Scroll-triggered reveal. Modern browsers use a CSS view timeline
 * (animation-timeline: view()); everyone else falls back to this observer.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  once = true,
  from = "up",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  once?: boolean;
  from?: RevealFrom;
  as?: "div" | "section" | "li" | "span";
}) {
  const { ref, shown } = useInView<HTMLDivElement>(once);
  const style = {
    "--reveal-delay": `${delay}s`,
    "--reveal-shift": delay,
  } as CSSProperties;
  return (
    <Tag
      ref={ref as never}
      className={`reveal reveal-${from} ${shown ? "is-shown" : ""} ${className ?? ""}`}
      style={style}
    >
      {children}
    </Tag>
  );
}

/** Staggered children reveal — each child ramps in with an increasing delay. */
export function RevealStagger({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode[];
  className?: string;
  stagger?: number;
}) {
  return (
    <>
      {children.map((child, i) => (
        <Reveal key={i} delay={i * stagger} className={className}>
          {child}
        </Reveal>
      ))}
    </>
  );
}
