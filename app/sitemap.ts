import type { MetadataRoute } from "next";

import { SITE } from "@/constants";
import { SECTION_ROUTE_SEGMENTS } from "@/lib/sections";
import { getWorkSlugs } from "@/sanity/lib/content";

/**
 * /sitemap.xml
 *
 * ── Why this arrived with the chapter routes ──────────────────────────────
 *
 * It is the other half of taking the fragments out of the URLs. `/#services`
 * and `/` are the same URL to a crawler, so before this the studio's entire
 * site was three addresses: `/`, `/about`, `/faq`, plus the commissions. The
 * five chapters had no address to submit and no way to rank for what they are
 * actually about.
 *
 * Now they do, and this is what tells Google they exist rather than waiting for
 * it to find them by following the masthead.
 *
 * `/studio` is deliberately absent: it is the CMS, not a page of the site.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, "");
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    // The home document, which is also the hero's address.
    { url: `${base}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },

    /* The chapters. Lower priority than `/` on purpose — each one is a view of
       the same document, so they should not outrank the document itself, and
       they should not all claim to be equally important either. */
    ...SECTION_ROUTE_SEGMENTS.map((segment) => ({
      url: `${base}/${segment}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),

    // Pages of their own.
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];

  /* The commissions. Read from the CMS so a project published in the Studio
     appears here without anyone editing this file — the same list
     `generateStaticParams` builds the pages from, so the sitemap cannot name a
     project that has no page or miss one that does. */
  try {
    const slugs = await getWorkSlugs();
    for (const slug of slugs) {
      entries.push({
        url: `${base}/work/${slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  } catch {
    // A CMS that is unreachable at build time should cost the site its project
    // URLs, not its sitemap.
  }

  return entries;
}
