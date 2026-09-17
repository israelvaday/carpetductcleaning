import { cn } from "@/lib/utils";

// Keyless Google Maps embed — no API key required for the basic embed endpoint.
export function MapEmbed({
  query,
  title,
  className,
  height = "h-72",
}: {
  query: string;
  title: string;
  className?: string;
  height?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-line shadow-card", className)}>
      <iframe
        title={title}
        src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&z=11&output=embed`}
        className={cn("w-full border-0", height)}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
