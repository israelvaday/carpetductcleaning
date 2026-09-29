import type { MetadataRoute } from "next";
import { allIndexRoutes } from "@/lib/content";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

function priorityFor(path: string) {
  if (path === "/") return 1;
  if (path === "/privacy-policy/" || path === "/terms/" || path === "/sms-terms/") return 0.3;
  if (path === "/blog/") return 0.6;
  if (path.startsWith("/blog/")) return 0.5;
  if (path === "/contact/" || path === "/locations/") return 0.8;
  if (path === "/about/") return 0.7;
  const depth = path.split("/").filter(Boolean).length;
  if (depth === 1) return 0.9;
  if (depth === 2) return 0.8;
  return 0.6;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const lastModified = new Date("2026-09-29");
  return allIndexRoutes().map((path) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: priorityFor(path),
  }));
}
