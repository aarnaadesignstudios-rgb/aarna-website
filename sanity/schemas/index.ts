import type { SchemaTypeDefinition } from "sanity";

import { heroSlide } from "./heroSlide";
import { work } from "./work";
import { testimonial } from "./testimonial";
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
 */
export const schemaTypes: SchemaTypeDefinition[] = [
  work,
  heroSlide,
  testimonial,
  siteImages,
];
