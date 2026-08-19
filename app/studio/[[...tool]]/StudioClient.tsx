"use client";

/**
 * The Studio itself.
 *
 * Split from the route so that `page.tsx` can stay a server component and read
 * `sanityEnabled` before any of Sanity's client bundle is reached. Importing
 * `next-sanity/studio` from the route directly would pull the whole Studio into
 * the graph even on a checkout that has no project to show.
 */
import { NextStudio } from "next-sanity/studio";

import config from "@/sanity.config";

export default function StudioClient() {
  return <NextStudio config={config} />;
}
