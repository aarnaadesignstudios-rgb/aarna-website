import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

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
 *     Filter    _type in ["work","heroSlide","service","photoFrame","siteImages"]
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

    if (!body?._type) {
      return NextResponse.json({ message: "Missing _type" }, { status: 400 });
    }

    /**
     * Only the type that changed.
     *
     * The reads tag themselves by document type, so replacing a project photo
     * drops the projects and leaves the hero, the services and the photography
     * page cached. Revalidating everything would be simpler and would throw
     * away a page's worth of warm cache for one edited photograph.
     */
    revalidateTag(body._type);

    return NextResponse.json({ revalidated: true, tag: body._type });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
