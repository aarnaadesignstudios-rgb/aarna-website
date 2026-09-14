"use client";

/**
 * SectionHeading — the one heading block every section on the site uses.
 *
 * This is the page's strongest brand device, so it is deliberately specific
 * rather than generic. It is modelled on an architectural drawing sheet:
 *
 *     ──── 03 — Selected Works .................... 01 / 06
 *     A large serif title, set in brand emerald
 *     An optional lead paragraph.
 *
 *   • a gold hairline opens every section
 *   • the section INDEX is set in gold — the numbers run 01…08 down the page,
 *     so the site reads as one curated document rather than a stack of
 *     unrelated blocks
 *   • the eyebrow is uppercase small-caps in the SERIF. It used to be set in
 *     JetBrains Mono as a "spec-sheet" cue; the client's review asked for that
 *     font to be changed and for the serif to be used everywhere, so the label
 *     row and the title it introduces are now one voice. Cormorant has a low
 *     x-height, so these labels are set at 12px rather than the 10px a mono
 *     could carry — below that the strokes break up.
 *   • `meta` is the sheet's title block — the right-aligned slot for a counter,
 *     a hint, a place name
 *   • the title is EMERALD on light surfaces. This is the single biggest reason
 *     the page reads as Aarnaa rather than as a template: the brand's primary
 *     colour carries the typography instead of sitting unused in the palette.
 *
 * The title reveals word by word (TextReveal); eyebrow and lead ease in. Callers
 * do not need to wrap this in <Reveal>.
 *
 * The title is a plain string; use "\n" for deliberate line breaks.
 */
import type { ReactNode } from "react";
import { motion, type Variants } from "framer-motion";

import { EASE_EDITORIAL, fadeUp, VIEWPORT_ONCE } from "@/animations/variants";
import { cn } from "@/utils/cn";
import TextReveal from "./TextReveal";

interface SectionHeadingProps {
  eyebrow?: string;
  /**
   * Omit for a label-only header. The pinned Works gallery needs just the
   * index/eyebrow/counter row — a display title would eat its 100vh budget.
   */
  title?: string;
  description?: ReactNode;
  /** Right-aligned slot — the drawing sheet's title block. */
  meta?: ReactNode;
  className?: string;
  align?: "left" | "center";
  /** Surface this sits on. Drives the ink colour. */
  tone?: "light" | "dark";
  /**
   * Override the title's ink.
   *
   * Exists for the Contact heading, which the client marked to be set in gold.
   * It is deliberately an opt-in on one caller rather than a new `tone`:
   * `cn()` is a plain joiner with no conflict resolution, so a colour passed
   * here and the tone's own colour would BOTH land on the element and CSS
   * source order would pick the winner. So the tone's colour is only applied
   * when this is absent.
   *
   * Exists for the Contact heading, which the client marked to be set in gold.
   * It is deliberately an opt-in on one caller rather than a new `tone`.
   *
   * Only use it on a dark surface. Gold display type on paper is 2.18:1 —
   * illegible as a title, and the reason gold is not the default title ink.
   */
  titleClassName?: string;
  /**
   * The title's heading level.
   *
   * `h2` by default, because this is built for SECTIONS of a page that already
   * has an h1 above them — which is every caller but one. /vastu is the
   * exception: it opens directly on the person it is about, so her name is the
   * page's only heading and has to be its h1 or the page has none at all.
   *
   * Deliberately narrow. A free `as` would invite h3s and h4s and let the
   * document outline be decided per call site; the two values here are "this
   * page's subject" and "a section of it", which is the whole distinction.
   */
  titleAs?: "h1" | "h2";
  /**
   * Override the eyebrow's ink.
   *
   * Same contract as `titleClassName` above, and for the same reason: `cn()` is
   * a plain joiner with no conflict resolution, so a colour passed here and the
   * tone's own colour would BOTH land on the element and CSS source order would
   * decide the winner. The tone's colour is applied only when this is absent.
   *
   * Exists for <Practice />, which the studio asked to set in the logo gold to
   * match the flipping word beneath it. Note what that costs on a light ground:
   * the tone's default here is `gold-ink` (29% lightness, 5.04:1 on paper)
   * precisely because plain `gold` measures 2.19:1 — and an eyebrow is 13–16px
   * at 0.3em tracking, which is the least forgiving type on the page for it.
   * Reach for this knowingly.
   */
  eyebrowClassName?: string;
}

/**
 * How a chapter announces itself.
 *
 * The rule draws along its length, then the number and the name rise out of
 * their own edges. Three parts, about 0.6s end to end, once.
 *
 * A MASKED RISE rather than a fade, because it is the gesture the rest of the
 * site already uses for type arriving — the hero's project caption, the Works
 * title, the statement in chapter 01. A fade would have been less work and
 * would have made the chapter mark the one piece of type on the page that
 * behaves differently from every other.
 *
 * Once, via VIEWPORT_ONCE. A heading that re-animates every time it is scrolled
 * back past stops reading as an arrival and starts reading as a loop.
 */
const chapterMark: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

/** Drawn, not faded. The origin is set per side at the call site. */
const chapterRule: Variants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.7, ease: EASE_EDITORIAL },
  },
};

/**
 * The rise. 105%, not 100%: a descender sits below the baseline, so a glyph
 * translated exactly its own height still shows its tail above the mask edge.
 */
const chapterItem: Variants = {
  hidden: { y: "105%" },
  visible: {
    y: "0%",
    transition: { duration: 0.62, ease: EASE_EDITORIAL },
  },
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  meta,
  className,
  align = "left",
  tone = "light",
  titleClassName,
  titleAs = "h2",
  eyebrowClassName,
}: SectionHeadingProps) {
  const dark = tone === "dark";

  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {(eyebrow || meta) && (
        <motion.div
          className={cn(
            "flex flex-wrap items-end gap-x-6 gap-y-3",
            meta ? "justify-between" : "",
            align === "center" && "justify-center"
          )}
          variants={chapterMark}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
        >
          <span className="flex items-center gap-4 sm:gap-5">
            {/* The hairline that opens every chapter, and REACHES.

                It used to be a 40px stub sitting inside the container's left
                gutter. At `lg` it runs from the page edge instead: `-ml-16`
                cancels the container's `lg:px-16`, and the width is that 64px
                plus the original 40.

                That is not a flourish. <Spine /> draws the story's thread at
                x=28px and this rule crosses it, so every chapter's heading is
                physically joined to the thread running down the page.

                Only from `lg`, because that is where the spine exists; below it
                the rule stays the stub it was, since a hairline running off the
                edge of a phone screen just looks like a clipped element.

                It draws along its length rather than fading, which is why it
                carries its own origin — see `chapterRule`. */}
            <motion.span
              variants={chapterRule}
              className={cn(
                "block h-px w-10 shrink-0 origin-left bg-gold",
                align === "left" && "lg:-ml-16 lg:w-[6.5rem]"
              )}
            />

            {/* ── The chapter mark, and it is only the name now ─────────────

                The numeral that used to sit here is gone at the studio's
                request. That removed the thing which was doing the work of
                being visible from across the page, so the name has to do it
                alone — and the obvious move, setting the words bigger, is
                exactly the one that fails: two lines of large type stacked on
                top of each other read as two headings arguing, which is the
                problem the numeral was introduced to avoid in the first place.

                So the presence is bought in WIDTH and INK instead of height:

                  · 0.3em of tracking. "SELECTED WORKS" at 1rem tracked this
                    far occupies as much of the line as it would at 2rem set
                    solid, so it holds the top of the section — but it never
                    competes for the eye with the title below, because nothing
                    about it is TALL. Width reads as deliberate; height reads
                    as loud.

                  · Gold. This is the larger half of it. Gold is the site's
                    chapter ink — the rule to its left, the spine's thread, the
                    vines — so setting the name in it makes the mark and the
                    rule one continuous gesture rather than a label sitting
                    next to a line. It also permanently separates the chapter
                    mark from body copy, which is charcoal everywhere.

                  · ~1rem against a 3.75rem title: a ratio near 4:1, which is
                    subordinate by any measure.

                `gold-ink` on light, NOT `gold`. Raw `--color-gold` is ~2:1 on
                paper — the palette's own note calls it unreadable as type on a
                light ground and reserves it for rules and glows, which is
                precisely what the hairline beside this is. `--color-gold-ink`
                is the same hue held at 29% lightness for 4.8:1. On the emerald
                bands the plain gold is the legible one, so the tone picks. */}
            {eyebrow && (
              <span className="block overflow-hidden pb-[0.16em]">
                <motion.span
                  variants={chapterItem}
                  className={cn(
                    "font-label block text-[0.82rem] leading-none tracking-[0.3em] md:text-[0.95rem] lg:text-[1rem]",
                    eyebrowClassName ?? (dark ? "text-gold" : "text-gold-ink")
                  )}
                >
                  {eyebrow}
                </motion.span>
              </span>
            )}

            {/* Mirrored rule, centred headings only. The single left-hand rule
                is what makes the label read as the START of a line, which is
                right when the heading is ranged left and wrong when it is
                centred — there it just makes a symmetrical block look as
                though it has slipped. */}
            {align === "center" && (
              <motion.span
                aria-hidden
                variants={chapterRule}
                className="block h-px w-10 shrink-0 origin-right bg-gold"
              />
            )}
          </span>

          {meta && (
            <motion.span
              variants={chapterItem}
              /* ── Quiet, not faint ─────────────────────────────────────────
                 These were `cream/50` and `charcoal/45`, which measure 3.84:1
                 and 2.80:1 on the two grounds this slot ever sits on — both
                 under 4.5:1, at 12px, which is the least forgiving type on the
                 page. The alphas read as "make it recede" rather than as a
                 chosen value, and nothing else in the system is set at them.

                 60% and 65% measure 4.84:1 and 5.12:1. The slot still reads as
                 the quietest thing in the header — it is 12px uppercase in a
                 corner — it is simply legible now, which matters more since the
                 counter went responsive: below `lg` this label is the ONLY
                 indication of how many projects or disciplines there are (see
                 the notes in <SelectedWorks /> and <Services />), where on
                 desktop it was a supplement to the ring's own index row. */
              className={cn(
                "font-label",
                dark ? "text-cream/60" : "text-charcoal/65"
              )}
            >
              {meta}
            </motion.span>
          )}
        </motion.div>
      )}

      {title && (
        <TextReveal
          as={titleAs}
          text={title}
          className={cn(
            // No weight: every heading on the site is 400, set once in the base
            // layer. See the type-system note in styles/globals.css.
            "font-serif text-4xl leading-[1.2] tracking-tight md:text-5xl lg:text-6xl",
            /* ── The ink follows the ground, and it matches <Practice /> ──
               Brand green over paper — the same emerald as <Practice />'s
               statement, which is the heading these were asked to agree with —
               and cream over the emerald bands.

               Cream rather than emerald on the dark side is not a choice: the
               bands ARE `--color-emerald`, so an emerald title on one is the
               same colour as the ground it is printed on. "How we work" and the
               project pages' titles are the ones that would disappear.

               These were briefly all `text-gold`, to match the masthead
               wordmark. It is worth recording why that was reverted rather than
               tuned, because the numbers are the whole argument: gold measures
               5.17:1 on emerald and 2.18:1 on paper, and seven of these titles
               are on paper. Display type is the most forgiving place on a page
               to spend contrast and 2.18:1 is still under the 3:1 that large
               text is held to — they read as a brass wash rather than as ink.

               The gold has not gone anywhere; it is on the eyebrow above each
               of these, on the flipping word, on the numerals and on the
               wordmark. Titles are the one place it was too thin to hold.

               `titleClassName` still wins where a caller sets it — <Contact />
               passes gold there, which the client marked specifically. */
            titleClassName ?? (dark ? "text-cream" : "text-emerald")
          )}
        />
      )}

      {description && (
        <motion.p
          className={cn(
            // Size and leading come from the one body-copy rule in
            // styles/globals.css — this used to step up to 18px at `md`, which
            // made the same lead paragraph a different size on every section
            // depending on which breakpoint you happened to be at.
            "max-w-xl",
            dark ? "text-cream/70" : "text-charcoal/70"
          )}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          transition={{ delay: 0.15 }}
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}
