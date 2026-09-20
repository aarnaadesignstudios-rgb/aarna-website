import { SITE } from "@/constants";
import type { WorkDetail } from "@/types";

/**
 * The `<meta name="description">` for a project page.
 *
 * ── Why it is here and not in either route ───────────────────────────────
 *
 * Two routes render a project — /work/<slug> for the Selected Works ring and
 * /services/<discipline>/<slug> for the catalogue under What we do. They are
 * deliberately separate collections (see sanity/schemas/index.ts), but the
 * question "what does this page say it is about" has one answer, and the
 * fallback chain below is the part that would silently diverge: one route
 * gaining a better fallback and the other keeping the old one is invisible
 * in the browser and shows up months later as half the project pages having
 * a worse search snippet than the other half.
 *
 * ── The chain, in the order the studio would want it ─────────────────────
 *
 *   1. the one-line `description`, which is written FOR this
 *   2. the first paragraph of the write-up, if there is one
 *   3. a constructed line, so a project published with a photograph and
 *      nothing else still has a real description rather than none
 *
 * The write-up is Portable Text, so its opening paragraph has to be walked
 * out of the block array rather than sliced off a string.
 *
 * 180 characters because that is roughly where Google truncates, and a
 * description cut mid-word in a result listing reads as a broken page.
 */
export function projectDescription(work: WorkDetail): string {
  const firstParagraph = Array.isArray(work.body)
    ? ((work.body as { _type?: string; children?: { text?: string }[] }[])
        .find((b) => b?._type === "block" && b.children?.length)
        ?.children?.map((c) => c.text ?? "")
        .join("") ?? "")
    : "";

  const description =
    work.description?.trim() ||
    firstParagraph.trim() ||
    `${work.title} — ${work.category} by ${SITE.name}.`;

  return description.slice(0, 180);
}
