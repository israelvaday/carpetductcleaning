import { cn } from "@/lib/utils";

// Keyless Google Maps embed — no API key required for the basic embed endpoint.
export function MapEmbed({
  query,
  title,
  className,
  height = "h-72",
  zoom = 11,
  cid,
  loading = "lazy",
}: {
  query: string;
  title: string;
  className?: string;
  height?: string;
  zoom?: number;
  cid?: string;
  loading?: "lazy" | "eager";
}) {
  const src = cid
    ? `https://www.google.com/maps/embed?origin=mfe&pb=!1m3!3m2!1m1!4s${encodeURIComponent(cid)}`
    : `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=${zoom}&output=embed`;
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-line shadow-card", className)}>
      <iframe
        title={title}
        src={src}
        className={cn("w-full border-0", height)}
        loading={loading}
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
