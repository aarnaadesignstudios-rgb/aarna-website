/**
 * disciplines — the three services that have a body of work behind them.
 *
 * ── Three of the six, and why only three ─────────────────────────────────
 *
 * <Services /> offers six disciplines. Three of them are things the studio
 * BUILDS — Architecture, Commercial Interiors, Boutique Interiors — so each
 * has commissions to show, and each now has a page that shows them. The other
 * three do not and cannot: Vastu is a consultancy that already has its own
 * page about the person who leads it, Design Consultation is a bookable hour,
 * and Architectural Photography is another practice's portfolio.
 *
 * So this is not "the services list, again". It is the subset of the services
 * that a project can belong to, which is a different thing with a different
 * shape — see `Work.discipline`.
 *
 * ── The ids are the SERVICES ids, deliberately ───────────────────────────
 *
 * `architecture`, `commercial-interiors` and `boutique-interiors` are exactly
 * the ids the matching entries carry in `constants/content.ts`, and
 * `assertDisciplinesMatchServices()` below fails the build if that stops being
 * true. Two lists describing the same three things is how a card ends up
 * linking to a 404: the card's `link.href` is built from the id here, and the
 * page is prerendered from the same id, so a rename in one place has to be a
 * rename in both.
 *
 * ── It imports nothing, and that is load-bearing ─────────────────────────
 *
 * `constants/content.ts` reads `pathForDiscipline()` to build the three
 * Services cards' links, so this file cannot import the services back — that
 * is a cycle, and in a Next build a cycle between a constants module and a
 * lib module resolves to `undefined` at module scope rather than erroring,
 * which would put `href="/services/undefined"` on three cards. The
 * SERVICES-side check below therefore takes the ids as an argument instead of
 * reaching for them, and the route calls it.
 *
 * ── Why this is code and not a Sanity document type ──────────────────────
 *
 * Same reason the services themselves are code — see the note in
 * sanity/schemas/index.ts. The taxonomy is the site's structure: the URLs are
 * prerendered from it, the Studio's three project folders filter on it, and
 * the Services cards link into it. A fourth discipline published from the CMS
 * would need a route, a card and a folder, none of which appear by themselves.
 *
 * What IS in the CMS is which discipline each project belongs to, and that is
 * the part that actually changes.
 */
export interface Discipline {
  /** URL segment and `Work.discipline` value. Matches the SERVICES id. */
  id: string;
  /** The page's h1, and the Studio folder's name. */
  title: string;
  /**
   * The standfirst under the h1 on the discipline's page.
   *
   * Deliberately NOT the service card's `body`. That copy is written to sit
   * under a name on a small tile and answer "what is this" in one breath;
   * this one is the opening line of a page whose whole subject is already
   * named in 60px type above it, so repeating the card would be reading the
   * heading back to whoever just read it.
   */
  standfirst: string;
  /** The label on the service card's link. A verb and its object, like the
   *  two cards that already carry one ("See the photography"). */
  linkLabel: string;
}

export const DISCIPLINES: Discipline[] = [
  {
    id: "architecture",
    title: "Architecture",
    standfirst:
      "Buildings shaped around their site, their purpose and the way they will actually be used — from first sketch through to the detail drawn on site.",
    linkLabel: "See architecture projects",
  },
  {
    id: "commercial-interiors",
    title: "Commercial Interiors",
    standfirst:
      "Workspaces, restaurants, food courts, hotels and retail — spaces that have to carry a brand, move a crowd and still feel considered up close.",
    linkLabel: "See commercial projects",
  },
  {
    id: "boutique-interiors",
    title: "Boutique Interiors",
    standfirst:
      "Villas, bungalows, residences and resorts, drawn one at a time around the people who live in them and the materials they will live with.",
    linkLabel: "See boutique projects",
  },
];

/** Every discipline id, for `generateStaticParams` and for validation. */
export const DISCIPLINE_IDS = DISCIPLINES.map((d) => d.id);

/** `"architecture"` → the discipline, or null for anything else. */
export function disciplineFor(id: string): Discipline | null {
  return DISCIPLINES.find((d) => d.id === id) ?? null;
}

/** `"architecture"` → `/services/architecture`. */
export function pathForDiscipline(id: string): string {
  return `/services/${id}`;
}

/**
 * The guard that keeps the two lists honest.
 *
 * Called at module scope in the discipline route, so a mismatch is a BUILD
 * error on the page that would have 404'd rather than a broken link somebody
 * finds in production. It is cheap — three lookups over a six-item array,
 * once.
 *
 * It cannot live in `constants/content.ts`: that file is imported by the
 * Studio and by client components, and a throw there would take out far more
 * than the page that has the problem.
 */
export function assertDisciplinesMatchServices(serviceIds: string[]): void {
  const missing = DISCIPLINES.filter((d) => !serviceIds.includes(d.id)).map(
    (d) => d.id
  );

  if (missing.length) {
    throw new Error(
      `lib/disciplines.ts names ${missing.join(", ")}, which ${
        missing.length === 1 ? "is not a service" : "are not services"
      } in constants/content.ts. Every discipline has to be one of the six ` +
        `disciplines on the Services track, because that card is what links ` +
        `to its page.`
    );
  }
}
