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
 * The lists (projects, hero images, services, photography) are collections and
 * behave like collections. "Site photographs" is a SINGLETON — there is exactly
 * one founder and one contact backdrop, forever — so it is pinned open as a
 * single editable page.
 *
 * Left to the default, it would render as a list containing one item with an
 * inviting "+" that produces a second copy nothing reads. This is the whole
 * reason to hand-write a structure rather than accept the generated one.
 */
const structure: StructureResolver = (S) =>
  S.list()
    .title("Aarnaa Design Studios")
    .items([
      S.documentTypeListItem("work").title("Projects"),
      S.documentTypeListItem("heroSlide").title("Hero images"),
      S.documentTypeListItem("service").title("Services"),
      S.documentTypeListItem("photoFrame").title("Photography page"),
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
  schema: { types: schemaTypes },
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
