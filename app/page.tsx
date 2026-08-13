import dynamic from "next/dynamic";

import LoadingScreen from "@/components/sections/LoadingScreen";
import Navbar from "@/components/layout/Navbar";
import Spine from "@/components/layout/Spine";
import Hero from "@/components/sections/Hero";
import Practice from "@/components/sections/Practice";
import Services from "@/components/sections/Services";
import Process from "@/components/sections/Process";
import Contact from "@/components/sections/Contact";

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
export default function Home() {
  return (
    <>
      {/* Intro overlays everything until it dissolves. */}
      <LoadingScreen />

      <Navbar />
      {/* The drawing-sheet margin that runs the length of the page. It is what
          makes the sections read as one document rather than eight blocks — see
          the note in components/layout/Spine.tsx. Home only: it reports on
          numbered sheets, and /faq and /photography have none. */}
      <Spine />

      {/* ── Six chapters, and they are numbered 01–06 ─────────────────
          <Founder /> and <WhyUs /> are commented out at the studio's request.
          Both components are kept intact — nothing is deleted, so putting
          either back is a one-line change.

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
        <Hero />
        <Practice />
        <SelectedWorks />
        <Testimonials />
        <Process />
        {/* <Founder /> — commented out at the studio's request. */}
        {/* <WhyUs />  — commented out at the studio's request. */}
        <Services />
        <Contact />
      </main>
    </>
  );
}
