/**
 * The cache tags, which are also the document types.
 *
 * ── Why these are the same list ──────────────────────────────────────────
 *
 * Every read in ./content.ts tags itself with the `_type` it queries, and the
 * publish webhook in app/api/revalidate/route.ts drops `revalidateTag(_type)`
 * on whatever Sanity says changed. That only works because the two vocabularies
 * are identical — a tag named `works` against a type named `work` would fail
 * silently, in the worst possible way: the endpoint returns 200, Sanity records
 * a successful delivery, and the site keeps serving the old content until the
 * revalidate window expires.
 *
 * Nothing enforced that before this file existed. It was two string literals in
 * two directories agreeing by luck.
 *
 * ── What this does and does not catch ────────────────────────────────────
 *
 * `ContentTag` makes a typo in a reader's tag a COMPILE error (see the
 * `satisfies` on each fetch in ./content.ts), and gives the webhook route a
 * list to fall back to when it is told something changed but not what.
 *
 * It cannot check these names against the Sanity schema itself — that lives in
 * ../schemas, is consumed by the Studio rather than by TypeScript, and a
 * `defineType({ name })` is just a string. So adding a document type still
 * means adding it HERE, writing a reader, and adding it to the webhook's filter
 * in Sanity's dashboard. `npm run sanity:check` reports the middle one.
 *
 * This file deliberately imports nothing. The webhook route needs it, and
 * importing ./content.ts to get it would pull `constants/content.ts` — and
 * every react-icons module that file imports — into a route whose entire job is
 * to call `revalidateTag`.
 */
export const CONTENT_TAGS = [
  "work",
  "disciplineProject",
  "heroSlide",
  "testimonial",
  "client",
  "accolade",
  "siteImages",
] as const;

export type ContentTag = (typeof CONTENT_TAGS)[number];
