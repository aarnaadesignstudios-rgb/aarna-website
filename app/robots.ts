import type { MetadataRoute } from "next";

import { SITE } from "@/constants";

/**
 * /robots.txt
 *
 * Points crawlers at the sitemap, and keeps them out of the two routes that are
 * not the site: `/studio` is the Sanity CMS and `/api` is the revalidation
 * webhook. Everything else is open, which is the intent — the chapters have
 * real URLs now precisely so they can be found.
 */
export default function robots(): MetadataRoute.Robots {
  const base = SITE.url.replace(/\/$/, "");
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/studio", "/studio/", "/api/"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
