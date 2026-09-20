import type { MetadataRoute } from "next";

import { SITE } from "@/constants";
import { DISCIPLINE_IDS } from "@/lib/disciplines";
import { SECTION_ROUTE_SEGMENTS } from "@/lib/sections";
import { getDisciplineProjectParams, getWorkSlugs } from "@/sanity/lib/content";

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

    /* The three discipline pages. Higher than a project and lower than a
       chapter: each one is a real destination a visitor is sent to from the
       Services track, and each is also the natural landing page for "boutique
       interior designer Gurugram" — which the ring, being one URL for all the
       work, could never rank for. Generated from the same list the routes are
       prerendered from, so the sitemap cannot name a discipline with no page. */
    ...DISCIPLINE_IDS.map((id) => ({
      url: `${base}/services/${id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),

    // Pages of their own.
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    /* The Vastu discipline, and the specialist who leads it. Same priority as
       /about: both are a person, and both are the destination of a link the
       site puts in front of a visitor rather than a page only a crawler
       finds. */
    { url: `${base}/vastu`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];

  /* The commissions, from BOTH collections. Each is read from the CMS with
     the same call its route's `generateStaticParams` uses, so the sitemap
     cannot name a project that has no page or miss one that does.

     Two reads because there are two collections and nothing joins them —
     `work` for the Selected Works ring and `disciplineProject` for the
     catalogue under What we do. See sanity/schemas/index.ts. */
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

  try {
    for (const { discipline, slug } of await getDisciplineProjectParams()) {
      entries.push({
        url: `${base}/services/${discipline}/${slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  } catch {
    // Same trade as above.
  }

  return entries;
}
