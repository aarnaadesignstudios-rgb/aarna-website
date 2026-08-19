/**
 * The admin panel, at /studio.
 *
 * ── The unconfigured case is a real case ─────────────────────────────────
 *
 * This route exists in every checkout, including ones with no Sanity project —
 * a fresh clone, a preview build, CI. Mounting the Studio unconditionally would
 * make all of those crash on a route nobody asked for, so it checks first and
 * explains what is missing instead. See sanity/env.ts.
 */
import type { Metadata, Viewport } from "next";

import { sanityEnabled } from "@/sanity/env";
import StudioClient from "./StudioClient";
import Missing from "./Missing";

/**
 * The Studio manages its own viewport, and it must not be indexed — it is an
 * admin surface on a public domain. `metadata` here overrides the site's.
 */
export const dynamic = "force-static";
export const metadata: Metadata = {
  /**
   * `absolute`, or the root layout's `%s — Aarnaa Design Studios` template
   * appends the site name to a title that already ends in it — the tab read
   * "Studio — Aarnaa Design Studios — Aarnaa Design Studios".
   */
  title: { absolute: "Studio — Aarnaa Design Studios" },
  robots: { index: false, follow: false },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

export default function StudioPage() {
  return sanityEnabled ? <StudioClient /> : <Missing />;
}
