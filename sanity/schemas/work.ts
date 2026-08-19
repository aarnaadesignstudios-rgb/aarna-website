import { defineField, defineType } from "sanity";

import { order, photo, slug } from "./shared";

/**
 * A commission on the Selected Works ring (chapter 02).
 *
 * Location, area and year are optional on purpose: the site only renders that
 * meta row when there is something to put in it, because an empty hairline
 * strip under every project title is worse than no strip at all. Leaving them
 * blank here is a supported state, not an unfinished one.
 */
export const work = defineType({
  name: "work",
  title: "Project",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Project name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    slug,
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      description: "Shown above the project name — e.g. Commercial Interiors.",
      validation: (rule) => rule.required(),
    }),
    photo,
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description:
        "Optional. Shown under the project name in the stacked layout on phones.",
    }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({ name: "area", title: "Area", type: "string" }),
    defineField({ name: "year", title: "Year", type: "string" }),
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
    select: { title: "title", subtitle: "category", media: "photo" },
  },
});
