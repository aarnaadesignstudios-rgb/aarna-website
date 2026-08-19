import "server-only";

import { groq } from "next-sanity";

import { WORKS } from "@/constants";
import type { Work } from "@/types";

import { client } from "./client";
import { resolvePhoto, type Photo } from "./image";

/**
 * Reading content, with the constants as the floor.
 *
 * ── Every read here can fail and the site still works ─────────────────────
 *
 * Three things can be true, and all three are supported:
 *
 *   1. Sanity is not configured  → the constants, unchanged
 *   2. Sanity is configured but empty (a fresh project, before anyone has
 *      uploaded anything) → the constants, unchanged
 *   3. Sanity has content → the CMS wins
 *
 * (2) is the one that is easy to get wrong and the one that matters most in
 * practice: it is the state the project is in for the whole gap between
 * creating it and the studio finishing their first upload. Falling back on an
 * empty result means that gap is invisible rather than being a blank ring.
 *
 * A network failure lands in the same place. `fetch` throwing during a render
 * would take out the page over a photograph, which is never the right trade.
 *
 * `server-only` is imported for real, not as a comment: it makes a client
 * component importing this file a BUILD error rather than a runtime surprise.
 */

/** Field-for-field what `Work` needs, so the mapping below stays honest. */
const WORK_FIELDS = groq`
  "id": coalesce(slug.current, _id),
  title,
  category,
  description,
  location,
  area,
  year,
  photo
`;

const WORKS_QUERY = groq`*[_type == "work"] | order(order asc, _createdAt asc) { ${WORK_FIELDS} }`;

type WorkDoc = {
  id: string;
  title: string;
  category: string;
  description?: string;
  location?: string;
  area?: string;
  year?: string;
  photo?: Photo;
};

/**
 * The panel widths are still code, deliberately.
 *
 * They are uneven on purpose so the ring never reads as a carousel, and the
 * value is a CSS length tuned against the card geometry — not something a
 * studio should be asked to nominate per project. Cycling a fixed set keeps the
 * rhythm whatever number of projects exists.
 */
const WIDTHS = [
  "min(78vw, 980px)",
  "min(52vw, 660px)",
  "min(66vw, 860px)",
  "min(46vw, 560px)",
  "min(60vw, 780px)",
  "min(44vw, 540px)",
  "min(58vw, 740px)",
  "min(50vw, 620px)",
  "min(56vw, 700px)",
] as const;

export async function getWorks(): Promise<Work[]> {
  if (!client) return WORKS;

  try {
    const docs = await client.fetch<WorkDoc[]>(
      WORKS_QUERY,
      {},
      {
        // Tagged so the publish webhook can drop exactly this and nothing else
        // — see app/api/revalidate/route.ts.
        next: { tags: ["work"], revalidate: 3600 },
      }
    );

    if (!docs?.length) return WORKS;

    return docs.map((doc, i) => {
      const photo = resolvePhoto(doc.photo, doc.title);
      return {
        id: doc.id,
        title: doc.title,
        category: doc.category,
        description: doc.description ?? "",
        location: doc.location,
        area: doc.area,
        year: doc.year,
        image: photo?.src ?? "",
        objectPosition: photo?.objectPosition,
        width: WIDTHS[i % WIDTHS.length] ?? WIDTHS[0],
      };
    });
  } catch {
    // A photograph is never worth taking the page down for.
    return WORKS;
  }
}
