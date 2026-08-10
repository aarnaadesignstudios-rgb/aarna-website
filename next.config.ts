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
    // Remote placeholder images are used during Phase 1.
    // TODO: Replace remote patterns with locally optimised assets in /public/images.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
