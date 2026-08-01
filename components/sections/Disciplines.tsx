"use client";

/**
 * Disciplines — ruled accordion index (imported from the Aarnaa Sections
 * Export, re-styled to our design system).
 *
 * A ruled list, not cards. Each row opens on hover/focus to reveal a line of
 * copy and a 16:7 image; the title nudges right as it opens, and only one row
 * is open at a time.
 *
 * The export drove this with imperative pointer listeners and inline styles;
 * here the open row is React state and the transitions are Tailwind classes.
 *
 * SMOOTHNESS — three things the naive version got wrong, all deliberate here:
 *
 *  1. The panel animates `grid-template-rows: 0fr -> 1fr`, not `max-height`.
 *     A max-height guess taller than the content maps the easing curve onto a
 *     distance that is never travelled, so the open visibly finishes early and
 *     the close sits still before it starts moving. `1fr` resolves to the real
 *     content height, so the curve is the motion.
 *  2. Images are warmed as soon as the section nears the viewport. Collapsed
 *     panels are clipped to zero height, so a lazy image inside never
 *     intersects — the fetch and decode would otherwise land in the middle of
 *     the open animation, which is what made it stutter.
 *  3. The open row is cleared when the pointer leaves the LIST, not the row.
 *     Closing per-row means moving from one row to the next goes
 *     open -> all-closed -> open, which reads as a flicker.
 *
 * TOUCH: `(hover: none)` pointers have no hover, so every row is opened
 * permanently and the "Hover to open" hint is dropped — matching the export's
 * adapt() behaviour. Resolved after mount so SSR output stays stable.
 */
import { useEffect, useRef, useState, type FocusEvent } from "react";

import { Media, PageContainer, Reveal, SectionHeading } from "@/components/ui";
import { DISCIPLINES } from "@/constants";
import { cn } from "@/utils/cn";

export default function Disciplines() {
  const sectionRef = useRef<HTMLElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [noHover, setNoHover] = useState(false);
  const [warm, setWarm] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: none)");
    const sync = () => setNoHover(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Warm the panel images well before the first hover is possible.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setWarm(true);
        io.disconnect();
      },
      { rootMargin: "800px 0px" }
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);

  /** On hover-less pointers the rows stay open, so ignore enter/leave there. */
  const open = (id: string) => {
    if (!noHover) setOpenId(id);
  };
  const close = () => {
    if (!noHover) setOpenId(null);
  };

  /** Close only once focus has actually left the list (keyboard equivalent). */
  const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    close();
  };

  return (
    <section
      ref={sectionRef}
      id="disciplines"
      className="bg-stone py-24 text-charcoal md:py-32 lg:py-40"
    >
      <PageContainer>
        <SectionHeading
          index="03"
          eyebrow="Disciplines"
          title="What we are asked for"
          meta={noHover ? undefined : "Hover to open"}
          className="mb-10 md:mb-16"
        />

        {/* Ruled index. Leave/blur live here, not on the rows — see note above. */}
        <div
          className="border-t border-emerald/12"
          onPointerLeave={close}
          onBlur={handleBlur}
        >
          {DISCIPLINES.map((discipline, i) => {
            const isOpen = noHover || openId === discipline.id;

            return (
              <Reveal key={discipline.id} delay={Math.min(i * 0.05, 0.25)}>
                <a
                  href="#contact"
                  onPointerEnter={() => open(discipline.id)}
                  onFocus={() => open(discipline.id)}
                  className="relative block border-b border-emerald/12 py-5 md:py-7"
                >
                  <div className="flex items-baseline justify-between gap-6">
                    <div className="flex items-baseline gap-4 md:gap-8 lg:gap-11">
                      <span className="font-mono text-[11px] text-emerald/45">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={cn(
                          "inline-block font-serif text-2xl font-light leading-none tracking-tight transition-[transform,color] duration-[600ms] ease-editorial md:text-4xl lg:text-[3.5rem]",
                          isOpen
                            ? "translate-x-3.5 text-emerald"
                            : "text-emerald/75"
                        )}
                      >
                        {discipline.title}
                      </span>
                    </div>
                    <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.14em] text-charcoal/50">
                      {discipline.meta}
                    </span>
                  </div>

                  {/* Collapsing panel — 0fr/1fr resolves to the true height. */}
                  <div
                    className={cn(
                      "grid transition-[grid-template-rows] duration-[700ms] ease-editorial",
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    )}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div
                        className={cn(
                          "grid grid-cols-1 items-center gap-5 pt-6 transition-opacity duration-500 ease-editorial md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-10 lg:gap-[3.75rem]",
                          isOpen ? "opacity-100" : "opacity-0"
                        )}
                      >
                        <p className="m-0 max-w-[40ch] text-[15px] leading-[1.75] text-charcoal/70">
                          {discipline.description}
                        </p>
                        <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl bg-charcoal/5">
                          <Media
                            src={discipline.image}
                            alt={discipline.title}
                            eager={warm}
                            sizes="(max-width: 768px) 100vw, 45vw"
                            className={cn(
                              "transition-transform duration-[1200ms] ease-editorial",
                              isOpen ? "scale-100" : "scale-[1.04]"
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              </Reveal>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}
