import { defineField, defineType } from "sanity";

import { order, photo, slug } from "./shared";

/** One discipline on the Services track (chapter 05). */
export const service = defineType({
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Discipline",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    slug,
    defineField({
      name: "index",
      title: "Index",
      type: "string",
      description: 'Two digits, e.g. "01". Shown on the card.',
      validation: (rule) => rule.required(),
    }),
    photo,
    defineField({
      name: "body",
      title: "Description",
      type: "text",
      rows: 4,
      description: "Revealed when the discipline's name is clicked.",
      validation: (rule) => rule.required(),
    }),
    /**
     * A fixed fee, for the one kind of discipline that has one.
     *
     * Free text rather than a number with a currency formatter, because the
     * card prints it verbatim and the studio writes the whole line — the unit
     * ("per session", "per drawing", "per visit") is as much a decision as the
     * figure, and a formatter would have to guess it.
     *
     * Left blank on everything the studio prices per project, which is most of
     * it. Nothing on the card reserves space for it, so a blank one costs the
     * layout nothing.
     */
    defineField({
      name: "price",
      title: "Fee",
      type: "string",
      description:
        'Only where the discipline is sold at a fixed price — today that is the Design Consultation. Write the whole line, e.g. "₹6,999 per session". Leave blank and no fee is shown.',
    }),
    defineField({
      name: "href",
      title: "Opens a page",
      type: "string",
      description:
        'Only set where the discipline has somewhere of its own to send people — Architectural Photography links out to the Postcard of Life portfolio, and the Design Consultation opens a WhatsApp chat with the booking message already written. A full address (https://…) opens in a new tab; a path on this site (/about) does not. Leave blank and the card expands in place instead.',
    }),
    /**
     * The link's WORDING, because the link is a line of copy at the foot of the
     * body rather than a button. "See the photography" is a sentence about that
     * discipline; a generic "Read more" underneath one card in five is the kind
     * of filler the rest of this site does not have.
     *
     * Ignored when there is no `href`.
     */
    defineField({
      name: "linkLabel",
      title: "Link text",
      type: "string",
      initialValue: "See more",
      description:
        'What the link above reads as — "See the photography", "Book your consultation". Only used when a destination is set.',
      hidden: ({ parent }) => !parent?.href,
    }),
    order,
  ],
  orderings: [
    {
      title: "Display order",
      name: "displayOrder",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: { select: { title: "title", subtitle: "index", media: "photo" } },
});
