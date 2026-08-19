import { defineField, defineType } from "sanity";

import { order, photo, slug } from "./shared";

/**
 * One frame of the hero's cycle (the opening screen).
 *
 * The hero cuts between these every two seconds, entering from a different edge
 * each time, and captions each with its project name. Four is the number the
 * studio chose; the cycle handles any count, but the wipe rotates through four
 * directions, so a multiple of four is what keeps a given project always
 * arriving the same way.
 */
export const heroSlide = defineType({
  name: "heroSlide",
  title: "Hero image",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Project name",
      type: "string",
      description: "Captioned under the hero while this frame is on screen.",
      validation: (rule) => rule.required(),
    }),
    slug,
    photo,
    order,
  ],
  orderings: [
    {
      title: "Display order",
      name: "displayOrder",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: { select: { title: "title", media: "photo" } },
});
