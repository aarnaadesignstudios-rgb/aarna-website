import { defineField, defineType } from "sanity";

import { projectFields } from "./projectFields";
import { slug } from "./shared";

/**
 * A commission on the Selected Works ring (chapter 02).
 *
 * ── This IS the ring, and nothing else ───────────────────────────────────
 *
 * Every `work` document appears on the home page. There is no flag, no
 * filter and no "featured" tick: publishing one here is putting it on the
 * front page. That is the studio's decision — the flagged version worked, but
 * it left the front page one unticked checkbox away from showing the entire
 * catalogue, and the two things were never meant to be one list.
 *
 * Keep it to five or six. The ring is a pinned horizontal run a visitor gets
 * through in one gesture, and past about eight it stops reading as a
 * selection — at which point the chapter called Selected Works is selecting
 * nothing.
 *
 * ── The rest of the work lives in `disciplineProject` ────────────────────
 *
 * That is a SEPARATE collection with its own Studio section and its own pages
 * under /services/<discipline> — see the note in ./index.ts. There is no link
 * between the two: no shared field, no reference, no filter. A commission the
 * studio wants in both places is published twice, on purpose.
 *
 * ── Everything but the identity is shared ────────────────────────────────
 *
 * The fields after `category` are `projectFields()`, the same set
 * `disciplineProject` uses, because a project's FORM is the same object in
 * both collections even though the content is not. Location, area and year
 * are optional in both: the site only renders that meta row when there is
 * something to put in it, so leaving them blank is a supported state rather
 * than an unfinished one. See ./projectFields.ts.
 */
export const work = defineType({
  name: "work",
  title: "Selected Work",
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
      description:
        "Printed above the project name, on the ring and on the project's own page. Say the most useful specific thing about this job — “Food Court”, “Workspace Interiors”, “Hospitality”.",
      validation: (rule) => rule.required(),
    }),
    ...projectFields(),
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
