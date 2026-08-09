"use client";

/**
 * WhyUs — six principles, as hairline bays.
 *
 * ── Why the bento grid is gone ────────────────────────────────────────────
 *
 * This was six filled cards on a same-toned ground, each with a Feather line
 * icon, an oversized ghosted numeral watermark, and a gold glow that followed
 * the cursor. Every one of those is a "made from parts" signal:
 *
 *  · A stock icon set is the fastest way to look assembled rather than
 *    designed, and these six icons (compass, feather, layers, sun, home,
 *    award) illustrate nothing a reader could not get from the four words
 *    beside them.
 *  · A card whose fill is two per cent off its own background is not a card.
 *    It is a rectangle that costs contrast and returns nothing.
 *  · A pointer-following radial glow belongs to a different category of
 *    product entirely.
 *
 * The research behind this pass kept returning the same three things —
 * fewest colours, most whitespace, minimal ornamentation — and the client's
 * own reference site is near-monochrome with no decoration at all. So the
 * section is now type on a hairline grid: an index, a title, a line of body,
 * and the rules that divide them.
 *
 * ── One system, three sections ────────────────────────────────────────────
 *
 * The bays here are drawn exactly like <Process /> and like the method row on
 * /photography: a rule down the left edge of every column except the first,
 * equal padding inside. Three sections built from one device is what makes a
 * page feel designed rather than assembled section by section.
 *
 * Hovering a bay warms its index and slides its title, which is the whole
 * interaction. No fills, no glows, no lifts.
 */
import { PageContainer, SectionHeading } from "@/components/ui";
import { FEATURES } from "@/constants";
import { useReveal } from "@/hooks";
import { cn } from "@/utils/cn";

export default function WhyUs() {
  const gridRef = useReveal<HTMLDivElement>({ stagger: 0.08, y: 28 });

  return (
    <section
      id="why-us"
      className="bg-stone py-20 text-charcoal md:py-24 lg:py-28"
    >
      <PageContainer>
        <SectionHeading
          index="06"
          eyebrow="Why Us"
          title="Six reasons clients trust the studio"
          meta="Six principles"
          className="max-w-full"
        />

        <div
          ref={gridRef}
          className="mt-14 grid grid-cols-1 gap-y-12 border-t border-emerald/15 pt-12 md:mt-20 md:grid-cols-2 lg:grid-cols-3 lg:gap-y-16"
        >
          {FEATURES.map((feature, i) => (
            <article
              key={feature.id}
              data-reveal
              className={cn(
                "group border-emerald/15 md:px-8 lg:px-10",
                // 2-up: a rule before the right-hand column of each row.
                i % 2 === 1 && "md:border-l",
                // 3-up: one continuous set of verticals, with the first column
                // of each row flush left so the grid still aligns to the page
                // margin rather than floating inside it.
                i % 3 === 0
                  ? "lg:border-l-0 lg:pl-0"
                  : "lg:border-l"
              )}
            >
              <span className="block font-label text-[12px] tracking-[0.16em] uppercase text-gold transition-colors duration-500 ease-editorial group-hover:text-emerald">
                {String(i + 1).padStart(2, "0")}
              </span>

              <h3 className="mt-5 font-serif text-[1.8rem] leading-[1.12] font-light text-emerald transition-transform duration-700 ease-editorial group-hover:translate-x-1.5 xl:text-[2.1rem]">
                {feature.title}
              </h3>

              <p className="mt-4 max-w-[38ch] text-[15px] leading-[1.8] text-charcoal/70 md:text-base">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
