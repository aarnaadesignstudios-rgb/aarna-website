/**
 * sections — the home page's chapters, and the clean URL each one answers to.
 *
 * ── Why the fragments went away ───────────────────────────────────────────
 *
 * The home page is one continuous document with six chapters, and the obvious
 * way to link to a chapter is a fragment: `#services`. It works, and it puts
 * `aarnaadesignstudios.com/#services` in the address bar — which reads as an
 * anchor jump on a single-page template rather than as a page of a studio's
 * site. A fragment is also invisible to a crawler: `/` and `/#services` are the
 * same URL to Google, so five of the studio's six chapters had no address of
 * their own to rank, appear in a sitemap, or be pasted into an email.
 *
 * So every chapter has a real path now. `/services` is a route: it renders, it
 * is prerendered at build time, it can be shared, and it arrives with the
 * section already in place. Nothing about the PAGE changed — it is still one
 * scrolling document, still one set of pinned galleries — only its addresses.
 *
 * ── One table, both directions ────────────────────────────────────────────
 *
 * This is the only place the mapping exists. The navigation layer, the
 * masthead's scroll-spy, the arrival handler and the route generator all read
 * it, so a chapter cannot end up with a link the router does not serve or a
 * route nothing links to.
 *
 * `hero` maps to `/` rather than to `/hero`: the top of the home page is the
 * home page, and a separate address for it would be a second URL for the same
 * screen. That is also why the wordmark points at `/`.
 */

/** Chapter id (the section's DOM id) → the path that serves it. */
export const SECTION_PATHS = {
  hero: "/",
  practice: "/practice",
  projects: "/projects",
  process: "/process",
  services: "/services",
  contact: "/contact",
} as const;

export type SectionId = keyof typeof SECTION_PATHS;

/**
 * The paths `app/[section]/page.tsx` prerenders — every chapter except `hero`,
 * whose path is `/` and is served by `app/page.tsx`.
 *
 * `generateStaticParams` reads this and `dynamicParams = false` closes the
 * route, so `/services` is a page and `/nonsense` is a 404 rather than a
 * silent copy of the home page.
 */
export const SECTION_ROUTE_SEGMENTS = (
  Object.entries(SECTION_PATHS) as [SectionId, string][]
)
  .filter(([, path]) => path !== "/")
  .map(([, path]) => path.slice(1));

/** Reverse lookup: `/services` → `"services"`. Null for anything else. */
export function sectionForPath(path: string): SectionId | null {
  // Tolerate a trailing slash so `/services/` behaves like `/services`.
  const clean = path.length > 1 ? path.replace(/\/+$/, "") : path;
  for (const [id, p] of Object.entries(SECTION_PATHS) as [SectionId, string][]) {
    if (p === clean) return id;
  }
  return null;
}

/** `"services"` → `/services`. Falls back to `/` for anything unknown. */
export function pathForSection(id: string): string {
  return SECTION_PATHS[id as SectionId] ?? "/";
}

/**
 * True when this path is one of the home page's chapters — i.e. a URL whose
 * content lives on the home document rather than on a page of its own.
 *
 * `/` counts. It is the hero's address, and a link to it from another page is
 * a navigation to the home document exactly as `/services` is.
 */
export function isSectionPath(path: string): boolean {
  return sectionForPath(path) !== null;
}
