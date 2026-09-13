/**
 * HomeDocument — the home page's six chapters, as one scrolling document.
 *
 * ── Why this is a component and not just app/page.tsx ─────────────────────
 *
 * Every chapter has a real URL now — `/services`, `/projects`, `/process`,
 * `/contact` — instead of a fragment (see lib/sections.ts for why). Those are
 * routes, and a route has to render something. What they render is THIS: the
 * identical document, prerendered at build time, arriving already scrolled to
 * the chapter that was asked for.
 *
 * So `app/page.tsx` (`/`) and `app/[section]/page.tsx` (`/services` and the
 * rest) are both one line calling this. That is the point — there is exactly
 * one home page, and the six addresses are six ways in, not six copies to keep
 * in sync.
 */
import dynamic from "next/dynamic";

import LoadingScreen from "@/components/sections/LoadingScreen";
import Navbar from "@/components/layout/Navbar";
import Spine from "@/components/layout/Spine";
import Hero from "@/components/sections/Hero";
import Practice from "@/components/sections/Practice";
import Services from "@/components/sections/Services";
import Process from "@/components/sections/Process";
import Contact from "@/components/sections/Contact";
import {
  getHeroSlides,
  getServices,
  getSiteImages,
  getTestimonials,
  getWorks,
} from "@/sanity/lib/content";

/**
 * Below-the-fold, heavier sections are code-split via dynamic import so their
 * JS is not shipped in the initial bundle. They still render on the server for
 * SEO/first paint; only hydration is deferred.
 */
const Testimonials = dynamic(() => import("@/components/sections/Testimonials"));
// Pinned horizontal gallery — heavier + interactive, so code-split.
const SelectedWorks = dynamic(() => import("@/components/sections/SelectedWorks"));

/**
 * ── Two things ended in the client review ─────────────────────────────────
 *
 * The FOOTER is gone. Its useful content — navigation, socials, copyright —
 * moved into <Contact />, which is now the site's ending in all but name. The
 * note was "remove this last slide and have important data in above slide".
 *
 * The brand-values MARQUEE ("Light · Material · Proportion · Craft…") that ran
 * between Services and Contact is gone too. It was flagged in the same pass,
 * and it was pure decoration: a strip of adjectives between the last thing the
 * studio does and the invitation to hire them. Removing it also closes the
 * dead band of space that sat underneath it.
 */
/**
 * ── Server component, so the CMS read happens here ──────────────────────
 *
 * <SelectedWorks /> is a client component — it owns the ring's GSAP timeline —
 * so it cannot fetch. The projects are read here and handed down as a prop,
 * which is also why `getWorks()` can be `server-only`: nothing in the browser
 * bundle ever touches a Sanity client.
 *
 * With no Sanity project configured this returns the constants and the page is
 * byte-for-byte what it was. See sanity/lib/content.ts.
 */
export default async function HomeDocument() {
  /**
   * In parallel. Awaiting these in sequence would make the page's TTFB the SUM
   * of five round trips to the Content Lake for no reason — no query's input
   * depends on another's result.
   *
   * Five and not one combined query, deliberately: each read is tagged with its
   * own document type, which is what lets the publish webhook drop exactly the
   * projects when a project changes and leave the hero, the quotes and the
   * disciplines cached. See app/api/revalidate/route.ts.
   */
  const [works, slides, testimonials, services, siteImages] = await Promise.all([
    getWorks(),
    getHeroSlides(),
    getTestimonials(),
    getServices(),
    getSiteImages(),
  ]);

  return (
    <>
      {/* Intro overlays everything until it dissolves. */}
      <LoadingScreen slides={slides} />

      <Navbar />
      {/* The drawing-sheet margin that runs the length of the page. It is what
          makes the sections read as one document rather than eight blocks — see
          the note in components/layout/Spine.tsx. Home only: it reports on
          numbered sheets, and /faq and /photography have none. */}
      <Spine />

      {/* ── Six chapters, and they are numbered 01–06 ─────────────────
          Two chapters were dropped from this page at the studio's request.
          <Founder /> survives — it carries /about now — and <WhyUs /> does not:
          with no page rendering it, it was dead source, and it went in the
          clean-out along with its <BentoGrid />. Both are in git history if the
          studio ever wants that chapter back.

          The RENUMBERING is not optional bookkeeping. With those two gone the
          remaining sheets ran 01, 02, 03, 04, 07, 08, and a document that skips
          two numbers is visibly a document with pages torn out of it — which is
          the opposite of the brief that this should read as one continuous
          story. Every `index` on a <SectionHeading />, and the list in
          <Spine />, now runs 01–06 with no gaps:

            01  The Practice     paper
            02  Selected Works   the cyclorama
            03  Testimonials     sage
            04  Process          sage-deep
            05  Services         moss
            06  Contact          emerald

          That right-hand column is the story arc — see the note on
          `.surface-moss` in styles/globals.css. */}
      <main>
        <Hero slides={slides} />
        <Practice />
        <SelectedWorks works={works} />
        <Testimonials items={testimonials} />
        <Process />
        {/* <Founder /> lived here and is on /about now. */}
        <Services services={services} />
        <Contact backdrop={siteImages.contactBackdrop} />
      </main>
    </>
  );
}
