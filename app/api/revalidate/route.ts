import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

import { CONTENT_TAGS } from "@/sanity/lib/tags";

/**
 * What makes "Publish" appear on the live site in seconds.
 *
 * ── The alternative, and why not ─────────────────────────────────────────
 *
 * Without this the reads in `sanity/lib/content.ts` would go stale for their
 * full `revalidate` window — an hour — so a studio replacing a photograph would
 * see nothing change and reasonably conclude it had not worked. Shortening that
 * window instead would mean refetching on a timer forever to catch a change
 * that happens a few times a year, which is the wrong shape: this is a push, so
 * it costs nothing until something actually changes.
 *
 * ── The secret is not optional ───────────────────────────────────────────
 *
 * `parseBody` verifies Sanity's signature against `SANITY_REVALIDATE_SECRET`.
 * With no secret set it returns `isValidSignature: false` and this route
 * refuses everything — which is the correct default. An open revalidate
 * endpoint lets anyone on the internet flush the cache repeatedly and turn a
 * cached site into an uncached one.
 *
 * ── Setting it up ────────────────────────────────────────────────────────
 *
 *   sanity.io → Settings → API → Webhooks → Create webhook
 *     URL       https://<your-domain>/api/revalidate
 *     Dataset   production
 *     Trigger   Create, Update, Delete
 *     Filter    _type in ["work","disciplineProject","heroSlide",
 *                         "testimonial","client","accolade","siteImages"]
 *     Projection  {"_type": _type}
 *     Secret    the same value as SANITY_REVALIDATE_SECRET
 */
export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(
      req,
      process.env.SANITY_REVALIDATE_SECRET
    );

    if (!isValidSignature) {
      // 401, not 400: the request was well-formed, it just was not from Sanity.
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }

    /**
     * ── A payload with no `_type` drops EVERYTHING, rather than nothing ──
     *
     * This used to answer 400 and revalidate nothing, which was wrong in the
     * one case it was most likely to meet: a DELETE. The projection asks for
     * `_type`, and on a delete the document it would be read from no longer
     * exists — so depending on how the webhook is written, that field can
     * arrive null. The 400 then looked like a rejected malformed request, while
     * what had actually happened was that a deleted project stayed on the site
     * until the revalidate window expired.
     *
     * Dropping every tag is the conservative answer and it is CHEAP, because
     * getting here at all means the signature verified: this request is from
     * Sanity, something really did change, and we do not know what. The cost is
     * one cold read per tag on the next request; the cost of the old behaviour
     * was serving content that had been deleted.
     *
     * It cannot be abused. An attacker without the secret never reaches this
     * line — see the signature check above.
     */
    const type = body?._type;

    if (!type) {
      for (const tag of CONTENT_TAGS) revalidateTag(tag);
      return NextResponse.json({
        revalidated: true,
        tags: CONTENT_TAGS,
        reason: "no _type in payload — revalidated everything",
      });
    }

    /**
     * The normal path: only the type that changed.
     *
     * The reads tag themselves by document type, so replacing a project photo
     * drops the projects and leaves the hero and the quotes cached. Revalidating everything every time would be simpler and would
     * throw away a page's worth of warm cache for one edited photograph.
     *
     * An unrecognised `_type` is a harmless no-op — `revalidateTag` on a tag
     * nothing uses does nothing — so a webhook filter that is broader than the
     * schema costs nothing either.
     */
    revalidateTag(type);

    return NextResponse.json({ revalidated: true, tag: type });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
