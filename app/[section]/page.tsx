import type { Metadata } from "next";
import { notFound } from "next/navigation";

import HomeDocument from "@/components/sections/HomeDocument";
import { SITE } from "@/constants";
import { SECTION_ROUTE_SEGMENTS, type SectionId } from "@/lib/sections";

/**
 * /services, /projects, /process, /contact, /practice — the home page's
 * chapters, each at its own address.
 *
 * ── What this is, and what it is not ──────────────────────────────────────
 *
 * It is NOT five more pages. Every one of these renders the identical home
 * document — one continuous scroll, the same two pinned galleries — and
 * <SmoothScrollProvider /> puts the requested chapter on screen as it arrives
 * (`completeSectionArrival`). What the route buys is the URL: a chapter can be
 * linked, shared, bookmarked, put in a sitemap and ranked, none of which a
 * fragment can do. See lib/sections.ts for the full argument.
 *
 * ── The greedy-route problem, and why `dynamicParams` does not solve it ──
 *
 * A one-segment dynamic route is greedy: left alone, `/asdf`, `/pricing` and
 * every typo and stale inbound link would render a perfectly good copy of the
 * home page under a URL that means nothing — no 404, and any number of
 * duplicate pages for a crawler to find.
 *
 * `export const dynamicParams = false` was the guard, and it had to go. It
 * closes the route to the prerendered list, which is correct until one of those
 * pages is REVALIDATED: the entry goes stale, the path is no longer satisfied
 * by a prerender, and `dynamicParams: false` then refuses to generate it —
 * `NoFallbackError`, served as a 404.
 *
 * That is not theoretical and it is not rare. It is what happens the first time
 * anyone hits Publish in the Studio: one `revalidateTag("work")` and all five
 * chapter URLs return 404 until the next deploy. Measured, on a production
 * build — 200 before the webhook, 404 after, while `/` stayed up.
 *
 * So the guard is in the component instead, where it says the same thing
 * (anything not in `SECTION_ROUTE_SEGMENTS` is a real 404) without telling the
 * router that a stale page is an unknown one. The prerendered pages are still
 * prerendered; `generateStaticParams` below is unchanged.
 *
 * Static segments win over dynamic ones in the App Router, so `/about` and
 * `/faq` keep their own pages and never reach this file.
 */

/**
 * The chapters get the home page's revalidation, since it is the same data.
 *
 * A literal, and it has to be: Next requires this to be statically analysable,
 * so it cannot import `REVALIDATE_SECONDS` from sanity/lib/content.ts. Keep
 * them in step — that constant's note explains what the window is for.
 */
export const revalidate = 600;

export function generateStaticParams() {
  return SECTION_ROUTE_SEGMENTS.map((section) => ({ section }));
}

/**
 * Each chapter is titled as itself.
 *
 * Five URLs that all served "Aarnaa Design Studios — <tagline>" would be five
 * identical-looking results in a search listing and five identical tabs. The
 * canonical points at the chapter's own path rather than at `/`: these are the
 * same DOCUMENT but they are not the same destination, and collapsing them onto
 * `/` would throw away the reason for having them.
 */
const TITLES: Record<SectionId, { title: string; description: string }> = {
  hero: { title: SITE.name, description: SITE.description },
  practice: {
    title: "The Practice",
    description: `The studio's approach — how ${SITE.name} thinks about space, material and proportion.`,
  },
  projects: {
    title: "Selected Works",
    description: `Commissions by ${SITE.name} across architecture, commercial interiors and bespoke residential spaces.`,
  },
  process: {
    title: "Process",
    description: `How ${SITE.name} works, from first conversation through to handover.`,
  },
  services: {
    title: "Services",
    description: `Architecture, commercial interiors, boutique interiors, vastu and architectural photography by ${SITE.name}.`,
  },
  contact: {
    title: "Contact",
    description: `Start a conversation with ${SITE.name} — Gurugram, India.`,
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section } = await params;
  const entry = TITLES[section as SectionId];
  if (!entry) return {};
  return {
    title: entry.title,
    description: entry.description,
    alternates: { canonical: `/${section}` },
    openGraph: {
      title: `${entry.title} — ${SITE.name}`,
      description: entry.description,
    },
  };
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  /**
   * The guard that `dynamicParams = false` used to be — see the note above.
   *
   * Every real chapter is prerendered, so this only runs for a segment nobody
   * generated: a typo, a stale inbound link, a crawler guessing. `notFound()`
   * is the same answer the router gave before, reached a different way.
   */
  if (!SECTION_ROUTE_SEGMENTS.includes(section)) notFound();

  return <HomeDocument />;
}
