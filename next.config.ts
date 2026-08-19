import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * `NEXT_DIST_DIR=.next-prod npm run build && NEXT_DIST_DIR=.next-prod npx next start -p 3100`
   *
   * A production build and `next dev` both write to `.next` by default, so
   * running one while the other is up leaves whichever ran last owning the
   * directory — the dev server rebuilds over the production output, and
   * `next start` then reports "Could not find a production build". Pointing a
   * build at its own directory lets the two coexist, which is what makes it
   * possible to profile a real optimised build without stopping dev.
   */
  distDir: process.env.NEXT_DIST_DIR || ".next",
  reactStrictMode: true,
  images: {
    remotePatterns: [
      /**
       * Where CMS photography is served from. `<Media />` routes these through
       * Sanity's own resizer rather than Next's (see that component), but the
       * host still has to be allow-listed — next/image refuses any remote URL
       * it has not been told about, loader or no loader.
       */
      { protocol: "https", hostname: "cdn.sanity.io" },
      /**
       * Stock stand-ins, still in `constants/content.ts` until the studio's own
       * photography replaces them. This entry goes when the last one does.
       */
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
