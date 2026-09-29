"use client";

import { createContext, useCallback, useContext, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { QuoteWizard } from "@/components/quote-wizard";

type QuoteContextValue = {
  open: boolean;
  openQuote: (options?: { service?: string }) => void;
};

const QuoteContext = createContext<QuoteContextValue | null>(null);

export function useQuote() {
  const value = useContext(QuoteContext);
  if (!value) throw new Error("useQuote must be used inside QuoteProvider");
  return value;
}

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [service, setService] = useState("");
  const [session, setSession] = useState(0);

  const openQuote = useCallback((options?: { service?: string }) => {
    setService(options?.service || "");
    setSession((n) => n + 1);
    setOpen(true);
  }, []);

  return (
    <QuoteContext.Provider value={{ open, openQuote }}>
      {children}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[70] bg-navy/70" />
          <Dialog.Content className="fixed inset-x-0 bottom-0 z-[70] flex max-h-[min(92dvh,920px)] flex-col rounded-t-3xl bg-white shadow-lift outline-none lg:inset-x-auto lg:top-1/2 lg:bottom-auto lg:left-1/2 lg:w-[min(56rem,calc(100vw-3rem))] lg:max-h-[min(88dvh,880px)] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-3xl">
            <div className="flex items-center justify-between px-5 pt-4 pb-1 md:px-8">
              <Dialog.Title className="font-display text-lg font-semibold text-navy">Book a cleaning</Dialog.Title>
              <Dialog.Close className="rounded-full p-2 text-navy hover:bg-sand" aria-label="Close booking">
                <X className="size-5" />
              </Dialog.Close>
            </div>
            <Dialog.Description className="sr-only">
              Choose a service, then tell us the property, timing, and how to reach you.
            </Dialog.Description>
            <div data-quote-scroll className="overflow-y-auto">
              <QuoteWizard key={session} embedded defaultService={service} />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </QuoteContext.Provider>
  );
}
