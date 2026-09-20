"use client";

/**
 * The Studio — the admin panel, served from this same app at `/studio`.
 *
 * ── Why it lives in the repo ──────────────────────────────────────────────
 *
 * Sanity's Studio is a React application, not a hosted product page, so it
 * deploys with the site. Two things follow, and both are the reason to prefer
 * this over a separate admin service:
 *
 *   · the SCHEMA below is code. Whoever logs in can fill in the fields defined
 *     here and nothing else — they cannot add a field, rename one, or
 *     restructure the content model by clicking. On Sanity's free plan every
 *     editor is an Administrator, so this is not a small point: the schema
 *     being in git is what actually constrains them.
 *   · there is one deployment, one domain, one login. The studio does not have
 *     to be taught where a second system lives.
 *
 * ── It is safe to have no project ID ─────────────────────────────────────
 *
 * `defineConfig` is happy with an empty projectId; it is `createClient` that
 * throws. The route at `app/studio/[[...tool]]/page.tsx` checks `sanityEnabled`
 * and explains itself rather than mounting this, so an unconfigured checkout
 * gets instructions instead of a stack trace.
 */
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool, type StructureResolver } from "sanity/structure";

import { apiVersion, dataset, projectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemas";

/**
 * ── Two shapes of content, shown as two shapes of navigation ─────────────
 *
 * The lists (selected works, the three What-we-do sections, hero images,
 * testimonials, clients, awards) are collections and behave like
 * collections. "Site photographs" is a SINGLETON — there is exactly one
 * founder and one contact backdrop, forever — so it is pinned open as a single
 * editable page.
 *
 * Left to the default, it would render as a list containing one item with an
 * inviting "+" that produces a second copy nothing reads. This is the whole
 * reason to hand-write a structure rather than accept the generated one.
 */
const structure: StructureResolver = (S) =>
  S.list()
    .title("Aarnaa Design Studios")
    .items([
      /**
       * ── The ring, and it is the whole of its collection ──────────────
       *
       * Every `work` document is on the home page. No filter, no tick — see
       * the note at the top of sanity/schemas/work.ts. This list is
       * therefore both "the Selected Works documents" and "what the front
       * page shows", which is what makes it impossible to put a catalogue
       * project on the ring by accident.
       */
      S.documentTypeListItem("work").title("Selected Works"),

      /**
       * ── What we do — the catalogue, in three sections ────────────────
       *
       * A DIFFERENT document type from the one above, with no link to it.
       * Publishing here changes nothing on the home page and publishing
       * there changes nothing on these pages; a commission that belongs in
       * both is entered in both. That is the separation the studio asked
       * for, and two types is the only shape where it cannot leak.
       *
       * One list per page at /services/<discipline>, so "the architecture
       * section" is a place an editor can actually go. Each creates through
       * a template that sets `discipline` on the way in, so nobody has to
       * know the field is what makes the list work — without it an editor
       * creates a project inside Architecture, saves, and watches it vanish
       * from the list they created it in.
       *
       * The values here are the ids in lib/disciplines.ts and the options on
       * the schema's `discipline` field. All three have to agree; nothing
       * can check that across the Studio boundary, so `npm run sanity:check`
       * reports the counts and names any stray.
       */
      S.listItem()
        .title("What we do")
        .id("what-we-do")
        .child(
          S.list()
            .title("What we do")
            .items([
              ...(
                [
                  ["architecture", "Architecture"],
                  ["commercial-interiors", "Commercial Interiors"],
                  ["boutique-interiors", "Boutique Interiors"],
                ] as const
              ).map(([value, title]) =>
                S.listItem()
                  .title(title)
                  .id(value)
                  .child(
                    S.documentTypeList("disciplineProject")
                      .title(title)
                      .filter(
                        '_type == "disciplineProject" && discipline == $discipline'
                      )
                      .params({ discipline: value })
                      .initialValueTemplates([
                        S.initialValueTemplateItem("project-by-discipline", {
                          discipline: value,
                        }),
                      ])
                  )
              ),
              S.divider(),
              /* The flat list, last: it is where a project with a stray or
                 missing discipline can still be found and fixed. */
              S.documentTypeListItem("disciplineProject").title(
                "All — every discipline"
              ),
            ])
        ),

      S.documentTypeListItem("heroSlide").title("Hero images"),
      S.documentTypeListItem("testimonial").title("Testimonials"),
      /* The two credit bands on the home page. Separate lists because they are
         separate orderings — see sanity/schemas/index.ts. */
      S.documentTypeListItem("client").title("Clients"),
      S.documentTypeListItem("accolade").title("Awards & press"),
      S.divider(),
      S.listItem()
        .title("Site photographs")
        .child(
          S.document()
            .schemaType("siteImages")
            // A fixed id, so there can only ever be one of these.
            .documentId("siteImages")
        ),
    ]);

export default defineConfig({
  name: "aarnaa",
  title: "Aarnaa Design Studios",
  basePath: "/studio",
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
    /**
     * The template each What-we-do section creates through, so a project
     * made inside "Architecture" arrives with `discipline` already set.
     *
     * Sanity's default template for a type takes no parameters, which is why
     * this exists as a named one rather than being expressed in the structure
     * alone — `initialValueTemplateItem` can only reference a template that
     * has been declared here.
     */
    templates: (prev) => [
      ...prev,
      {
        id: "project-by-discipline",
        title: "Project in this discipline",
        schemaType: "disciplineProject",
        parameters: [{ name: "discipline", type: "string" }],
        value: ({ discipline }: { discipline: string }) => ({ discipline }),
      },
    ],
  },
  plugins: [
    structureTool({ structure }),
    /**
     * The GROQ playground. Useful when a query is not returning what it should,
     * and harmless in production — it can only read what the dataset already
     * exposes publicly, and it is behind the Studio's own login regardless.
     */
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
