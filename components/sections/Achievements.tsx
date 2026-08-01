"use client";

/**
 * Achievements — the studio's credibility figures, read at a glance.
 *
 * This sits immediately under the hero, so it is deliberately a *band* and not
 * a section: no numbered <SectionHeading>, no display title, no imagery. The
 * page's 01…10 sheet numbering belongs to the narrative sections, and this
 * should not interrupt the handoff from the hero into <Practice />.
 *
 * Design notes — why this is a dark plinth of hairline-divided columns rather
 * than a row of cards:
 *
 *  • Cards would be the one bordered-box pattern on an otherwise ruled,
 *    editorial page. Luxury print sets figures in columns divided by hairlines,
 *    with no container around them, so that is what this does — the gold rules
 *    are the only structure.
 *  • It reuses the site's established dark-section treatment (surface-emerald +
 *    border-y border-gold/15, as in <Founder /> and <FeaturedProjects />), so
 *    the hero's dark imagery hands off into emerald and only then steps up into
 *    the stone of <Practice />. The band reads as a plinth under the hero.
 *  • The figures are set in Bodoni Moda (--font-display). Its couture-grade
 *    thin/thick contrast is what makes a bare numeral look expensive; the font
 *    was already loaded for the old hero statement and is otherwise unused now
 *    that the statement lives in <Practice />.
 *  • Suffixes ("+", "%", "M+") are set in gold, which is the only place the
 *    accent colour appears in the band — once per column, carried by a glyph
 *    rather than by a fill or a border.
 *
 * Figures count up once on scroll (<Counter />) — the only motion here.
 *
 * The band's top padding is deeper than its bottom on purpose: opening directly
 * under a full-viewport hero means there is a moment mid-scroll where its first
 * ~100px sit behind the floating navbar, and the figures should not be the thing
 * caught under the pill.
 */
import { Counter, PageContainer } from "@/components/ui";
import { STATS } from "@/constants";
import { useReveal } from "@/hooks";
import { cn } from "@/utils/cn";

export default function Achievements() {
  const gridRef = useReveal<HTMLUListElement>({ stagger: 0.08, y: 20 });

  return (
    <section
      id="achievements"
      aria-label="The studio in numbers"
      className="surface-emerald border-y border-gold/15 pt-16 pb-14 text-cream md:pt-24 md:pb-16"
    >
      <PageContainer>
        {/* Five columns, separated only by gold hairlines.

            There is deliberately no eyebrow or title above them. The band opens
            directly under a full-viewport hero, so anything in its first ~110px
            sits behind the floating navbar as the hero scrolls away — and the
            figures are self-evident enough not to need announcing.

            The rules are placed per index rather than with a `divide-*` utility
            because the grid rewraps: at 2-up they must run between the pairs and
            across the rows, at 5-up only between the columns. The fifth figure
            widens to close the bottom row while stacked. */}
        <ul
          ref={gridRef}
          className="grid list-none grid-cols-2 p-0 md:grid-cols-5"
        >
          {STATS.map((stat, i) => (
            <li
              key={stat.id}
              data-reveal
              className={cn(
                "flex flex-col items-center px-3 py-7 text-center border-gold/15 md:px-4 md:py-1",
                // 2-up: vertical rule between the pair, horizontal between rows.
                i % 2 === 1 && "border-l",
                i >= 2 && "border-t",
                // 5-up: one continuous set of vertical rules, no horizontals.
                "md:border-t-0",
                i === 0 ? "md:border-l-0" : "md:border-l",
                // The odd fifth figure closes the bottom row while stacked.
                i === STATS.length - 1 && "col-span-2 md:col-span-1"
              )}
            >
              <p className="font-display text-4xl font-medium leading-none tracking-tight text-cream md:text-5xl lg:text-[3.4rem]">
                <Counter to={stat.value} />
                {/* Kept at full size and simply recoloured. Shrinking it turned
                    "%" and "+" into subscripts, and "M+" has to stay part of the
                    magnitude to read as two million at all. */}
                {stat.suffix && (
                  <span className="text-gold-soft">{stat.suffix}</span>
                )}
              </p>

              <p className="mt-4 font-mono text-[9px] uppercase leading-[1.7] tracking-[0.2em] text-cream/45 md:text-[10px]">
                {stat.label}
              </p>
            </li>
          ))}
        </ul>
      </PageContainer>
    </section>
  );
}
