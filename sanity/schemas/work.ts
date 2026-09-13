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

    /* ── Everything below is the project's own PAGE ────────────────────────
       The fields above are what the ring needs: a name, a category, one
       photograph. These are what /work/<id> needs, and they are deliberately
       all optional. A project with none of them still has a page — it just
       shows the cover photograph and the spec — so the studio can publish a
       commission the moment it has a picture and write it up later, rather
       than being blocked from publishing at all. */

    defineField({
      name: "body",
      title: "About this project",
      type: "array",
      description:
        "The write-up. Headings, paragraphs, quotes and lists — as long as you like.",
      of: [
        {
          type: "block",
          // Only the styles the page actually renders. Offering H1 would put a
          // second page-title-sized heading inside the body, and offering H4-H6
          // would offer three sizes that all come out looking the same.
          styles: [
            { title: "Paragraph", value: "normal" },
            { title: "Heading", value: "h2" },
            { title: "Subheading", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [
            { title: "Bulleted", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                title: "Link",
                type: "object",
                fields: [
                  defineField({
                    name: "href",
                    title: "URL",
                    type: "url",
                    validation: (rule) => rule.required(),
                  }),
                ],
              },
            ],
          },
        },
        // A photograph dropped mid-write-up, so the text can be broken up
        // rather than being one column with every picture below it.
        {
          type: "image",
          title: "Photograph",
          options: { hotspot: true },
          fields: [
            defineField({ name: "alt", title: "Alt text", type: "string" }),
            defineField({ name: "caption", title: "Caption", type: "string" }),
          ],
        },
      ],
    }),

    /**
     * The drawings.
     *
     * A separate field from `gallery` rather than a flag on it, because the
     * page treats the two differently in a way an editor should not have to
     * think about: photographs are cropped to their frame and drawings are
     * never cropped (a plan loses rooms, not edges). Two fields means the
     * studio drops a plan into the box marked Layout and the page does the
     * right thing, instead of uploading it to Photographs and having to
     * remember which toggle stops it being cut in half.
     */
    defineField({
      name: "plans",
      title: "Layout",
      type: "array",
      description:
        "Floor plans, site plans, sections and elevations. Shown two to a row under a “Layout” heading, above the photographs. Add as many as you like — one on its own takes the full width, and drawings are never cropped.",
      of: [
        {
          type: "image",
          // No hotspot: the page contains these rather than cropping them, so
          // there is no crop for a hotspot to steer. Offering the control
          // would invite an editor to set something that changes nothing.
          fields: [
            defineField({
              name: "alt",
              title: "Alt text",
              type: "string",
              description:
                "What the drawing shows, for screen readers — “Ground floor plan, three bedrooms around a central court”.",
            }),
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
              description:
                "Worth filling in here: a set of plans is unreadable without one. “Ground floor”, “First floor”, “Site plan”.",
            }),
            defineField({
              name: "wide",
              title: "Full width",
              type: "boolean",
              description:
                "Give this drawing the whole width instead of a half. Use it for a long section or a site plan that is unreadable at half size.",
              initialValue: false,
            }),
          ],
        },
      ],
      options: { layout: "grid" },
    }),

    defineField({
      name: "gallery",
      title: "Photographs",
      type: "array",
      description:
        "Shown as a gallery under the write-up. Add as many as you like — the layout adapts.",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt text",
              type: "string",
              description: "What the photograph shows, for screen readers.",
            }),
            defineField({ name: "caption", title: "Caption", type: "string" }),
            defineField({
              name: "wide",
              title: "Full width",
              type: "boolean",
              description:
                "Give this photograph the whole width instead of a half. Use it for the ones worth stopping on.",
              initialValue: false,
            }),
          ],
        },
      ],
      options: { layout: "grid" },
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
  preview: {
    select: { title: "title", subtitle: "category", media: "photo" },
  },
});
