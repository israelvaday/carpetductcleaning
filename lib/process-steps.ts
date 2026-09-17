import type { ProcessStep } from "@/components/process-wizard";
import { img, type Img } from "@/lib/images";

const STEP_COPY: { title: string; body: string; icon: ProcessStep["icon"] }[] = [
  {
    title: "Book your slot",
    body: "Call or send the quote form with your address and roughly how much area is involved. We give a price range on the phone and lock the next opening — often same or next day.",
    icon: "book",
  },
  {
    title: "Walkthrough & quote",
    body: "We walk the job with you, test the fibers or check the ductwork, and hand you an itemized price before anything starts. No surprises after we set up.",
    icon: "inspect",
  },
  {
    title: "Protect & deep clean",
    body: "Corners and doorways get protected, then we clean with truck-mounted hot-water extraction or HEPA duct equipment and EPA Safer Choice solutions.",
    icon: "clean",
  },
  {
    title: "Dry & walk through",
    body: "Air movers speed up drying, then we walk the finished work with you before we pack up. You sign off only when it looks right.",
    icon: "dry",
  },
];

// Service hubs: each service gets its own four step photos so no image ever
// repeats across pages.
export function buildServiceSteps(slug: string, photos: Img[]): ProcessStep[] {
  const name = slug.replaceAll("-", " ");
  return STEP_COPY.map((s, i) => {
    const photo = photos.length ? photos[i % photos.length] : null;
    return {
      ...s,
      image: photo?.src ?? img("hero-home").src,
      alt: photo?.alt || `${name} step ${i + 1}`,
    };
  });
}
