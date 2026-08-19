import { defineField, defineType } from "sanity";

/**
 * The two photographs that are not part of a list.
 *
 * The founder's portrait and the backdrop behind the enquiry are one-of-a-kind
 * — there is exactly one of each, forever. Modelling them as documents the
 * studio can create more of would produce a list with one item in it and an
 * inviting "+" that does nothing useful, so they live together in a singleton
 * instead. The Studio's structure pins it open as a single editable page rather
 * than a collection; see `sanity.config.ts`.
 */
export const siteImages = defineType({
  name: "siteImages",
  title: "Site photographs",
  type: "document",
  fields: [
    defineField({
      name: "founderPortrait",
      title: "Founder portrait",
      type: "image",
      options: { hotspot: true },
      description:
        "Chapter 05. Shown in a tall 4:5 frame, so set the hotspot on her face — a wide crop will otherwise centre on the middle of the picture.",
      fields: [
        defineField({ name: "alt", title: "Alt text", type: "string" }),
      ],
    }),
    defineField({
      name: "contactBackdrop",
      title: "Contact backdrop",
      type: "image",
      options: { hotspot: true },
      description:
        "The room behind the enquiry form, under a flat emerald veil. Choose something warm and dense — the veil sits at 94%, so a pale photograph disappears into it entirely.",
      fields: [
        defineField({ name: "alt", title: "Alt text", type: "string" }),
      ],
    }),
  ],
  preview: {
    select: { media: "founderPortrait" },
    prepare: ({ media }) => ({ title: "Site photographs", media }),
  },
});
