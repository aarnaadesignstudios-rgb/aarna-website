"use client";

/**
 * Blueprint — the studio's plan, drawn by the reader's own scroll.
 *
 * ── What this is for ──────────────────────────────────────────────────────
 *
 * Chapter 01 is the practice talking about how it works: "Every space has a
 * story. Our work begins by listening to it." The section should show that
 * happening, and the honest way to show a studio working is a drawing being
 * made.
 *
 * So the plan draws itself as the chapter passes, tied to scroll position. You
 * arrive and it is bare walls; by the time you have read the statement the
 * house is complete, named and dimensioned. Scroll back and it un-draws.
 *
 * ── Why it is not a loop any more ─────────────────────────────────────────
 *
 * It was: a 17s cycle, drawing and erasing forever, on six desynchronised
 * clocks so that no two parts moved together. It was more technically involved
 * than this and it was worse, for one reason — a drawing that is never finished
 * is never legible. At any given moment a third of the sheet was missing, so
 * nobody could tell it was a house. It read as smudges on the paper.
 *
 * The change is not a tuning. Perpetual motion reveals NOTHING: it is the same
 * information at every scroll position, so it cannot carry the section. A
 * scrubbed draw is progressive disclosure — the animation and the reading
 * happen together, and stopping stops it, which is what makes it feel like a
 * thing you are doing rather than a thing playing at you.
 *
 * ── The three things the reader can do ───────────────────────────────────
 *
 *   SCROLL   draws the house. The primary interaction, and discoverable by
 *            definition — everybody scrolls.
 *   POINT    a lamp follows the cursor and, inside it, the drawing is finished
 *            and at full strength. Rewards anyone who stops to look.
 *   MOVE     the sheet shifts a few pixels against the pointer, the way paper
 *            slides under a hand.
 *
 * ── The court is where the type goes ─────────────────────────────────────
 *
 * The house is planned around a deep central court with every room in a wing.
 * That is not an aesthetic choice: it is how the drawing and the statement
 * occupy the same space without fighting. A plan with rooms in the middle needs
 * most of itself masked away to clear a wide two-line heading, and what
 * survives is fragments.
 *
 * ── Pencil, and no filter ────────────────────────────────────────────────
 *
 * The hand's wander is baked into the coordinates — every straight run is a
 * short polyline whose interior points are pushed off the line, deviation
 * largest mid-run and nil at each end. It used to be an `feDisplacementMap`,
 * which cost ~10fps because an SVG filter re-evaluates whenever its source
 * changes and the source is 120 paths whose dash offset changes every frame.
 * Baked, it costs nothing and looks identical, because it is identical.
 *
 * The graphite grain is a static CSS mask (`GRAIN`) for the same reason.
 *
 * Gold carries the structure, emerald the annotation — the building in one
 * weight, what is said about it in another, which is how a drawing is marked up.
 */
import { useEffect, useRef } from "react";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks";

import { cn } from "@/utils/cn";

/**
 * Where each group sits in the draw, as a fraction of the scroll through the
 * chapter.
 *
 * The building goes down before anything is said about it: envelope, then the
 * wings, then the openings, then what is fitted into the rooms, then the
 * annotation, and the writing last. That is the order it is done in, and it is
 * the only order in which watching it makes sense.
 *
 * `span` is how long that group takes. They overlap deliberately — a
 * draughtsman does not finish every wall before starting a door — and the
 * overlap is what stops the sheet arriving in six visible instalments.
 */
const GROUPS = {
  envelope: { at: 0.0, span: 0.3 },
  partitions: { at: 0.14, span: 0.28 },
  openings: { at: 0.3, span: 0.26 },
  fittings: { at: 0.44, span: 0.24 },
  annotation: { at: 0.56, span: 0.28 },
  labels: { at: 0.72, span: 0.24 },
} as const;

type GroupName = keyof typeof GROUPS;

/**
 * Marks an element as belonging to a group, at position `i` within it.
 *
 * The values land as data attributes rather than as inline styles, because the
 * scrub reads them once on mount and then writes only `stroke-dashoffset`. An
 * element that carries its own schedule needs no lookup table beside it.
 */
const at = (g: GroupName, i = 0) => ({ "data-g": g, "data-i": i });

/**
 * Room names, at each room's centre.
 *
 * ── They live in the WINGS, never in the court ────────────────────────────
 *
 * Measured: the heading occupies x 372–1228 and y 147–515 of this 1600x780
 * sheet. The first plan put STUDY and TERRACE at y 196 and BEDROOM 01 at
 * y 240 — straight through the middle of "Design is the brand of our" — and no
 * amount of masking fixes that, because an ellipse large enough to clear a wide
 * two-line heading takes most of the drawing with it.
 *
 * So the house is re-planned rather than the mask re-tuned: one deep court
 * across the middle with every room in the left or right wing, and the two
 * service rooms in a band along the bottom. The court is 370–1210, which
 * contains the heading with about 20 units to spare on the left and a shade
 * over on the right — close enough that a small, soft mask finishes the job.
 */
const ROOMS = [
  { x: 231, y: 210, label: "LIVING" },
  { x: 231, y: 400, label: "KITCHEN" },
  { x: 231, y: 600, label: "UTILITY" },
  { x: 1344, y: 210, label: "BEDROOM 01" },
  { x: 1344, y: 400, label: "BEDROOM 02" },
  { x: 1344, y: 600, label: "BATH" },
  { x: 560, y: 660, label: "ENTRY" },
  { x: 1000, y: 660, label: "STAIR" },
] as const;

/**
 * The paper's tooth, as a static mask.
 *
 * A soft pencil only deposits where the raised grain of the sheet rises to meet
 * it, which is why a light pencil line is speckled rather than solid. This is
 * that: fractal noise pushed through a colour matrix that discards RGB and
 * keeps a thresholded ALPHA, so the drawing underneath is eaten away in
 * patches.
 *
 * A data URI rather than an SVG filter on the drawing itself. It is the same
 * arithmetic either way, but as a mask it is one image the compositor
 * rasterises once, and as a filter it was re-run on every animation frame — see
 * the note in the filter above.
 *
 * `-1.5 / 1.24` in the alpha row sets how much survives. Steeper is patchier;
 * past about -3 the strokes break into dots and stop reading as lines.
 */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.62' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -1.5 1.24'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")";

function PlanArt() {
  return (
    <svg
      viewBox="0 0 1600 780"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
    >
      {/* ── There is no filter here any more ─────────────────────────
          The hand's wander is BAKED INTO THE COORDINATES: every straight run in
          this sheet is a short polyline whose interior points are pushed off
          the line, with the deviation largest mid-run and nil at each end —
          which is how a hand actually strays between two fixed points — and
          endpoints nudged so corners do not meet cleanly.

          It used to be an `feDisplacementMap` over a turbulence field, and that
          was ~10fps. An SVG filter is re-evaluated whenever its source changes,
          and the source is 120 paths whose `stroke-dashoffset` changes every
          frame forever; the noise field is static, so every one of those frames
          was recomputing an identical deviation. Baking it costs nothing at
          runtime and looks the same, because it IS the same.

          The graphite grain is likewise a static CSS mask — see `GRAIN`. What
          is left on this element is geometry and two colours. */}

      <g>
        {/* ══ STRUCTURE — gold ══════════════════════════════════════════ */}
        <g className="text-gold">
          {/* The envelope, double-lined the way a wall is drawn in plan. */}
          <path pathLength={1} {...at("envelope")} d="M70.6 59.8L144 60.2L218.3 58.1L292 62.2L364.5 59.9L437.3 58.9M485.6 59L554.7 59.4L625 56.8L694.6 57L763.6 57.1L832.4 58.8L902.4 59.3M945.3 60.1L1018 60.8L1093.1 60L1166.2 62.6L1238.5 60.1L1311.8 60.4M1352.2 59.1L1426 58.1L1499.5 59.2" strokeOpacity={0.95} />
          <path pathLength={1} {...at("envelope", 1)} d="M1499 59.3L1499.4 117.3L1500.7 177.5L1498.8 236.8M1499.8 285.3L1501.6 364.7L1498.2 443.8L1499.9 523.5M1499.5 561.5L1498.5 639.3L1499 721.1" strokeOpacity={0.95} />
          <path pathLength={1} {...at("envelope", 2)} d="M1500.8 720.9L1426.2 721.2L1352.6 718.4L1277.3 719.7L1202.5 721.8L1128.9 720.3M1078.3 720.3L1005.4 720.5L931.9 719.6L860.7 718.6L787.5 719.8L715.2 720.3L642.8 721.1M586.2 719.1L520.1 718.5L453 718.3L387 718.4L321.4 720.2L254 718.3L188.6 719.3M148.3 721L109.6 719.7L70.9 721.8" strokeOpacity={0.9} />
          <path pathLength={1} {...at("envelope", 3)} d="M69.3 719.3L67 651.3L67.9 582.1L68.9 512.3M69.3 465.6L68.5 398L70.2 329.6L69.4 263.1M70.9 214.3L70 137.8L71.9 59.8" strokeOpacity={0.92} />
          <path
            pathLength={1}
            {...at("envelope", 4)}
            d="M93.1 82L164.4 81.6L235.7 83.5L306.7 83.8L378.3 81.7L448.8 81L520.7 82.7M577.5 81.2L669.9 82.3L762.6 80.4L853.3 78.6L946.2 82.1L1037.7 81.6L1130.8 81.3M1186 81.3L1259.7 82.3L1331.7 83L1405.5 82L1477 80.9M1477.7 118.2L1476.5 189.1L1479.6 260.9L1479.4 330.8L1478.4 402.2M1477.4 448.9L1476.2 511L1474.9 574.2L1477.3 635.1L1476.3 697.4M1436.9 698.3L1364.8 698.2L1292.9 696.8L1220.6 696.2L1148.5 698L1075.8 697.7L1004.1 698.3M958.8 698L885.5 697.5L813.5 699.8L740.3 695.5L665.6 697.2L593.8 698.1L519.8 698.2M474.4 697.4L397.8 698.2L320.5 696.5L243.9 699.7L168.3 698.2L92.1 696.4M92.8 660.9L93.9 596.7L94 531.7L92.4 465.7L92 400.3L92.5 336.5M91.5 290.9L93.3 222.1L92.4 152.1L91.2 81"
            strokeOpacity={0.45}
            strokeWidth={1.3}
          />
          {/* ── Searching lines ────────────────────────────────────────
              A pencil does not find an edge first time. These are ghosts of
              the envelope, offset by two or three units and pressed much
              lighter — the two or three attempts that were made before the
              line that was kept. Nothing else on the sheet says "drawn by
              hand" as directly. */}
          <path
            pathLength={1}
            {...at("envelope", 6)}
            d="M72.9 56.4L257.2 57.1L442.8 57.7L625.4 57.3L811 56.1L995.6 56.4L1180.6 57M1251.8 62.2L1332.9 61.8L1414.8 62.8L1495.6 62.2M1505.1 66.1L1503.8 139.1L1505 212.4L1505.7 283.7L1505.4 356.7L1504.3 430M1497.8 485.5L1498.9 561.5L1496.2 636.9L1498.1 713.1M1477.3 726.3L1332.7 726.4L1189.1 728.3L1045.6 725.8L900.2 726.8L756.2 726.3L612.3 726.2M555.8 715.2L475.2 715.5L395.2 716.6L316 713.3L236.9 714.5L156.5 714.3L76.1 714.7M65.1 705.8L65.2 638L64.7 569.7L67.2 502.6L66.8 435.7L64.3 367L65.9 300.8M72.4 244.9L74.5 185.8L72.7 123.6L73.3 63.5"
            strokeOpacity={0.3}
            strokeWidth={1.1}
          />
          <path
            pathLength={1}
            {...at("envelope", 7)}
            d="M366.2 91.1L364.3 161.5L366.3 229.5L367 300M374.3 356.9L376.2 437.7L372.9 515.2L374.5 594.9M1214.5 87.3L1213.2 146L1215.5 206.2L1214.6 263.3M1205.8 320.7L1204.8 388.2L1203.3 454.7L1207.2 523.2L1204.9 590.4"
            strokeOpacity={0.26}
            strokeWidth={1}
          />

          {/* Overshoots — the hand stops after the eye does. */}
          <path
            pathLength={1}
            {...at("envelope", 5)}
            d="M70.3 60.7L55.9 53.9L41.8 43.9M1499.7 60.4L1514 51.8L1528.2 44.9M70.1 720.1L58.8 728.2L45.9 737.1M1500.8 721L1513.6 730.2L1523.7 739.8"
            strokeOpacity={0.4}
            strokeWidth={1.3}
          />

          {/* ── The wings ──────────────────────────────────────────────
              Two ranges of rooms facing a deep court. The court is the void the
              statement sits in — see the note on ROOMS. */}
          <path pathLength={1} {...at("partitions")} d="M369.6 82.2L372.1 154.4L370.3 227.4M369.6 267.1L367.7 325.5L368.6 386.9L369.4 446.7M369.9 484.9L372.4 541.4L370.2 601" strokeOpacity={0.88} />
          <path pathLength={1} {...at("partitions", 1)} d="M1210.6 82.6L1210.3 137.4L1210 193.8M1211 243L1213.2 305L1209.8 368.3L1212 430.5M1209.2 469.6L1209.4 535.4L1208.1 600.3" strokeOpacity={0.88} />
          <path pathLength={1} {...at("partitions", 2)} d="M369.9 599L441.7 599.4L515.1 600.8L586.2 599.8M633.1 599L701.5 599.8L769 598L836.1 600L905 599.2M947.5 599.2L1013.3 597.7L1079.8 599.4L1143.6 600.5L1208.9 600.2" strokeOpacity={0.82} />
          {/* The court's head, left un-drawn between the wings: the house is
              open to the north. One of several things left unresolved. */}
          <path pathLength={1} {...at("partitions", 3)} d="M370.3 149.6L419.4 150.3L469.6 149.1M1110.8 149.3L1160.4 150.8L1210 150.1" strokeOpacity={0.5} strokeWidth={1.3} />

          {/* Wing partitions. */}
          <path pathLength={1} {...at("partitions", 4)} d="M92.2 300.3L164.7 301.3L236.2 299.2M279.1 299.9L325 302.1L369.3 300.4M92.3 468.9L143.9 466.7L198.1 467.8M232.7 471L270.6 468.5L310.5 471.5" strokeOpacity={0.75} />
          <path pathLength={1} {...at("partitions", 5)} d="M1209.5 299.6L1267 297.6L1326 298.9M1367 299.1L1423.4 296.9L1477 299.7M1209.7 469.7L1253.9 469.7L1300.2 468.8M1344.5 469L1411 467.6L1477.7 469.5" strokeOpacity={0.75} />
          {/* Bottom band: entry hall and stair. */}
          <path pathLength={1} {...at("partitions", 6)} d="M788.9 599.9L788.4 649.4L790 699.1" strokeOpacity={0.7} />

          {/* ── Openings ───────────────────────────────────────────────
              A door is a gap, a leaf and a quarter-arc swing. The arc is the
              single mark that makes all of this legible as a plan. */}
          {/* Entry, in the south wall. */}
          <path pathLength={1} {...at("openings")} d="M500.3 721.1L497.8 719.1L500.5 714.7M613.1 720.4L612.9 717.4L613.4 714.1" strokeOpacity={0.5} strokeWidth={1.3} />
          <path pathLength={1} {...at("openings", 1)} d="M499.7 720.3L498.6 665.5L500.7 607.8" strokeOpacity={0.7} />
          <path pathLength={1} {...at("openings", 2)} d="M499.6 608.3a112 112 0 0 1 112 112" strokeOpacity={0.42} strokeWidth={1.3} />
          {/* Living, off the court. */}
          <path pathLength={1} {...at("openings", 3)} d="M370.7 189.2L368.6 233.5L370.6 275.8" strokeOpacity={0.3} strokeWidth={1.3} />
          <path pathLength={1} {...at("openings", 4)} d="M369.7 191L326.3 191L283.3 191.8" strokeOpacity={0.7} />
          <path pathLength={1} {...at("openings", 5)} d="M284.3 190.5a86 86 0 0 0 86 86" strokeOpacity={0.42} strokeWidth={1.3} />
          {/* Bedroom 01, off the court. */}
          <path pathLength={1} {...at("openings", 6)} d="M1210.3 190.7L1208.3 234.2L1209.4 276.1" strokeOpacity={0.3} strokeWidth={1.3} />
          <path pathLength={1} {...at("openings", 7)} d="M1210 189.3L1253.6 189L1296 190" strokeOpacity={0.7} />
          <path pathLength={1} {...at("openings", 8)} d="M1295.1 189a86 86 0 0 1 -86 86" strokeOpacity={0.42} strokeWidth={1.3} />

          {/* Windows — a break in the double line with a pane drawn between. */}
          <path
            pathLength={1}
            {...at("openings", 9)}
            d="M149.8 60.8L147.4 73L149.8 83.3M280.4 59.9L278.4 71.2L281.3 82M1289.6 59.2L1290.5 69.1L1289.7 81.9M1420.6 59.3L1422.4 69.7L1419.9 80.8"
            strokeOpacity={0.45}
            strokeWidth={1.3}
          />
          <path pathLength={1} {...at("openings", 10)} d="M149.4 71.2L214.5 72.9L278.6 72.1M1290.1 71.4L1354.2 69.1L1419.2 70.4" strokeOpacity={0.3} strokeWidth={1} />
          <path pathLength={1} {...at("openings", 11)} d="M69.5 339.7L80.4 341.4L91.9 339.6M70.1 520.8L80.8 521.1L91.3 519.8M1477.4 340L1487.8 337.9L1498.4 339.1M1478.5 519.9L1490.7 517.9L1501.5 519.6" strokeOpacity={0.45} strokeWidth={1.3} />
          <path pathLength={1} {...at("openings", 12)} d="M79.9 340L81.8 400.6L81.5 459.9L80.7 518.9M1488 339.7L1485.9 400.6L1488.1 460.5L1487 520.8" strokeOpacity={0.3} strokeWidth={1} />

          {/* ── Fittings ───────────────────────────────────────────────
              An island, a stair and sanitaryware: the three things that place
              a room without needing its label. */}
          <path pathLength={1} {...at("fittings")} d="M145.7 355.2L229.5 356.6L315.5 354.7L313.3 388.1L315.3 420.5L230.5 420L145.2 422Z" strokeOpacity={0.4} strokeWidth={1.3} />
          {/* Stair: treads, going line, up-arrow. */}
          <path
            pathLength={1}
            {...at("fittings", 1)}
            d="M830.3 620.9L899.6 622.3L970.7 622M1009.9 622.1L1088.9 621.6L1169.1 623M829 651L897 650.5L964.9 650.6L1033.3 652.6L1100.3 651.3L1170 650M829.5 679L877.6 681L926.2 679.6M962.2 677.3L1032 677.2L1101.7 677.4L1170.1 677.9"
            strokeOpacity={0.4}
            strokeWidth={1.3}
          />
          <path pathLength={1} {...at("fittings", 2)} d="M999.2 691.8L1000.3 652.8L1000.1 612" strokeOpacity={0.6} strokeWidth={1.3} />
          <path pathLength={1} {...at("fittings", 3)} d="M999.9 611.1L994.8 618.1L988.1 627.7M999.6 613L1003.1 622.1L1009.5 628.2" strokeOpacity={0.6} strokeWidth={1.3} />
          {/* Bath: a tub and a basin. */}
          <path pathLength={1} {...at("fittings", 4)} d="M1251.9 512.2L1331.2 509.8L1411.7 512.2L1411.5 543.4L1412.9 571.7L1332.5 572.1L1251.4 573.2Z" strokeOpacity={0.4} strokeWidth={1.3} />
          <path pathLength={1} {...at("fittings", 5)} d="M1252.3 512.2a80 30 0 0 0 160 0" strokeOpacity={0.28} strokeWidth={1} />
          <path pathLength={1} {...at("fittings", 6)} d="M1414.6 660a24 20 0 1 0 48 0a24 20 0 1 0 -48 0" strokeOpacity={0.32} strokeWidth={1} />
        </g>

        {/* ══ ANNOTATION — emerald ══════════════════════════════════════ */}
        <g className="text-emerald">
          {/* Floor hatch in the bath — and it runs out halfway, on purpose. */}
          <path
            pathLength={1}
            {...at("annotation")}
            d="M1225.8 698.5L1255.9 669.8L1286.6 637.7M1261.4 697.9L1291.5 669.8L1321.3 637.9M1298.4 699.1L1327.5 668.7L1358.2 638.7M1334 697.7L1362.9 668L1393.7 637.9"
            strokeOpacity={0.22}
            strokeWidth={1}
          />

          {/* Dimension strings, outside the envelope. */}
          <path pathLength={1} {...at("annotation", 1)} d="M69.7 754.9L155.8 756.1L242 757.1L330 756.2L417 752.8L503.5 754.2L589.6 755.1M565.2 753L636.9 752.6L708.8 753.8L779.2 752.7L850.9 752.3L923.8 752.8L995.3 752.7M1040.6 753L1117.8 752.9L1192.7 750.9L1269.6 753.1L1346 754.4L1424.4 753.3L1501 753" strokeOpacity={0.4} strokeWidth={1.2} />
          {/* Three ticks for four stations — the string is left un-closed. */}
          <path
            pathLength={1}
            {...at("annotation", 2)}
            d="M63.3 746.5L70.7 751.3L77.4 760.7M363.8 746.4L371.5 752.5L377.4 760.6M1204.1 747.6L1211.9 753L1218.8 760.8"
            strokeOpacity={0.42}
            strokeWidth={1.2}
          />
          <path pathLength={1} {...at("annotation", 3)} d="M33.9 59.9L32.4 127L36.4 193.1L33.4 261.7L33.1 328.7M33.7 372.2L34.1 433.3L34.2 493.5L33 553.9M33 596.7L33.9 658.7L32.2 720.8" strokeOpacity={0.4} strokeWidth={1.2} />
          <path
            pathLength={1}
            {...at("annotation", 4)}
            d="M27.6 52.7L35 59L41.7 67.5M27.1 293.5L34.1 298.9L41.9 308.2M27.8 463L33.9 469.6L42.7 476.3M27.4 712.9L35 717.8L40.4 727.5"
            strokeOpacity={0.42}
            strokeWidth={1.2}
          />

          {/* Grid bubbles, hanging off the top of the sheet. */}
          {[70, 370, 1210, 1500].map((x, i) => (
            <circle
              key={x}
              pathLength={1}
              {...at("annotation", 5 + i)}
              cx={x}
              cy={22}
              r={18}
              strokeOpacity={0.45}
              strokeWidth={1.2}
            />
          ))}
          <path
            pathLength={1}
            {...at("annotation", 9)}
            d="M68.9 39.3L68 49.8L68.3 60.2M370.7 39.2L369.7 94.9L370.1 150.3M1209.3 40.5L1208.3 96.4L1208.8 151.4M1499.6 39.9L1501.2 49.1L1500.3 59.8"
            strokeOpacity={0.2}
            strokeWidth={1}
          />

          {/* Construction lines, running off the sheet and never resolved. */}
          <path
            pathLength={1}
            {...at("annotation", 10)}
            d="M369.8 599.5L325.2 643.8L282.4 689L240.4 732.5L196.7 775.2M1209.6 600.1L1255.3 642.9L1298.7 687.3L1344.3 733.2L1390.6 776"
            strokeOpacity={0.16}
            strokeWidth={1}
          />

          {/* North point. */}
          <circle pathLength={1} {...at("annotation", 11)} cx={1552} cy={676} r={26} strokeOpacity={0.4} strokeWidth={1.2} />
          <path pathLength={1} {...at("annotation", 12)} d="M1552.1 650.9L1554.7 678L1551.6 702.3M1524.9 676L1552 675.8L1577.5 676.6" strokeOpacity={0.25} strokeWidth={1} />
          <path pathLength={1} {...at("annotation", 13)} d="M1551.6 642.8L1547.2 653L1542.1 663.6L1552 663.9L1561.8 663.7Z" strokeOpacity={0.55} strokeWidth={1.2} />
        </g>

        {/* ══ WRITING — emerald, faded in after its walls ═══════════════
            Glyph outlines cannot be "drawn" with a dash offset; it reads as a
            rendering fault rather than as writing. These fade instead. */}
        <g
          className="text-emerald"
          style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
          fill="currentColor"
          stroke="none"
        >
          {ROOMS.map((r, i) => (
            <text
              key={r.label}
              data-label=""
              {...at("labels", i)}
              x={r.x}
              y={r.y}
              textAnchor="middle"
              fontSize={19}
              letterSpacing={3.6}
              fillOpacity={0.5}
            >
              {r.label}
            </text>
          ))}

          {[
            { x: 220, v: "4200" },
            { x: 790, v: "11800" },
            { x: 1355, v: "4200" },
          ].map((d) => (
            <text
              key={d.v + d.x}
              data-label=""
              {...at("labels", 8)}
              x={d.x}
              y={746}
              textAnchor="middle"
              fontSize={17}
              letterSpacing={2.4}
              fillOpacity={0.42}
            >
              {d.v}
            </text>
          ))}

          {[
            { x: 70, v: "A" },
            { x: 370, v: "B" },
            { x: 1210, v: "C" },
            { x: 1500, v: "D" },
          ].map((g) => (
            <text
              key={g.v}
              data-label=""
              {...at("labels", 9)}
              x={g.x}
              y={29}
              textAnchor="middle"
              fontSize={18}
              fillOpacity={0.4}
            >
              {g.v}
            </text>
          ))}

          {/* The sheet's own title block, the way a drawing is signed. */}
          <text
            data-label=""
            {...at("labels", 10)}
            x={70}
            y={778}
            fontSize={16}
            letterSpacing={4}
            fillOpacity={0.3}
          >
            GROUND FLOOR PLAN · 1:100 · WORKING DRAFT
          </text>
        </g>
      </g>
    </svg>
  );
}

export default function Blueprint({ className }: { className?: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const lampRef = useRef<HTMLDivElement>(null);

  /**
   * ── The scroll draws the house ──────────────────────────────────────
   *
   * One scrubbed trigger over the chapter, writing `stroke-dashoffset` to every
   * stroke and `opacity` to every label from a single progress value.
   *
   * Direct style writes rather than 120 GSAP tweens: they are the same
   * arithmetic, and one pass over a cached array is both cheaper and easier to
   * reason about than a timeline with 120 children. There is no filter on this
   * SVG any more, so a dash-offset change is an ordinary vector repaint.
   *
   * Each element's own schedule comes off its `data-g` / `data-i` attributes,
   * read ONCE here. Reading them per frame would be a `getAttribute` per path
   * per frame for values that never change.
   */
  useIsomorphicLayoutEffect(() => {
    const stage = stageRef.current;
    const sheet = sheetRef.current;
    if (!stage || !sheet) return;

    type Item = { el: SVGElement; from: number; to: number; isLabel: boolean };

    const items: Item[] = [];
    const maxI: Record<string, number> = {};

    sheet.querySelectorAll<SVGElement>("[data-g]").forEach((el) => {
      const g = el.dataset.g as GroupName;
      const i = Number(el.dataset.i ?? 0);
      maxI[g] = Math.max(maxI[g] ?? 0, i);
    });

    sheet.querySelectorAll<SVGElement>("[data-g]").forEach((el) => {
      const g = el.dataset.g as GroupName;
      const spec = GROUPS[g];
      if (!spec) return;
      const i = Number(el.dataset.i ?? 0);
      const n = Math.max(1, maxI[g] ?? 1);
      // Within a group, elements start in order and each takes the same share
      // of what is left. The last one starts at 60% of the group's span, so
      // there is always overlap rather than a queue.
      const lead = spec.at + (i / n) * spec.span * 0.6;
      items.push({
        el,
        from: lead,
        to: lead + spec.span * 0.4,
        isLabel: el.tagName === "text",
      });
    });

    const apply = (p: number) => {
      for (const it of items) {
        const t = Math.min(1, Math.max(0, (p - it.from) / (it.to - it.from)));
        if (it.isLabel) {
          it.el.style.opacity = String(t);
        } else {
          it.el.style.strokeDashoffset = String(1 - t);
        }
      }
    };

    apply(0);

    /**
     * ── Reduced motion gets the finished drawing, and no trigger ────────
     *
     * It has to bail BEFORE the ScrollTrigger is created, not merely call
     * `apply(1)` afterwards: ScrollTrigger refreshes itself on creation and on
     * load, and its `onRefresh` calls `apply(self.progress)` — which is 0 at the
     * top of the page. So a late `apply(1)` was immediately overwritten and the
     * sheet stayed blank for exactly the readers who cannot see it drawn.
     */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply(1);
      return;
    }

    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const st = ScrollTrigger.create({
        trigger: stage,
        // From the chapter arriving to it being comfortably centred. Both ends
        // matter: `bottom top` would spend the back half of the travel on a
        // house finished long before, and anything later than this finishes the
        // drawing as the section leaves — so the reader spends the whole time
        // they are actually reading the statement looking at a half-built plan.
        start: "top 90%",
        end: "center 38%",
        scrub: 0.6,
        onUpdate: (self) => apply(self.progress),
        onRefresh: (self) => apply(self.progress),
      });
      return () => st.kill();
    });

    return () => mm.revert();
  }, []);

  /**
   * ── The lamp, and the drawing board ───────────────────────────────────
   *
   *   · the LAMP is a soft circle following the cursor. Inside it sits a second
   *     copy of the plan, FINISHED and at full strength — so wherever you look,
   *     the pencil has already been. It is the reward for stopping.
   *   · the BOARD shifts a few pixels against the pointer, the way a sheet
   *     slides under a hand. Small enough to be felt rather than seen.
   *
   * The listener is on `window`, not on this element: the whole component is
   * `pointer-events-none` so it can never intercept a click meant for the page,
   * and adding hit-testing back for a decorative layer would be a real cost.
   * Coordinates are converted against the stage's own rect instead.
   *
   * Written as custom properties straight to the DOM — React never sees a
   * pointer event, because a `setState` per move would re-render 120 paths at
   * input rate. Fine pointers only: on touch, `pointermove` fires once per tap
   * and would strand the lamp wherever the last tap landed.
   */
  useEffect(() => {
    const stage = stageRef.current;
    const lamp = lampRef.current;
    const sheet = sheetRef.current;
    if (!stage || !lamp || !sheet) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let frame = 0;
    let px = 0;
    let py = 0;
    let inView = false;

    const paint = () => {
      frame = 0;
      const r = stage.getBoundingClientRect();
      const x = px - r.left;
      const y = py - r.top;
      lamp.style.setProperty("--bp-x", `${x}px`);
      lamp.style.setProperty("--bp-y", `${y}px`);
      sheet.style.transform = `translate3d(${(0.5 - x / r.width) * 18}px, ${
        (0.5 - y / r.height) * 10
      }px, 0)`;
    };

    const onMove = (e: PointerEvent) => {
      if (!inView) return;
      px = e.clientX;
      py = e.clientY;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const io = new IntersectionObserver((entries) => {
      inView = entries.some((en) => en.isIntersecting);
      if (!inView) {
        // Park it, so a lamp is not left burning in a chapter nobody is in.
        lamp.style.setProperty("--bp-x", "-999px");
        lamp.style.setProperty("--bp-y", "-999px");
      }
    });
    io.observe(stage);
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      io.disconnect();
    };
  }, []);

  return (
    <div
      ref={stageRef}
      aria-hidden
      className={cn(
        // The whole chapter, not just the block behind the statement.
        // Hidden below `lg`: at phone width the statement fills the column and
        // a plan behind it is not a backdrop, it is interference.
        "pointer-events-none absolute inset-0 z-0 hidden select-none overflow-hidden lg:block",
        className
      )}
      style={{
        // Dissolves the sheet before it reaches the chapter's edges, so it
        // fades into the paper rather than being cut off by a hard line.
        WebkitMaskImage:
          "radial-gradient(102% 98% at 50% 50%, #000 76%, transparent 100%)",
        maskImage:
          "radial-gradient(102% 98% at 50% 50%, #000 76%, transparent 100%)",
      }}
    >
      {/* ── The type's clearance, and nothing else ──────────────────────
          One mask, not three.

          There were three stacked: this ellipse, a horizontal ramp weighting
          the sheet to the sides, and the grain. Multiplied together with the
          layer opacity they took the drawing to somewhere around 15% in the
          middle and 40% at the edges, which is why it stopped reading as a
          house at all. The ramp is gone — the plan is drawn around a court, so
          it is ALREADY weighted to the sides by its own geometry, and dimming
          the middle a second time was solving a problem the plan had already
          solved. */}
      <div
        className="absolute inset-0"
        style={{
          WebkitMaskImage:
            "radial-gradient(33% 27% at 50% 45%, transparent 40%, #000 100%)",
          maskImage:
            "radial-gradient(33% 27% at 50% 45%, transparent 40%, #000 100%)",
        }}
      >
        {/* The sheet, drawn by the scroll. */}
        {/* `bp-sheet` is what hides the strokes at rest (see globals.css), so
            nothing flashes complete before the scrub's first pass. The lamp
            copy below deliberately does NOT carry it: that one is the finished
            drawing. */}
        <div
          ref={sheetRef}
          className="bp-sheet absolute inset-0 will-change-transform"
          style={{ opacity: 0.9 }}
        >
          <div
            className="absolute inset-0"
            style={{
              WebkitMaskImage: GRAIN,
              maskImage: GRAIN,
              WebkitMaskSize: "220px 220px",
              maskSize: "220px 220px",
            }}
          >
            <PlanArt />
          </div>
        </div>

        {/* ── What the lamp reveals ──────────────────────────────────
            The same plan, finished and still, masked to a soft circle at the
            pointer. Deliberately not scrubbed: it is what the sheet looks like
            when it is done, so the cursor reads as the place the pencil has
            already been.

            Parked off-canvas by default, so a touch device — which never fires
            `pointermove` — never sees it. */}
        <div
          ref={lampRef}
          className="absolute inset-0"
          style={
            {
              opacity: 0.95,
              "--bp-x": "-999px",
              "--bp-y": "-999px",
              WebkitMaskImage:
                "radial-gradient(300px circle at var(--bp-x) var(--bp-y), #000 0%, #000 26%, transparent 78%)",
              maskImage:
                "radial-gradient(300px circle at var(--bp-x) var(--bp-y), #000 0%, #000 26%, transparent 78%)",
            } as React.CSSProperties
          }
        >
          <PlanArt />
        </div>
      </div>
    </div>
  );
}
