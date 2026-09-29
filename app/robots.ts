import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // The github.io preview must not be crawled. The production domain build indexes normally.
  if (process.env.GITHUB_PAGES === "true") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
