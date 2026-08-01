"use client";

/**
 * LoadingScreen — brand intro overlay.
 *
 * Covers the viewport on first load, presents the Aarnaa brand logo, then lifts
 * away as a curtain. Phase 1 keeps dismissal on a simple timer so the rest of
 * the site can be built without waiting on a long intro.
 *
 * The logo is rendered via <Logo>, which loads /public/images/aarnaa-logo.png
 * and falls back to the wordmark if the asset isn't present yet.
 *
 * TODO (future phases):
 *  - Drive dismissal off real asset/font readiness, not a fixed timer.
 *  - Upgrade to a cinematic counter (0–100) / mask reveal of the logo.
 *  - Coordinate hand-off so the Hero begins exactly as this exits.
 */
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useIsomorphicLayoutEffect } from "@/hooks";
import { Logo } from "@/components/ui";
import { INTRO } from "@/constants";

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);

  useIsomorphicLayoutEffect(() => {
    // Prevent scrolling while the intro is on screen.
    document.body.style.overflow = "hidden";

    const timer = window.setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = "";
    }, INTRO.holdMs);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          // Rich emerald surface (tonal gradient + gold glow) behind the
          // transparent logo — a more dimensional, premium intro than flat green.
          className="surface-emerald fixed inset-0 z-100 flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ y: "-100%" }}
          transition={{ duration: INTRO.liftMs / 1000, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Logo: gentle fade + scale settle. */}
          <motion.div
            className="w-[72vw] max-w-110 px-6"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <Logo widthPx={440} priority />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
