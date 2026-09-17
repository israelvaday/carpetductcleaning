"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft, ArrowRight, Building2, Calendar, CalendarClock, Check, Home, Phone, Send, Sparkles, Zap,
} from "lucide-react";
import { asset, serviceImage } from "@/lib/images";
import { site } from "@/lib/site";
import { cn, titleCase } from "@/lib/utils";

const SERVICES = [
  "carpet-cleaning",
  "air-duct-cleaning",
  "upholstery-cleaning",
  "area-rug-cleaning",
  "tile-and-grout-cleaning",
  "hardwood-floor-cleaning",
  "water-damage-restoration",
  "dryer-vent-cleaning",
  "commercial-carpet-cleaning",
] as const;

type PropertyKey = "home" | "business" | "multifamily" | "other";
type Urgency = "asap" | "this-week" | "this-month" | "planning";

const PROPERTIES: { key: PropertyKey; label: string; sub: string; Icon: typeof Home }[] = [
  { key: "home", label: "Home", sub: "House, condo, townhome", Icon: Home },
  { key: "business", label: "Business", sub: "Office, retail, storefront", Icon: Building2 },
  { key: "multifamily", label: "Multi-family", sub: "Apartments, HOA, common areas", Icon: Building2 },
  { key: "other", label: "Other", sub: "RV, vehicle, specialty", Icon: Sparkles },
];

const URGENCIES: { key: Urgency; label: string; sub: string; Icon: typeof Zap }[] = [
  { key: "asap", label: "As soon as possible", sub: "Same-day / next-day if open", Icon: Zap },
  { key: "this-week", label: "Within a week", sub: "A near-term job", Icon: CalendarClock },
  { key: "this-month", label: "Within a month", sub: "Flexible timing", Icon: Calendar },
  { key: "planning", label: "Planning ahead", sub: "Comparing scope and budget", Icon: Calendar },
];

const STEP_LABELS = ["Service", "Property", "Timing", "Details", "Contact"] as const;

export function QuoteWizard() {
  const [step, setStep] = useState(0);
  const [service, setService] = useState<string>("");
  const [property, setProperty] = useState<PropertyKey | "">("");
  const [urgency, setUrgency] = useState<Urgency | "">("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [sent, setSent] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const el = rootRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 110;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, [step]);

  const progress = Math.round(((step + 1) / STEP_LABELS.length) * 100);

  const canAdvance = useMemo(() => {
    switch (step) {
      case 0: return !!service;
      case 1: return !!property;
      case 2: return !!urgency;
      case 3: return true;
      case 4: return !!name.trim() && !!phone.trim() && !!city.trim();
      default: return false;
    }
  }, [step, service, property, urgency, name, phone, city]);

  function next() {
    if (canAdvance && step < STEP_LABELS.length - 1) setStep((s) => s + 1);
  }
  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  function submit() {
    if (!canAdvance) return;
    // No backend on a static host — open the visitor's mail client with the
    // structured request pre-filled, and show the confirmation state.
    const svc = titleCase(service);
    const prop = PROPERTIES.find((p) => p.key === property)?.label || property;
    const urg = URGENCIES.find((u) => u.key === urgency)?.label || urgency;
    const subject = encodeURIComponent(`Quote request — ${svc} in ${city}`);
    const body = encodeURIComponent(
      `Name: ${name}\nPhone: ${phone}\nCity: ${city}\nService: ${svc}\nProperty: ${prop}\nTiming: ${urg}\n\nDetails:\n${message || "—"}`,
    );
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <div
      ref={rootRef}
      className="relative overflow-hidden rounded-3xl border border-line bg-white shadow-lift"
    >
      {/* header */}
      <div className="border-b border-line bg-sand px-5 py-4 md:px-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            <Sparkles className="size-3" /> Free quote
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink/50">
            Step {step + 1} of {STEP_LABELS.length} — {STEP_LABELS[step]}
          </span>
          <span className="ml-auto text-[11px] font-bold text-brand">{progress}%</span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-sand-dark">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand to-gold transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="px-5 py-6 md:px-8 md:py-8">
        {sent ? (
          <div className="py-10 text-center">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand-50 text-brand">
              <Check className="size-8" />
            </span>
            <h3 className="mt-5 text-2xl font-semibold text-navy">Your request is ready</h3>
            <p className="mx-auto mt-2 max-w-md text-ink/70">
              Your email app should have opened with everything filled in. If it didn&apos;t, call us and we&apos;ll
              take the same details over the phone.
            </p>
            <a
              href={site.phoneHref}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark"
            >
              <Phone className="size-4" /> Call {site.phone}
            </a>
          </div>
        ) : (
          <div key={step} className="animate-fade-up">
            {step === 0 && (
              <>
                <h2 className="text-2xl font-semibold text-navy md:text-3xl">What do you need cleaned?</h2>
                <p className="mt-1 text-sm text-ink/60">Tap the service closest to your job.</p>
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {SERVICES.map((slug) => {
                    const image = serviceImage(slug, "card");
                    const active = service === slug;
                    return (
                      <button
                        key={slug}
                        type="button"
                        onClick={() => {
                          setService(slug);
                          setTimeout(next, 180);
                        }}
                        className={cn(
                          "group relative overflow-hidden rounded-2xl border text-left transition focus:outline-none",
                          active ? "border-brand ring-2 ring-brand/40" : "border-line hover:border-brand/50",
                        )}
                      >
                        <div className="relative aspect-[4/3] w-full bg-sand">
                          <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            sizes="(max-width: 640px) 50vw, 33vw"
                            className="object-cover transition group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/20 to-transparent" />
                          {active && (
                            <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-brand text-white">
                              <Check className="size-4" />
                            </span>
                          )}
                          <span className="absolute bottom-0 left-0 right-0 p-2.5 text-xs font-bold text-white sm:text-sm">
                            {titleCase(slug)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <h2 className="text-2xl font-semibold text-navy md:text-3xl">Where is the job?</h2>
                <p className="mt-1 text-sm text-ink/60">Pick the property type.</p>
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {PROPERTIES.map((p) => {
                    const active = property === p.key;
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => {
                          setProperty(p.key);
                          setTimeout(next, 180);
                        }}
                        className={cn(
                          "flex flex-col items-start gap-3 rounded-2xl border p-4 text-left transition focus:outline-none",
                          active ? "border-brand bg-brand-50 ring-2 ring-brand/30" : "border-line hover:border-brand/50",
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-11 items-center justify-center rounded-xl",
                            active ? "bg-brand text-white" : "bg-sand text-brand-dark",
                          )}
                        >
                          <p.Icon className="size-5" />
                        </span>
                        <span>
                          <span className="block font-semibold text-navy">{p.label}</span>
                          <span className="block text-xs text-ink/55">{p.sub}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-2xl font-semibold text-navy md:text-3xl">When do you need it?</h2>
                <p className="mt-1 text-sm text-ink/60">This helps us hold the right slot.</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {URGENCIES.map((u) => {
                    const active = urgency === u.key;
                    return (
                      <button
                        key={u.key}
                        type="button"
                        onClick={() => {
                          setUrgency(u.key);
                          setTimeout(next, 180);
                        }}
                        className={cn(
                          "flex items-start gap-3 rounded-2xl border p-4 text-left transition focus:outline-none",
                          active ? "border-brand bg-brand-50 ring-2 ring-brand/30" : "border-line hover:border-brand/50",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex size-10 items-center justify-center rounded-full",
                            active ? "bg-brand text-white" : "bg-sand text-brand-dark",
                          )}
                        >
                          <u.Icon className="size-5" />
                        </span>
                        <span>
                          <span className="block font-semibold text-navy">{u.label}</span>
                          <span className="block text-xs text-ink/55">{u.sub}</span>
                        </span>
                        {active && <Check className="ml-auto size-5 text-brand" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="text-2xl font-semibold text-navy md:text-3xl">Anything we should know?</h2>
                <p className="mt-1 text-sm text-ink/60">
                  Rooms, square footage, stains, pets, or access notes help us quote accurately.
                </p>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="e.g. 3 bedrooms + stairs, two dogs, a wine stain in the living room."
                  className="mt-5 w-full rounded-2xl border border-line bg-sand px-4 py-3 text-ink outline-none focus:border-brand"
                />
              </>
            )}

            {step === 4 && (
              <>
                <h2 className="text-2xl font-semibold text-navy md:text-3xl">Where do we send the quote?</h2>
                <p className="mt-1 text-sm text-ink/60">We&apos;ll use these to confirm your slot.</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field label="Name" value={name} onChange={setName} required />
                  <Field label="Phone" value={phone} onChange={setPhone} required type="tel" />
                  <Field label="City" value={city} onChange={setCity} required placeholder="Irvine" />
                  <Field label="Email (optional)" value="" onChange={() => {}} type="email" />
                </div>
                <div className="mt-6 rounded-2xl border border-line bg-sand p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-brand">Summary</p>
                  <ul className="mt-2 grid gap-1 text-sm text-ink/80 sm:grid-cols-2">
                    <li><span className="text-ink/50">Service:</span> {service ? titleCase(service) : "—"}</li>
                    <li><span className="text-ink/50">Property:</span> {PROPERTIES.find((p) => p.key === property)?.label || "—"}</li>
                    <li><span className="text-ink/50">Timing:</span> {URGENCIES.find((u) => u.key === urgency)?.label || "—"}</li>
                    <li><span className="text-ink/50">City:</span> {city || "—"}</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        )}

        {!sent && (
          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-6">
            <button
              type="button"
              onClick={back}
              disabled={step === 0}
              aria-label="Previous step"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold text-navy transition hover:border-brand hover:text-brand disabled:opacity-40"
            >
              <ArrowLeft className="size-4" /> Back
            </button>
            {step < STEP_LABELS.length - 1 ? (
              <button
                type="button"
                onClick={next}
                disabled={!canAdvance}
                className="ml-auto inline-flex h-12 items-center gap-2 rounded-full bg-brand px-6 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-40"
              >
                Continue <ArrowRight className="size-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={!canAdvance}
                className="ml-auto inline-flex h-12 items-center gap-2 rounded-full bg-brand px-6 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-40"
              >
                <Send className="size-5" /> Send quote request
              </button>
            )}
            <a
              href={site.phoneHref}
              className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-2 text-xs font-bold uppercase tracking-wider text-ink/60 transition hover:border-brand hover:text-brand"
            >
              <Phone className="size-3.5" /> {site.phone}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", placeholder, required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-navy">
        {label}
        {required && <span className="text-brand"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-xl border border-line bg-sand px-4 text-ink outline-none focus:border-brand"
      />
    </label>
  );
}
