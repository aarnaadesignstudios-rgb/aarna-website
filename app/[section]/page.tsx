import type { Metadata } from "next";

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
 * ── `dynamicParams = false` is the whole safety story ─────────────────────
 *
 * A one-segment dynamic route is greedy: without this, `/asdf`, `/pricing` and
 * every typo and stale inbound link would render a perfectly good copy of the
 * home page under a URL that means nothing — no 404, and five hundred
 * duplicate pages for a crawler to find. Closing the route to the generated
 * list makes anything not in `SECTION_ROUTE_SEGMENTS` a real 404.
 *
 * Static segments win over dynamic ones in the App Router, so `/about` and
 * `/faq` keep their own pages and never reach this file.
 */

export const dynamicParams = false;

/** The chapters get the home page's revalidation, since it is the same data. */
export const revalidate = 3600;

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

export default function SectionPage() {
  return <HomeDocument />;
}
