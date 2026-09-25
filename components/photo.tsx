import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * One frame for every photo. The ratio matches the file, on mobile and desktop,
 * so object-cover does not chop a 16:9 hero into a tall strip.
 * video = 16:9 heroes. photo = 4:3 cards, cities, and job shots.
 */
const frame = cva("relative w-full overflow-hidden bg-sand", {
  variants: {
    ratio: {
      video: "aspect-video",
      photo: "aspect-4/3",
    },
    rounded: {
      none: "",
      card: "rounded-2xl",
      panel: "rounded-3xl",
    },
  },
  defaultVariants: { ratio: "photo", rounded: "none" },
});

export function PhotoFrame({
  ratio,
  rounded,
  className,
  children,
}: VariantProps<typeof frame> & { className?: string; children: React.ReactNode }) {
  return <div className={cn(frame({ ratio, rounded }), className)}>{children}</div>;
}
