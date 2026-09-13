import { defineField } from "sanity";

/**
 * The photograph field every document uses.
 *
 * ── `hotspot: true` is the whole point of this integration ────────────────
 *
 * Almost every image on this site is full-bleed `object-cover` — the hero, the
 * cards on the Works ring, the Services track, the Contact backdrop. When a
 * wide photograph is dropped into a portrait frame, `object-cover` centre-crops
 * it, and the thing that mattered in the shot ends up outside the frame.
 *
 * The code already carries an `objectPosition` prop on `<Media />` for exactly
 * this reason, which today means a developer hand-tunes a crop every time a
 * photograph changes. With the hotspot on, whoever uploads the picture drags a
 * point onto the part that matters and every crop across the site follows it —
 * see `sanity/lib/image.ts`, which turns that point back into `objectPosition`.
 *
 * So this one flag removes an existing maintenance burden rather than adding a
 * feature.
 */
export const photo = defineField({
  name: "photo",
  title: "Photograph",
  type: "image",
  options: { hotspot: true },
  validation: (rule) => rule.required(),
  fields: [
    defineField({
      name: "alt",
      title: "Alt text",
      type: "string",
      description:
        "What the photograph shows, for screen readers and for when it fails to load. Describe the space, not the file — “Reception and breakout area”, not “DSC_0421”.",
    }),
  ],
});

/**
 * A stable, human-readable key.
 *
 * The site's React lists key off this, and a few components look items up by
 * it, so it has to survive a title being reworded. Generated from the title
 * once and then left alone — which is what `slug` is for.
 */
export const slugFrom = (source: string) =>
  defineField({
    name: "slug",
    title: "ID",
    type: "slug",
    description:
      "Generated from the title. Safe to leave alone — changing it will not break anything visible, but there is no reason to.",
    options: { source, maxLength: 64 },
    validation: (rule) => rule.required(),
  });

/**
 * The usual case: generated from a document's `title`.
 *
 * A document with no `title` field takes `slugFrom` directly — see
 * ./testimonial.ts, which generates from the client's name because its only
 * other text is the quote itself.
 */
export const slug = slugFrom("title");

/**
 * Manual ordering.
 *
 * Sanity has no inherent document order, and the sequence of the nine projects
 * is a curatorial decision the studio should own — so it is a field rather than
 * a sort on `_createdAt`, which would silently reorder the ring whenever
 * something was re-uploaded.
 */
export const order = defineField({
  name: "order",
  title: "Order",
  type: "number",
  description: "Lower numbers come first.",
  validation: (rule) => rule.required().integer().min(0),
});

/**
 * An optional second crop, for phones.
 *
 * ── Why a second FILE and not a second hotspot ───────────────────────────
 *
 * The hotspot already solves "this landscape photograph is being centre-cropped
 * and the subject has fallen out of the frame" — see the note on `photo` above.
 * What it cannot solve is a picture whose SUBJECT does not survive a portrait
 * crop at all: a wide lobby shot reduced to a 390px-wide slice is a picture of
 * one column, whatever point you drag onto it. The answer to that is a
 * different photograph, framed for the shape it will be seen in, which is what
 * this field is.
 *
 * It is optional in the strong sense — leave it empty and the main photograph
 * is used at every width, exactly as it is today. So this adds a choice to the
 * Studio without adding an obligation.
 */
export const mobilePhoto = defineField({
  name: "mobilePhoto",
  title: "Photograph — phones",
  type: "image",
  options: { hotspot: true },
  description:
    "Optional. Shown below 768px in place of the photograph above — use it where a wide shot loses its subject in a portrait crop. Leave empty and the main photograph is used at every size.",
  fields: [
    defineField({
      name: "alt",
      title: "Alt text",
      type: "string",
      description: "Optional. Falls back to the main photograph's alt text.",
    }),
  ],
});
