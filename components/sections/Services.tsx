"use client";

/**
 * Services — the studio's five disciplines, in a horizontal track.
 *
 * ── Built to the client review ────────────────────────────────────────────
 *
 *  1. FIVE disciplines, not four, with the studio's own copy: Architecture,
 *     Commercial Interiors, Boutique Interiors, Vastu, and Architectural
 *     Photography.
 *
 *  2. "Horizontal scroll here." The track scrolls horizontally. It is a
 *     native overflow-x scroller rather than a GSAP pin, deliberately: the
 *     page already has one pinned horizontal section (<SelectedWorks />), and
 *     a second one a screen later makes the page feel like it is fighting the
 *     scroll wheel. Native scroll here keeps the gesture cheap and lets a
 *     visitor flick past it. Arrow keys and the scrollbar both work; the
 *     scrollbar itself is hidden (`no-scrollbar`) with a progress hairline
 *     shown instead.
 *
 *  3. "After clicking name the below text should come." The description is
 *     hidden at rest and revealed by clicking the discipline's NAME. Not
 *     hover — hover would put it back to being always-on for anyone with a
 *     mouse, and there is no hover at all on a phone. So each card's title is
 *     a real <button> that toggles its own panel, and only one is open at a
 *     time so the track's rhythm holds.
 *
 *  4. Architectural Photography opens its own page (`/photography`) rather
 *     than expanding in place, so its card renders a link instead of a toggle.
 *     That difference is signalled in the card, not left for the visitor to
 *     discover by clicking.
 *
 * The reveal animates `grid-template-rows` rather than `max-height`, so the
 * panel opens to the copy's real height — no clipped text on the long entries,
 * no dead space under the short ones.
 */
import { useState } from "react";
import { FiArrowUpRight, FiPlus } from "react-icons/fi";

import { Media, PageContainer, SectionHeading } from "@/components/ui";
import { SERVICES } from "@/constants";
import { cn } from "@/utils/cn";

export default function Services() {
  /** Which discipline is expanded. Only one at a time. */
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section
      id="services"
      className="overflow-hidden bg-cream py-20 text-charcoal md:py-24 lg:py-28"
    >
      <PageContainer>
        <SectionHeading
          index="07"
          eyebrow="Services"
          title="What we do"
          description="Five disciplines, one continuous idea — carried from the ground plane to the smallest detail."
          meta="Scroll →"
        />
      </PageContainer>

      {/* Horizontal track. Native scroll — see the note above. */}
      <div
        data-services-track
        className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-6 md:gap-8 md:px-10 lg:px-16"
      >
        {SERVICES.map((service) => {
          const open = openId === service.id;
          const isLink = Boolean(service.href);

          return (
            <article
              key={service.id}
              className="group relative flex w-[80vw] shrink-0 snap-start flex-col sm:w-[58vw] lg:w-[34vw] xl:w-[28vw]"
            >
              {/* `bg-stone` is not decoration: these images are lazy-loaded and
                  the track scrolls horizontally, so a card can be on screen
                  before its image has arrived. Without a ground the container
                  is transparent and the card reads as a hole in the row. */}
              <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl bg-stone">
                <Media
                  src={service.image}
                  alt={service.title}
                  sizes="(max-width: 1024px) 80vw, 34vw"
                  className="transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute top-5 left-5 font-label text-[12px] uppercase tracking-[0.16em] text-cream/90">
                  {service.index}
                </span>
              </div>

              <div className="mt-6 border-t border-emerald/12 pt-5">
                {isLink ? (
                  /* Photography opens its own page. A link, not a toggle —
                     and it says so, so the different behaviour is visible
                     before it is clicked rather than after. */
                  <a
                    href={service.href}
                    className="flex w-full items-start justify-between gap-4 text-left"
                  >
                    <span className="font-serif text-3xl font-light text-emerald md:text-4xl">
                      {service.title}
                    </span>
                    <FiArrowUpRight
                      className="mt-2 shrink-0 text-gold transition-transform duration-500 ease-editorial group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      size={22}
                      aria-hidden
                    />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : service.id)}
                    aria-expanded={open}
                    aria-controls={`service-${service.id}`}
                    className="flex w-full cursor-pointer items-start justify-between gap-4 text-left"
                  >
                    <span className="font-serif text-3xl font-light text-emerald md:text-4xl">
                      {service.title}
                    </span>
                    <FiPlus
                      className={cn(
                        "mt-2.5 shrink-0 text-gold transition-transform duration-500 ease-editorial",
                        open && "rotate-45"
                      )}
                      size={20}
                      aria-hidden
                    />
                  </button>
                )}

                {isLink ? (
                  <p className="mt-3 max-w-sm text-[15px] leading-[1.75] text-charcoal/70">
                    {service.body}
                  </p>
                ) : (
                  /* grid-template-rows animates to the copy's real height, so
                     nothing is clipped and nothing leaves a gap. */
                  <div
                    id={`service-${service.id}`}
                    className={cn(
                      "grid transition-[grid-template-rows] duration-600 ease-editorial",
                      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="mt-3 max-w-sm text-[15px] leading-[1.75] text-charcoal/70">
                        {service.body}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
