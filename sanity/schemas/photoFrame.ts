import { defineField, defineType } from "sanity";

import { order, photo, slug } from "./shared";

/**
 * One photograph in the /photography portfolio grid.
 *
 * `span` and `aspect` are the grid's composition rather than the picture's
 * content, so they are constrained to the handful of values the layout is built
 * around. A free-text field here would let a typo collapse the grid silently.
 */
export const photoFrame = defineType({
  name: "photoFrame",
  title: "Photography frame",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Reference",
      type: "string",
      description: "Only used to tell frames apart in this list.",
      validation: (rule) => rule.required(),
    }),
    slug,
    photo,
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
      description: "Optional. Shown under the frame.",
    }),
    defineField({
      name: "span",
      title: "Width",
      type: "string",
      initialValue: "md:col-span-6",
      options: {
        list: [
          { title: "Half", value: "md:col-span-6" },
          { title: "Wide", value: "md:col-span-7" },
          { title: "Narrow", value: "md:col-span-5" },
          { title: "Full", value: "md:col-span-12" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "aspect",
      title: "Shape",
      type: "string",
      initialValue: "aspect-4/3",
      options: {
        list: [
          { title: "Landscape", value: "aspect-4/3" },
          { title: "Portrait", value: "aspect-4/5" },
          { title: "Square", value: "aspect-square" },
          { title: "Panorama", value: "aspect-16/9" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
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
  preview: { select: { title: "title", subtitle: "caption", media: "photo" } },
});
