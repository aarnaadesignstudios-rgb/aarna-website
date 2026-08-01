/**
 * GrainOverlay — a fixed, ultra-subtle film-grain texture over the whole page.
 *
 * Adds tactile, premium richness (the difference between "flat template" and
 * "art-directed"). Pointer-events-none and very low opacity so it never harms
 * legibility. Sits below the navbar/loader so UI stays crisp.
 *
 * Server component — pure CSS/SVG, no JS.
 */
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40 opacity-[0.04] mix-blend-soft-light"
      style={{ backgroundImage: NOISE, backgroundSize: "140px 140px" }}
    />
  );
}
