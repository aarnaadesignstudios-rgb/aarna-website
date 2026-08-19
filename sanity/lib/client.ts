import { createClient, type SanityClient } from "next-sanity";

import { apiVersion, dataset, projectId, sanityEnabled } from "../env";

/**
 * The read client, or `null` when Sanity is not configured.
 *
 * Returning null rather than throwing is what lets every caller fall back to
 * `constants/content.ts` — see the note in `sanity/env.ts`. `createClient`
 * throws on an empty projectId, so this cannot simply be constructed and left
 * unused.
 */
export const client: SanityClient | null = sanityEnabled
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      /**
       * The CDN is the cached, eventually-consistent edge. It is the right
       * default for published content and it is also the cheaper one — free
       * plans get 1M CDN requests against 250k uncached API requests, so
       * turning this off would burn the smaller allowance four times faster.
       *
       * Freshness is handled by revalidation instead: publishing fires a
       * webhook at `app/api/revalidate/route.ts`, which drops the Next cache
       * for the affected tag. That is a push, so it does not depend on the CDN
       * having caught up.
       */
      useCdn: true,
      perspective: "published",
    })
  : null;
