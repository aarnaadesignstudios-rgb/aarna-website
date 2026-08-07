import dynamic from "next/dynamic";

import LoadingScreen from "@/components/sections/LoadingScreen";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Practice from "@/components/sections/Practice";
import WhyUs from "@/components/sections/WhyUs";
import Services from "@/components/sections/Services";
import Process from "@/components/sections/Process";
import Contact from "@/components/sections/Contact";
import { Marquee } from "@/components/ui";

/**
 * Below-the-fold, heavier sections are code-split via dynamic import so their
 * JS is not shipped in the initial bundle. They still render on the server for
 * SEO/first paint; only hydration is deferred.
 *
 * TODO (future phases): revisit these boundaries once cinematic scroll timelines
 *       are added — some may warrant ssr:false if they are purely interactive.
 */
// Currently disabled — re-enable together with <FeaturedProjects /> in <main>.
// (Left importing while unused fails the build under `noUnusedLocals`.)
// const FeaturedProjects = dynamic(
//   () => import("@/components/sections/FeaturedProjects")
// );
const Testimonials = dynamic(
  () => import("@/components/sections/Testimonials")
);
// Pinned horizontal gallery — heavier + interactive, so code-split.
const SelectedWorks = dynamic(
  () => import("@/components/sections/SelectedWorks")
);
// Founder portrait + philosophy — scroll-driven, well below the fold.
const Founder = dynamic(() => import("@/components/sections/Founder"));

export default function Home() {
  return (
    <>
      {/* Loading screen overlays everything until the intro completes. */}
      <LoadingScreen />

      <Navbar />

      <main>
        <Hero />
        {/* The practice opens the page's narrative, carrying the brand statement.
            The credibility figures that used to sit here in their own dark band
            are now the gold strip across the top of <Practice /> — same place in
            the page, but markup inside that section rather than a section of its
            own, so it takes no sheet number and the 01…08 run is unaffected. */}
        <Practice />
        <SelectedWorks />
        <Testimonials />
        <Process />
        <Founder />
        <WhyUs />
        <Services />
        {/* Brand values marquee — a quietly premium editorial divider. */}
        <Marquee
          tone="charcoal"
          items={["Light", "Material", "Proportion", "Craft", "Stillness", "Permanence"]}
        />
        {/* <FeaturedProjects /> */}
        
        
        <Contact />
      </main>

      <Footer />
    </>
  );
}
