import type { SchemaTypeDefinition } from "sanity";

import { heroSlide } from "./heroSlide";
import { work } from "./work";
import { disciplineProject } from "./disciplineProject";
import { testimonial } from "./testimonial";
import { client } from "./client";
import { accolade } from "./accolade";
import { siteImages } from "./siteImages";

/**
 * The whole content model.
 *
 * ── What is deliberately NOT here ─────────────────────────────────────────
 *
 * The mark and the wordmark. A studio replacing its own logo by accident is a
 * worse failure than not being able to replace it at all, so they stay in the
 * repo — see `components/ui/Mark.tsx`.
 *
 * Nor is any copy that carries the site's structure: the section numbers, the
 * chapter names, the process steps. Those are the document's skeleton, and a
 * CMS field for each would invite edits that break the page's grammar without
 * anything failing loudly.
 *
 * The SERVICES went the same way, at the studio's request, after briefly being
 * editable here. The six disciplines are the site's spine as much as the
 * chapter names are: the Services bento packs its tiles from the COUNT (see
 * `wideIndex` in components/sections/Services.tsx), the desktop track's
 * progress readout divides by it, and the copy has to hold inside a 272px tile
 * face. None of that fails loudly when a seventh discipline is published or a
 * description is rewritten three sentences long — it just quietly stops
 * looking composed. They live in constants/content.ts and change in a commit,
 * where the layout can be re-checked in the same breath.
 *
 * What IS here is the photography, which is the thing that actually changes —
 * and, since the client wall is the one piece of COPY that arrives after a
 * launch rather than with it, the testimonials.
 *
 * ── TWO project types, and they are not a mistake ────────────────────────
 *
 * `work` and `disciplineProject` hold the same kind of thing through the same
 * field set, and they are separate on purpose, at the studio's instruction.
 *
 *   · `work` is the Selected Works ring. Publishing one puts it on the home
 *     page; there is no other way onto the ring and no way to publish one
 *     without that happening.
 *   · `disciplineProject` is the body of work, listed at
 *     /services/<discipline> under What we do.
 *
 * Nothing joins them — no reference, no shared flag, no filter. A commission
 * the studio wants in both places is entered twice.
 *
 * The first design was one type with a "show on the home page" tick, which is
 * the tidier content model and the wrong one here. It made the front page a
 * property of every project in the catalogue, so the ring filled with
 * architecture the moment a tick was missed, and it forced one write-up to
 * serve two jobs that want different things — the ring wants a name and a
 * hero frame, a catalogue page wants drawings and a spec. The studio asked
 * for them kept apart and accepted re-entering the details; two types is what
 * that means, and it is the only shape where the two cannot leak.
 *
 * The FIELDS are still shared (./projectFields.ts) — the separation is in the
 * content, the Studio sections and the URLs, not in the form.
 *
 * ── The two credit bands are here for the same reason ────────────────────
 *
 * `client` and `accolade` feed the two <CreditBand /> strips on the home page.
 * They pass the test the services failed: neither one is load-bearing. The
 * band is a marquee that measures its own track and derives its speed from it,
 * so a ninth client makes the lap longer and changes nothing else — there is
 * no tile count to pack, no progress readout dividing by the length, and no
 * fixed face for the copy to overflow. A name is a name.
 *
 * They are also the content on the site that changes MOST often and matters
 * most when it is stale: a studio that has just won something should not need
 * a developer to say so. And the committed lists behind them are the only
 * invented content in constants/content.ts, which makes replacing them from
 * the Studio the first thing anyone does here.
 *
 * TWO types rather than one with a "which band" field, deliberately. The two
 * lists are ordered independently — reordering the client wall must not
 * reshuffle the awards — and the publish webhook can then drop exactly one of
 * the two. They converge later, on `Credit`, which is the point at which they
 * genuinely are the same shape. See types/index.ts.
 */
export const schemaTypes: SchemaTypeDefinition[] = [
  work,
  disciplineProject,
  heroSlide,
  testimonial,
  client,
  accolade,
  siteImages,
];
