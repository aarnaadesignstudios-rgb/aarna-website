import dynamic from "next/dynamic";

import LoadingScreen from "@/components/sections/LoadingScreen";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Achievements from "@/components/sections/Achievements";
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
// Ruled accordion index — interactive, six lazy images, so code-split.
const Disciplines = dynamic(() => import("@/components/sections/Disciplines"));
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
        {/* A short credibility band catches the eye on the way out of the hero,
            before the narrative proper begins. */}
        <Achievements />
        {/* The practice opens the page's narrative, carrying the brand statement. */}
        <Practice />
        <SelectedWorks />
        <Disciplines />
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
