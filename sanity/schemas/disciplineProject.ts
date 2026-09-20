import { defineField, defineType } from "sanity";

import { projectFields } from "./projectFields";
import { slug } from "./shared";

/**
 * A commission in the catalogue under What we do.
 *
 * ── A separate collection from `work`, at the studio's instruction ───────
 *
 * These two types hold the same KIND of thing and are deliberately not the
 * same list:
 *
 *   · `work` is the Selected Works ring — five or six, on the home page
 *   · this is the body of work, listed at /services/<discipline>
 *
 * There is no field connecting them, no reference, no shared flag. Publishing
 * here has no effect on the home page and publishing there has no effect on
 * these pages. A commission the studio wants in both places is entered twice.
 *
 * That duplication is the point rather than a cost the studio is absorbing.
 * The first design made `work` one list with a "show on the home page" tick,
 * which is tidier on paper and put architecture projects on the ring the
 * moment the tick was missed. Two collections cannot leak into each other,
 * and the two entries can also differ — the ring wants a name and a hero
 * frame, a catalogue page wants drawings and a write-up.
 *
 * ── `discipline` is what makes it appear at all ──────────────────────────
 *
 * Unlike on `work`, it is REQUIRED here: there is no page for a discipline
 * project without one. It is not a printed label either — `category` is what
 * gets printed. See the field's own note.
 *
 * ── Everything else is `projectFields()` ─────────────────────────────────
 *
 * The same set `work` uses, so the two render through one component and an
 * editor types into one form. See ./projectFields.ts.
 */
export const disciplineProject = defineType({
  name: "disciplineProject",
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
    /**
     * Which of the three pages lists this project.
     *
     * ── A list, not a free string ────────────────────────────────────────
     *
     * There are exactly three pages and they are prerendered from
     * `lib/disciplines.ts`. A typed value would be a project that appears on
     * none of them — the document saves, the Studio shows it, and the only
     * symptom is a page one project short. `layout: "radio"` makes that
     * unrepresentable.
     *
     * REQUIRED, unlike most fields here, because there is genuinely nowhere
     * for the project to go without it. The Studio's three sections also set
     * it on creation, so in normal use nobody is asked the question twice.
     *
     * These values MUST match the ids in lib/disciplines.ts. Nothing can
     * check that across the boundary — the Studio stores a plain string —
     * so `npm run sanity:check` reports the counts and names any stray.
     */
    defineField({
      name: "discipline",
      title: "Discipline",
      type: "string",
      description:
        "Which page under What we do lists this project. Set automatically when you create the project from inside one of the three sections.",
      options: {
        list: [
          { title: "Architecture", value: "architecture" },
          { title: "Commercial Interiors", value: "commercial-interiors" },
          { title: "Boutique Interiors", value: "boutique-interiors" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      description:
        "Printed above the project name, on the card and on the project's own page. Say the most useful specific thing about this job — “Food Court”, “Private Residence”, “Hospitality”. This is the label a visitor reads; the Discipline above is what decides which page it is on, so the two do not have to match.",
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
