import { defineField, defineType } from "sanity";

import { order, slugFrom } from "./shared";

/**
 * One client quote on the testimonial wall (chapter 03).
 *
 * ── The one document type here with no photograph ────────────────────────
 *
 * Everything else in this schema exists because the imagery changes. This does
 * not: the cards in <InfiniteMovingCards /> are type on white — a quote glyph,
 * the words, a hairline, the attribution, and the studio's phoenix as the
 * signature. There is no portrait slot, and adding one would change what the
 * section is.
 *
 * It is here anyway because client words are the content on the page most
 * likely to arrive AFTER a launch, one at a time, from whoever has just
 * finished a handover. That is precisely the thing a studio should not need a
 * developer for.
 *
 * ── Keep at least three ──────────────────────────────────────────────────
 *
 * The row is a marquee: it renders the sequence twice and translates by half
 * the track, so half a track has to be wider than the viewport or the row runs
 * out of cards mid-lap. The component repeats short lists up to eight cards to
 * guarantee it — which works, but a visitor watching two quotes cycle four
 * times each can see it working. Three or more is where it stops reading as a
 * repeat.
 */
export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({
      name: "quote",
      title: "Quote",
      type: "text",
      rows: 3,
      description:
        "In the client's own words, without the surrounding quotation marks — the card draws its own. One or two sentences: the cards are a fixed width and share a row, so a long quote sets the height of every card beside it.",
      validation: (rule) => rule.required().max(280),
    }),
    defineField({
      name: "author",
      title: "Client",
      type: "string",
      description: "The name as they would like it printed.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "role",
      title: "Project",
      type: "string",
      description:
        'The commission and where it is — "Coastal House, Alibaug". Printed under the name, in the label face.',
    }),
    /**
     * The shared `slug` generates from `title`, which this document does not
     * have. The quote is the only other text and would make an unusable key, so
     * the source is the client's name.
     */
    slugFrom("author"),
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
    select: { title: "author", subtitle: "quote" },
  },
});
