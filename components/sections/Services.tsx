"use client";

/**
 * Services — the five disciplines, on a pinned horizontal scroll.
 *
 * ── The scroll ────────────────────────────────────────────────────────────
 *
 * The section pins and the track translates sideways as you scroll down,
 * driven by GSAP ScrollTrigger and synced to Lenis in SmoothScrollProvider.
 *
 * Two things this implementation does that a naive pin does not:
 *
 *  · `anticipatePin: 1`. Pinning a full-viewport section repaints a large
 *    area, and on a fast flick the browser's paint thread lands a frame late,
 *    which shows up as the section visibly jumping as it pins. Anticipating
 *    the pin slightly early absorbs that.
 *
 *  · It only pins at lg and up, through `gsap.matchMedia`. `pin: true` wraps
 *    the element in a pin-spacer that doubles its height in the document
 *    flow, and on mobile browsers — where the toolbar collapses and the
 *    viewport height changes mid-scroll — that spacer is a reliable source of
 *    jump. Below lg the section releases into an ordinary vertical stack.
 *
 * There are now two pinned horizontal sections on this page (the other is
 * <SelectedWorks />). They are sequential rather than nested, which is fine —
 * nested pins are the ones that break — but they are deliberately given
 * different rhythms so the page does not feel like it repeats itself: the
 * gallery runs wide, cinematic panels, this runs a tighter card track with a
 * numbered progress readout.
 *
 * ── The interaction ───────────────────────────────────────────────────────
 *
 * Clicking a discipline's NAME reveals its description (client request). Not
 * hover: hover makes it always-on for anyone with a mouse and does not exist
 * at all on a phone. Only one is open at a time so the track keeps its rhythm,
 * and the panel animates `grid-template-rows` so it opens to the copy's real
 * height rather than to a guessed max-height.
 *
 * Architectural Photography opens its own page instead of expanding, so its
 * card renders a link and says so.
 */
import { useRef, useState } from "react";
import { FiArrowUpRight, FiPlus } from "react-icons/fi";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks";
import { Media, PageContainer, SectionHeading, SmoothLink } from "@/components/ui";
import { SERVICES } from "@/constants";
import { cn } from "@/utils/cn";

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);

  const [active, setActive] = useState(0);
  /** Which discipline is expanded. Only one at a time. */
  const [openId, setOpenId] = useState<string | null>(null);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const track = trackRef.current;
    if (!section || !pin || !track) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      // Measured through a function so `invalidateOnRefresh` can re-read it
      // on resize instead of holding a value from first paint.
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

      const tween = gsap.to(track, { x: () => -distance(), ease: "none" });

      const st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => "+=" + distance(),
        pin,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        animation: tween,
        onUpdate: (self) => {
          if (progressRef.current) {
            progressRef.current.style.transform = `scaleX(${self.progress})`;
          }
          const idx = Math.round(self.progress * (SERVICES.length - 1));
          if (idx !== activeRef.current) {
            activeRef.current = idx;
            setActive(idx);
          }
        },
      });

      return () => {
        st.kill();
        tween.kill();
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative bg-cream text-charcoal"
    >
      <div ref={pinRef} className="flex flex-col overflow-hidden lg:h-screen">
        <PageContainer className="shrink-0 pt-24 pb-8 md:pt-28">
          <SectionHeading
            index="07"
            eyebrow="Services"
            title="What we do"
            meta={`${String(active + 1).padStart(2, "0")} / ${String(
              SERVICES.length
            ).padStart(2, "0")}`}
            className="max-w-full"
          />
        </PageContainer>

        {/* Track */}
        <div
          ref={trackRef}
          className="relative flex flex-1 flex-col items-stretch gap-6 px-6 pb-10 will-change-transform md:px-10 lg:flex-row lg:gap-8 lg:px-16"
        >
          {SERVICES.map((service) => {
            const open = openId === service.id;
            const isLink = Boolean(service.href);

            return (
              <article
                key={service.id}
                className="group flex shrink-0 flex-col lg:h-full lg:w-[30vw] xl:w-[26vw]"
              >
                {/* At lg the card lives inside a pinned 100vh column, so the
                    image takes whatever height is left after the title block
                    rather than forcing its own aspect ratio — with `aspect-4/5`
                    fixed here the card was taller than the viewport and every
                    discipline's name sat cut off at the bottom edge.
                    `min-h-0` is required: a flex child defaults to
                    `min-height: auto`, which refuses to shrink below its
                    content and quietly defeats `flex-1`.

                    `bg-stone` is not decoration either: these images are
                    lazy-loaded and the track scrolls sideways, so a card can be
                    on screen before its image has arrived. Without a ground the
                    card reads as a hole in the row. */}
                {/* ── The image is the primary target ──────────────────────
                    Clicking the photograph does exactly what clicking the name
                    does: opens the description, or follows the link on
                    Photography. It is by far the biggest thing in the card, so
                    it was always the thing a visitor would aim at first — and
                    until now it was the one part that did nothing.

                    Rendered as a real <a> or <button>, not a div with an
                    onClick, so both targets are reachable by keyboard and
                    announce themselves. The two share `aria-controls`, and the
                    image copy is `tabIndex={-1}` / `aria-hidden`: it is a
                    second handle on the same control, and exposing it twice
                    would make a keyboard user tab through nine stops to cross
                    five cards. */}
                {isLink ? (
                  <SmoothLink
                    href={service.href!}
                    tabIndex={-1}
                    aria-hidden
                    className="relative block aspect-4/5 w-full shrink-0 cursor-pointer overflow-hidden rounded-2xl bg-stone lg:aspect-auto lg:h-[60%]"
                  >
                    <Media
                      src={service.image}
                      alt=""
                      sizes="(max-width: 1024px) 90vw, 30vw"
                      className="transition-transform duration-1400 ease-editorial group-hover:scale-105"
                    />
                    <span className="absolute top-5 left-5 font-label text-cream/90">
                      {service.index}
                    </span>
                  </SmoothLink>
                ) : (
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-hidden
                    onClick={() => setOpenId(open ? null : service.id)}
                    className="relative block aspect-4/5 w-full shrink-0 cursor-pointer overflow-hidden rounded-2xl bg-stone lg:aspect-auto lg:h-[60%]"
                  >
                    <Media
                      src={service.image}
                      alt=""
                      sizes="(max-width: 1024px) 90vw, 30vw"
                      className="transition-transform duration-1400 ease-editorial group-hover:scale-105"
                    />
                    <span className="absolute top-5 left-5 font-label text-cream/90">
                      {service.index}
                    </span>
                  </button>
                )}

                {/* The image above is a FIXED share of the column height and
                    this block takes the remainder, rather than the image
                    flexing to fill what is left. Two reasons, both visible:
                    the Photography card carries a permanent description while
                    the others do not, so a flexing image made its photograph
                    noticeably shorter than its neighbours' and the row's
                    bottom edges stopped agreeing; and opening a description
                    shrank that card's photograph as it expanded, which reads
                    as the layout collapsing rather than as a panel opening. */}
                <div className="mt-6 min-h-0 flex-1 overflow-hidden border-t border-emerald/12 pt-5">
                  {isLink ? (
                    /* Photography opens its own page. A link, not a toggle —
                       and it says so, so the different behaviour is visible
                       before it is clicked rather than after. */
                    <SmoothLink
                      href={service.href!}
                      className="flex w-full items-start justify-between gap-4 text-left"
                    >
                      <span className="font-serif text-[1.7rem] leading-[1.1] text-emerald xl:text-3xl">
                        {service.title}
                      </span>
                      <FiArrowUpRight
                        className="mt-1.5 shrink-0 text-gold transition-transform duration-500 ease-editorial group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        size={20}
                        aria-hidden
                      />
                    </SmoothLink>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : service.id)}
                      aria-expanded={open}
                      aria-controls={`service-${service.id}`}
                      className="flex w-full cursor-pointer items-start justify-between gap-4 text-left"
                    >
                      <span className="font-serif text-[1.7rem] leading-[1.1] text-emerald xl:text-3xl">
                        {service.title}
                      </span>
                      <FiPlus
                        className={cn(
                          "mt-2 shrink-0 text-gold transition-transform duration-500 ease-editorial",
                          open && "rotate-45"
                        )}
                        size={18}
                        aria-hidden
                      />
                    </button>
                  )}

                  {isLink ? (
                    <p className="mt-3 max-w-sm text-charcoal/70">
                      {service.body}
                    </p>
                  ) : (
                    <div
                      id={`service-${service.id}`}
                      className={cn(
                        "grid transition-[grid-template-rows] duration-600 ease-editorial",
                        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      )}
                    >
                      <div className="overflow-hidden">
                        <p className="mt-3 max-w-sm text-charcoal/70">
                          {service.body}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}

          {/* Closing panel — keeps the track from ending on a hard edge and
              gives the horizontal run somewhere to arrive. */}
          <div className="hidden shrink-0 flex-col justify-end pb-8 lg:flex lg:w-[24vw]">
            <span aria-hidden className="mb-6 block h-px w-16 bg-gold" />
            <p className="font-serif text-[1.7rem] leading-[1.15] text-emerald xl:text-3xl">
              One studio, five disciplines, one continuous idea.
            </p>
            <SmoothLink
              href="#contact"
              className="group mt-7 inline-flex items-center gap-2.5 self-start border-b border-gold/50 pb-1.5 font-label text-emerald transition-colors duration-500 hover:text-gold"
            >
              Start a conversation
              <FiArrowUpRight
                size={14}
                aria-hidden
                className="transition-transform duration-500 ease-editorial group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </SmoothLink>
          </div>
        </div>

        {/* Progress hairline (desktop only — below lg there is no horizontal
            travel for it to describe). */}
        <PageContainer className="hidden shrink-0 pb-5 lg:block">
          <div className="relative h-px bg-charcoal/15">
            {/* scaleX rather than width: a transform is composited, so the bar
                stays smooth while the pin is also driving the track. */}
            <div
              ref={progressRef}
              className="absolute inset-y-0 left-0 w-full origin-left scale-x-0 bg-gold"
            />
          </div>
        </PageContainer>
      </div>
    </section>
  );
}
