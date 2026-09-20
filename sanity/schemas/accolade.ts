import { defineField, defineType } from "sanity";

import { order, slug } from "./shared";

/**
 * One award or press mention, on the emerald band above How we work.
 *
 * ── One type, not "awards" and "press" ───────────────────────────────────
 *
 * The band carries both and sets them identically — one line, in the serif —
 * because on the page they are the same claim: somebody outside
 * the practice wrote its name down. Splitting them would give the Studio two
 * lists whose entries are field-for-field identical, two orderings that have
 * to be reconciled into one row, and a decision to make about a feature in a
 * magazine that came with a prize attached.
 *
 * What distinguishes them is the words in the name, which is where it belongs.
 *
 * ── The name, and nothing else ───────────────────────────────────────────
 *
 * There is no issuer field and no year field. An award is known by its name —
 * "Indian Express Awards" — the way a client is known by its logo, and the
 * band sets one line per entry for exactly that reason. The first version of
 * this schema had a `detail` line underneath and it made every entry two
 * lines tall in a 120px strip, which read as a table rather than as a credit.
 *
 * ── The band is DARK, which changes what a logo has to be ───────────────
 *
 * Unlike the client wall above Selected Works, this one sits on brand emerald.
 * A dark-ink lockup disappears on it. The field says so; most entries will
 * have no logo at all and will set as wordmarks in champagne, which is what
 * the band is designed around.
 *
 * ── Keep at least four ───────────────────────────────────────────────────
 *
 * Same marquee constraint as the client band — see sanity/schemas/client.ts.
 *
 * The committed list in constants/content.ts is invented placeholder content
 * and is marked as such. An award the studio has not won is the single most
 * damaging thing on this site to leave unreplaced, so the first document
 * published here replaces all of it at once.
 */
export const accolade = defineType({
  name: "accolade",
  title: "Award or press",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Award",
      type: "string",
      description:
        'The award as it is known — "Indian Express Awards", "Architect of the Year". Just the name: there is no second line for the issuer or the year, on purpose, and a name carrying one ("… — Interiors Today, 2024") will simply be a very wide entry. Set in the serif on the band, and it does not wrap.',
      validation: (rule) => rule.required().max(32),
    }),
    /**
     * Optional, and see the header on why a logo here has a harder job than
     * one on the client band. Same reasoning as ./client.ts for why this is
     * not the shared `photo` field: that one is required and hotspot-cropped,
     * and this is neither.
     */
    defineField({
      name: "logo",
      title: "Mark",
      type: "image",
      description:
        "Optional. The award's seal or the publication's masthead, as a transparent PNG or SVG. This band is dark emerald, so it needs to be LIGHT ink — a dark logo vanishes on it. Fitted into a 120×32 slot. Leave empty and the title above is set as a wordmark instead, which is what most entries here should be.",
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description: "Optional. Falls back to the title above.",
        }),
      ],
    }),
    slug,
    order,
  ],
  orderings: [
    {
      title: "Display order",
      name: "displayOrder",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", media: "logo" },
  },
});
