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
    /* ── Was a single "Opens a page" string ────────────────────────────
       That field made a discipline navigate INSTEAD of expanding, which is
       why Architectural Photography behaved unlike every other card in the
       row. Every discipline expands now, and links live inside the panel that
       opens — so a discipline can both describe itself and lead somewhere.

       An array rather than one link: Photography has two destinations (the
       studio's own portfolio page and the photographer's site), and there was
       no reason for the schema to make the second one impossible. */
    defineField({
      name: "links",
      title: "Links",
      type: "array",
      description:
        "Shown inside the panel that opens when someone clicks this discipline. Leave empty and the panel is just the description.",
      of: [
        {
          type: "object",
          name: "serviceLink",
          fields: [
            defineField({
              name: "label",
              title: "Link text",
              type: "string",
              description:
                'What the link says — e.g. "See the photography". Not the address.',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "href",
              title: "Address",
              type: "string",
              description:
                'A page on this site ("/photography") or a full address on another site ("https://…").',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: "label", subtitle: "href" } },
        },
      ],
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
