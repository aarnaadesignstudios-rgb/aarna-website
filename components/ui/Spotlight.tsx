"use client";

/**
 * Spotlight — animated gradient spotlight background (Aceternity).
 *
 * Ported from the Aceternity registry to import our `framer-motion` and tinted
 * to the brand (warm gold instead of blue), so it reads as a soft, moving shaft
 * of light rather than a tech gradient. Drop it inside a `relative overflow-hidden`
 * section behind the content.
 *
 * Source: https://ui.aceternity.com/components/spotlight-new
 */
import { motion } from "framer-motion";

interface SpotlightProps {
  gradientFirst?: string;
  gradientSecond?: string;
  gradientThird?: string;
  translateY?: number;
  width?: number;
  height?: number;
  smallWidth?: number;
  duration?: number;
  xOffset?: number;
}

export default function Spotlight({
  // Warm gold light (hsl ~41,45%). Kept faint for an elegant wash.
  gradientFirst = "radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(41, 55%, 70%, 0.10) 0, hsla(41, 45%, 55%, 0.04) 50%, hsla(41, 45%, 45%, 0) 80%)",
  gradientSecond = "radial-gradient(50% 50% at 50% 50%, hsla(41, 55%, 70%, 0.08) 0, hsla(41, 45%, 55%, 0.03) 80%, transparent 100%)",
  gradientThird = "radial-gradient(50% 50% at 50% 50%, hsla(41, 55%, 70%, 0.06) 0, hsla(41, 45%, 45%, 0.03) 80%, transparent 100%)",
  translateY = -350,
  width = 560,
  height = 1380,
  smallWidth = 240,
  duration = 8,
  xOffset = 100,
}: SpotlightProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <motion.div
        animate={{ x: [0, xOffset, 0] }}
        transition={{ duration, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        className="pointer-events-none absolute left-0 top-0 z-10 h-screen w-screen"
      >
        <div
          style={{ transform: `translateY(${translateY}px) rotate(-45deg)`, background: gradientFirst, width, height }}
          className="absolute left-0 top-0"
        />
        <div
          style={{ transform: "rotate(-45deg) translate(5%, -50%)", background: gradientSecond, width: smallWidth, height }}
          className="absolute left-0 top-0 origin-top-left"
        />
        <div
          style={{ transform: "rotate(-45deg) translate(-180%, -70%)", background: gradientThird, width: smallWidth, height }}
          className="absolute left-0 top-0 origin-top-left"
        />
      </motion.div>

      <motion.div
        animate={{ x: [0, -xOffset, 0] }}
        transition={{ duration, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        className="pointer-events-none absolute right-0 top-0 z-10 h-screen w-screen"
      >
        <div
          style={{ transform: `translateY(${translateY}px) rotate(45deg)`, background: gradientFirst, width, height }}
          className="absolute right-0 top-0"
        />
        <div
          style={{ transform: "rotate(45deg) translate(-5%, -50%)", background: gradientSecond, width: smallWidth, height }}
          className="absolute right-0 top-0 origin-top-right"
        />
        <div
          style={{ transform: "rotate(45deg) translate(180%, -70%)", background: gradientThird, width: smallWidth, height }}
          className="absolute right-0 top-0 origin-top-right"
        />
      </motion.div>
    </motion.div>
  );
}
