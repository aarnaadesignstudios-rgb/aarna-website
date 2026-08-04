/**
 * Services — large horizontal cards.
 *
 * Phase 1 prepares the LAYOUT ONLY. The cards live in a horizontal track that
 * currently scrolls natively (overflow-x). The future GSAP horizontal pin-scroll
 * is intentionally NOT built yet.
 *
 * TODO (future phases):
 *  - Pin the section and translate `[data-services-track]` on scroll with
 *    ScrollTrigger to create the signature horizontal gallery.
 *  - Add per-card image parallax as each card enters the viewport.
 *  - Hide the native scrollbar once the pinned scroll takes over.
 *
 * Server component — no client interactivity required at this stage.
 */
import { Media, PageContainer, SectionHeading } from "@/components/ui";
import { SERVICES } from "@/constants";

export default function Services() {
  return (
    <section
      id="services"
      className="overflow-hidden bg-cream py-24 text-charcoal md:py-32 lg:py-40"
    >
      <PageContainer>
        <SectionHeading
          index="06"
          eyebrow="Services"
          title="What we do"
          description="Four disciplines, one continuous idea — carried from the ground plane to the smallest detail."
          meta="Scroll →"
        />
      </PageContainer>

      {/* Horizontal track. NOTE: native horizontal scroll for now — the pinned
          GSAP scroll will replace this. `data-services-track` is the future
          animation target. */}
      <div
        data-services-track
        className="mt-16 flex gap-6 overflow-x-auto px-6 pb-6 md:gap-8 md:px-10 lg:px-16 [scrollbar-width:thin]"
      >
        {SERVICES.map((service, index) => (
          <article
            key={service.id}
            className="group relative flex w-[80vw] shrink-0 flex-col sm:w-[60vw] lg:w-[38vw] xl:w-[32vw]"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl">
              <Media
                src={service.image}
                alt={service.title}
                sizes="(max-width: 1024px) 80vw, 38vw"
                className="transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute left-5 top-5 font-mono text-[10px] uppercase tracking-[0.2em] text-cream/90">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="mt-6 border-t border-emerald/12 pt-5">
              <h3 className="font-serif text-3xl font-light text-emerald md:text-4xl">
                {service.title}
              </h3>
              <p className="mt-3 max-w-sm text-base leading-[1.75] text-charcoal/70">
                {service.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
