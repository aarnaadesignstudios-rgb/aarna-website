/**
 * SheetTexture — what a chapter's empty ground carries.
 *
 * A pair of gold vines (<Ornament />), in opposite corners, and nothing else.
 *
 * ── What it used to be ────────────────────────────────────────────────────
 *
 * A drawing grid at 88px plus two drifting radial blooms. Both are gone, and
 * for the same reason:
 *
 *   · the GRID was a filler. It is what you reach for when a space needs
 *     something and you have not decided what — it belongs to the wireframe the
 *     design came out of, not to the brand it is for.
 *   · the BLOOMS were green gradients, and the studio's note was that the green
 *     gradients across this site read as smears rather than as brand colour.
 *     They were also solving a problem that no longer exists: they gave a
 *     graded ground somewhere to resolve to, and every ground is flat now.
 *
 * What is left is one motif, drawn in the same gold single line as the phoenix
 * mark, used identically in every chapter. That is the difference between an
 * ornament and a garnish: it is the same thing every time, so it reads as the
 * brand's hand rather than as decoration applied per section.
 *
 * ── Stacking ─────────────────────────────────────────────────────────────
 *
 * This is `absolute`, so it paints above any STATIC sibling that follows it —
 * positioned elements always paint above non-positioned ones regardless of DOM
 * order. Every caller therefore needs its content in a positioned wrapper. That
 * is why it is a component and not a `::before` on each section: the
 * requirement is explicit, and it fails loudly in review rather than quietly at
 * a breakpoint nobody screenshotted.
 */
import Ornament from "./Ornament";
import { cn } from "@/utils/cn";

interface SheetTextureProps {
  /**
   * Which ground it is drawn on. `dark` switches the vine to champagne — the
   * logo gold is a hairline colour and at 1px on deep emerald it disappears.
   */
  tone?: "light" | "dark";
  /**
   * `corners` puts one vine low-left and one high-right. `top` moves both into
   * the upper half, for chapters whose lower half is already full (the pinned
   * tracks, where the ring and the service cards own the floor).
   */
  placement?: "corners" | "top";
  className?: string;
}

export default function SheetTexture({
  tone = "light",
  placement = "corners",
  className,
}: SheetTextureProps) {
  const ink = tone === "dark" ? "soft" : "gold";

  return (
    <div
      aria-hidden
      className={cn(
        // ── Desktop only ─────────────────────────────────────────────
        // The vine is a MARGINAL flourish: it works because it hangs off the
        // page edge into a gutter. A phone has no gutter — measured at 390px,
        // the large one covers most of the text column and runs straight
        // through the standfirst. Same rule <Spine /> follows, and for the
        // same reason.
        "pointer-events-none absolute inset-0 z-0 hidden overflow-hidden lg:block",
        className
      )}
    >
      {placement === "top" ? (
        <>
          <Ornament placement="top-left" tone={ink} size="sm" />
          <Ornament placement="top-right" tone={ink} size="md" />
        </>
      ) : (
        <>
          {/* The larger one grows out of the corner the eye lands in last. */}
          <Ornament placement="bottom-left" tone={ink} size="lg" />
          <Ornament placement="top-right" tone={ink} size="md" />
        </>
      )}
    </div>
  );
}
