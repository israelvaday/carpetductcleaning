"use client";

import { useState } from "react";
import { ContactForm } from "@/components/contact-form";
import { QuoteWizard } from "@/components/quote-wizard";
import { cn } from "@/lib/utils";

const MODES = [
  { id: "guided", label: "Guided quote" },
  { id: "message", label: "Short message" },
] as const;

export function ContactQuote() {
  const [mode, setMode] = useState<(typeof MODES)[number]["id"]>("guided");

  return (
    <div>
      <div className="grid grid-cols-2 gap-1 rounded-full bg-sand p-1" role="tablist" aria-label="How to request a quote">
        {MODES.map((item) => {
          const active = mode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMode(item.id)}
              className={cn(
                "h-10 rounded-full text-sm font-semibold transition",
                active ? "bg-navy text-white shadow-card" : "text-navy/70 hover:text-navy",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {mode === "guided" ? (
        <div className="mt-5">
          <p className="text-sm text-ink/70">
            Pick the service from the photos, then the property and timing. Same request either way.
          </p>
          <div className="mt-4 overflow-hidden rounded-3xl border border-line">
            <QuoteWizard unframed />
          </div>
        </div>
      ) : (
        <>
          <p className="mt-5 text-ink/70">
            Tell us the service, the city, and roughly how big the job is. We will come back with a price range and
            the next open slot.
          </p>
          <ContactForm />
        </>
      )}
    </div>
  );
}
