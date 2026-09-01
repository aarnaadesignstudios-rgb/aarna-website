import HomeDocument from "@/components/sections/HomeDocument";

/**
 * `/` — the home page.
 *
 * The document itself lives in <HomeDocument />, because the five chapter
 * routes (`/services`, `/projects`, `/process`, `/contact`, `/practice`) render
 * exactly the same thing and arrive scrolled to their section. See
 * app/[section]/page.tsx and lib/sections.ts.
 */
export default function Home() {
  return <HomeDocument />;
}
