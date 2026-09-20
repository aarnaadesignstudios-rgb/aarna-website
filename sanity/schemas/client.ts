import { defineField, defineType } from "sanity";

import { order, slug } from "./shared";

/**
 * One name on the client band, above Selected Works.
 *
 * ── Why the logo is OPTIONAL when the band is a logo wall ────────────────
 *
 * Because half of them will not have one on the day the site goes live, and a
 * band that requires a lockup is a band that stays empty until the last client
 * sends a file. <CreditBand /> sets any entry with no logo as a typographic
 * wordmark in the site's own serif, which is a real supported state rather
 * than a fallback: a mixed row of marks and wordmarks reads as a credit list,
 * where a row with a hole in it reads as broken.
 *
 * So the studio can publish the whole wall as names this afternoon and drop
 * logos in one at a time as they arrive, and the band is correct at every
 * point in between.
 *
 * ── Keep at least four ───────────────────────────────────────────────────
 *
 * The band is a marquee: it renders the sequence twice and translates by half
 * the track, so half a track has to be wider than the viewport or the row runs
 * out of names mid-lap. The component repeats short lists up to twelve entries
 * to guarantee it — which works, but a visitor watching two names cycle six
 * times each can see it working.
 *
 * ── This is a claim about who has hired the practice ─────────────────────
 *
 * It is the one content type here that is not a photograph or an opinion, and
 * an entry published in error is a statement about someone else's business.
 * The committed list in constants/content.ts is invented placeholder content
 * and is marked as such; the first document published here replaces all of it.
 */
export const client = defineType({
  name: "client",
  title: "Client",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Name",
      type: "string",
      description:
        "The client as they would like to be credited. Printed as the wordmark when there is no logo below, so keep it short — two or three words. It does not wrap: a long name is simply a wide entry on the band.",
      validation: (rule) => rule.required().max(40),
    }),
    /**
     * Not the shared `photo` field, which is required and carries a hotspot.
     *
     * Neither applies. A lockup is optional here (see the header), and the
     * hotspot steers an `object-cover` crop — this is rendered `object-contain`
     * inside a fixed slot, so nothing is being cropped and there is no crop to
     * steer. Offering the control anyway would invite someone to drag it and
     * wonder why nothing moved.
     */
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      description:
        "Optional. A transparent PNG or an SVG, dark ink on nothing — the band is white, so a logo with a white box behind it shows as a rectangle. It is fitted into a 120×32 slot, so the whole mark is always visible whatever its proportions. Leave empty and the name above is set as a wordmark instead.",
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description: "Optional. Falls back to the name above.",
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
