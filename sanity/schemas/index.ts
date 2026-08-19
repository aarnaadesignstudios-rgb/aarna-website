import type { SchemaTypeDefinition } from "sanity";

import { heroSlide } from "./heroSlide";
import { work } from "./work";
import { service } from "./service";
import { photoFrame } from "./photoFrame";
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
 * What IS here is the photography, which is the thing that actually changes.
 */
export const schemaTypes: SchemaTypeDefinition[] = [
  work,
  heroSlide,
  service,
  photoFrame,
  siteImages,
];
