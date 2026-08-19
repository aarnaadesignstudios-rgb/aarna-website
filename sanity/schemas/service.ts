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
    defineField({
      name: "href",
      title: "Opens a page",
      type: "string",
      description:
        'Only set where the discipline has a page of its own — currently just "/photography". Leave blank and the card expands in place instead.',
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
