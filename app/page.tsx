import dynamic from "next/dynamic";

import LoadingScreen from "@/components/sections/LoadingScreen";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import Practice from "@/components/sections/Practice";
import WhyUs from "@/components/sections/WhyUs";
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
// Founder portrait + biography — scroll-driven, well below the fold.
const Founder = dynamic(() => import("@/components/sections/Founder"));

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

      <main>
        <Hero />
        <Practice />
        <SelectedWorks />
        <Testimonials />
        <Process />
        <Founder />
        <WhyUs />
        <Services />
        <Contact />
      </main>
    </>
  );
}
