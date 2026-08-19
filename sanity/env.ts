/**
 * The one place that decides whether this site is running on Sanity.
 *
 * ── The rule ──────────────────────────────────────────────────────────────
 *
 * Sanity is OPTIONAL. With no project ID configured the site serves the
 * photographs and copy in `constants/content.ts`, exactly as it did before any
 * of this existed. Configure it and the same components take their content from
 * the Content Lake instead.
 *
 * That is not a nicety, it is the design. A CMS integration that hard-fails
 * without credentials means the site cannot be built, run or deployed by anyone
 * who does not yet have them — including a fresh clone, a preview build, and CI.
 * Every read in `sanity/lib/content.ts` therefore falls back to the constants,
 * and every one of them is allowed to.
 *
 * ── Why the ID is public ─────────────────────────────────────────────────
 *
 * `NEXT_PUBLIC_` puts a value in the browser bundle. That is correct here: a
 * free-plan dataset is world-readable, so the project ID is not a secret and
 * pretending otherwise would be security theatre. The one real secret —
 * `SANITY_API_READ_TOKEN` — has no prefix and never leaves the server.
 */

/** From sanity.io → Settings → API. Empty until it is configured. */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || "";

export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";

/**
 * Pinned, not floating. Sanity dates its API, and an un-pinned version means a
 * future release can change what a query returns without anything in this repo
 * changing — the kind of break that arrives on a day nobody deployed.
 */
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION?.trim() || "2024-10-01";

/**
 * Is there a Sanity project to talk to at all?
 *
 * Everything downstream branches on this: the reads fall back to the constants,
 * the Studio route explains itself instead of crashing, and `<Media />` treats
 * every source as a plain path.
 */
export const sanityEnabled = Boolean(projectId);

/** Server-only. Absent on the client by construction — see the note above. */
export const readToken = process.env.SANITY_API_READ_TOKEN?.trim() || "";
