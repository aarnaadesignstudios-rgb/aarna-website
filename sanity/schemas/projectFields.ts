import { defineField } from "sanity";

import { order, photo } from "./shared";

/**
 * Everything a project document holds, apart from its identity.
 *
 * ── Why this is a factory and not a second copy ──────────────────────────
 *
 * There are two project types in this schema and they are deliberately
 * separate CONTENT — `work` for the Selected Works ring, `disciplineProject`
 * for the catalogue under What we do. See the note in ./index.ts for why the
 * studio wanted them apart.
 *
 * What they are not is separate FIELDS. A commission is a name, a category, a
 * cover photograph, a spec, a write-up, a set of drawings and a gallery,
 * whichever collection it was published into, and both render through the
 * same component (components/sections/ProjectDetail.tsx). Two hand-maintained
 * copies of the sixteen definitions below would drift on the first edit, and
 * the symptom would be an editor finding a field on one kind of project and
 * not the other with no reason they could see.
 *
 * So the SEPARATION is in the document types, the Studio sections and the
 * URLs — where the studio asked for it — and not in the form they type into.
 *
 * ── `photo` and `order` come from ./shared.ts ────────────────────────────
 *
 * Those two are shared with the hero slides and the credit bands as well, so
 * they stay where every type can reach them. This file is the project-shaped
 * middle layer between that and a document type.
 */
export function projectFields() {
  return [
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
  ];
}
