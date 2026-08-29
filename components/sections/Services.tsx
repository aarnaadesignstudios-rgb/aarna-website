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
import {
  Media,
  PageContainer,
  SectionHeading,
  SheetTexture,
  SmoothLink,
} from "@/components/ui";
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
      /* ── Paper, and it fixes the alternation as well as the look ────────
         This was mid brand green with cream type, on the argument that a
         saturated ground makes photography read as lit objects. It did — and
         it cost more than it bought, for two reasons.

         The look: five photographs, each a bright interior, sitting on the
         darkest ground on the site with cream type between them. The cards had
         no surface of their own, so each one was a lit rectangle floating on
         green with a hairline of type underneath. Nothing held them together
         and the section read as unfinished next to <Testimonials />, which is
         the same shape — a row of cards under a heading — and reads as a set.

         The alternation: the page's grounds are meant to alternate paper and
         emerald so that every boundary is a hard edge between two flat colours
         (see the note on the two grounds in styles/globals.css). <Process />
         immediately above is emerald and <Contact /> immediately below is
         emerald, so this section was the middle of a three-chapter green run
         with no boundary at either end. On paper it is the edge both of them
         needed.

         `data-chrome="dark"` goes with it: the masthead reads that attribute
         to decide whether it needs cream chrome, and this is no longer a dark
         band — see components/layout/Navbar.tsx. */
      className="relative bg-paper text-charcoal"
    >
      {/* `placement="top"` is kept rather than taking <Testimonials />'s
          corners: this section is a pinned 100vh box and a bottom-left
          ornament would land on the progress rail. */}
      <SheetTexture placement="top" />

      <div
        ref={pinRef}
        className="relative z-10 flex flex-col overflow-hidden lg:h-screen"
      >
        <PageContainer className="shrink-0 pt-24 pb-8 md:pt-28">
          <SectionHeading
            eyebrow="Services"
            /* The logo gold, matching <Practice />'s eyebrow. See the note on
               `eyebrowClassName` in components/ui/SectionHeading.tsx for what it
               costs on paper — gold is 2.18:1 there against `gold-ink`'s 5.04:1,
               and an eyebrow is the smallest type on the page to spend that on. */
            eyebrowClassName="text-gold"
            title="What we do"
            /* Same reason as <SelectedWorks />: `active` is written by the
               horizontal track's ScrollTrigger, which only exists at `lg` and
               up. Below that the header sat on "01 / 05" while you scrolled
               past all five. The stack gets the count, which stays true. */
            meta={
              <>
                <span className="lg:hidden">
                  {SERVICES.length} disciplines
                </span>
                <span className="hidden lg:inline">
                  {`${String(active + 1).padStart(2, "0")} / ${String(
                    SERVICES.length
                  ).padStart(2, "0")}`}
                </span>
              </>
            }
            className="max-w-full"
          />
        </PageContainer>

        {/* Track */}
        {/* ── Three layouts, one element ───────────────────────────────────
            At `lg` and up this is the pinned horizontal TRACK: a flex row that
            GSAP translates sideways as the section scrolls.

            Below that there is no pin and no translation, so it is free to be a
            grid — and it needs to be. A full-width 4:5 card is ~490px on a
            phone and ~960px on a tablet, so five disciplines stacked one per
            row made this the longest section on the site by a wide margin, with
            a single photograph on screen at a time and nothing to compare it
            to. Two up from `sm` halves the run and is what a tablet's width is
            for.

            Phones keep one column: two 4:5 cards side by side at 390px are
            170px wide, which turns a discipline's photograph into a thumbnail.

            The order matters — `sm:grid` then `lg:flex` — because the later
            utility has to win at the larger width. */}
        <div
          ref={trackRef}
          className="relative flex flex-1 flex-col items-stretch gap-6 px-6 pb-10 will-change-transform sm:grid sm:grid-cols-2 sm:gap-7 md:px-10 lg:flex lg:flex-row lg:gap-8 lg:px-16"
        >
          {SERVICES.map((service) => {
            const open = openId === service.id;

            return (
              <article
                key={service.id}
                className="group flex shrink-0 flex-col lg:h-full lg:w-[30vw] xl:w-[26vw]"
              >
                {/* ── The card is a surface ───────────────────────────────
                    The photograph and the name used to sit directly on the
                    section's ground with a rule between them, which works on a
                    dark band — the image IS the card there, because it is the
                    only lit thing in the frame. On paper it stops working: the
                    image is lit, the ground is lit, and nothing draws the edge
                    of the card.

                    So the pair goes inside a white panel with a hairline, and
                    the values are lifted verbatim from the light tone in
                    components/ui/InfiniteMovingCards.tsx — `bg-white`,
                    `border-emerald/10`, gold on hover. That is the same object
                    a testimonial is, which is the point: two sections with the
                    same shape should be built out of the same surface.

                    `overflow-hidden` on the panel rather than a radius on the
                    image, so one declaration rounds the photograph's top
                    corners and the panel's bottom ones and they cannot drift
                    apart. */}
                <div className="flex flex-col overflow-hidden rounded-2xl border border-emerald/10 bg-white transition-colors duration-500 ease-editorial group-hover:border-gold/45 lg:h-full">
                  {/* ── The photograph takes whatever the name does not ─────
                      This was a fixed 60% of the card with the name's block
                      taking the other 40%, and the 40% was mostly empty: a
                      one-line title in a box tall enough for a title plus four
                      lines of description, because one card in five carried a
                      permanent description and all five had to end level.

                      That card is an accordion now like the rest, so nothing
                      needs the space reserved. `flex-1 min-h-0` gives the
                      photograph the remainder instead, and the name's block
                      below it is only as tall as the name — which is what
                      closes the empty band under every image.

                      `min-h-0` is not optional: a flex child defaults to
                      `min-height: auto`, refuses to shrink below its content
                      and quietly defeats `flex-1`.

                      Opening a description now takes its room from the
                      photograph, which is the honest behaviour for a panel
                      inside a fixed-height row — the alternative is a card that
                      grows past the bottom of a pinned viewport.

                      `bg-stone` is a ground, not decoration: these images are
                      lazy-loaded and the track scrolls sideways, so a card can
                      be on screen before its image has arrived. Without it the
                      card reads as a hole in the row. */}
                  {/* ── The image is a second handle on the same control ────
                      Clicking the photograph does what clicking the name does.
                      It is by far the biggest thing in the card, so it was
                      always what a visitor would aim at first.

                      A real <button>, not a div with an onClick, so it is a
                      control rather than a decoration — but `tabIndex={-1}` and
                      `aria-hidden`, because it is the SAME control as the name
                      below and exposing both would make a keyboard user tab
                      through ten stops to cross five cards. */}
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-hidden
                    onClick={() => setOpenId(open ? null : service.id)}
                    className="relative block aspect-4/5 w-full shrink-0 cursor-pointer overflow-hidden bg-stone lg:aspect-auto lg:min-h-0 lg:flex-1"
                  >
                    <Media
                      src={service.image}
                      alt=""
                      sizes="(max-width: 1024px) 90vw, 30vw"
                      className="transition-transform duration-1400 ease-editorial group-hover:scale-105"
                    />
                    {/* A short scrim under the index, and it is load-bearing
                        now in a way it was not on the dark band. Cream type on
                        a photograph only reads where the photograph is dark,
                        and four of these five are bright interiors — on green
                        the numeral at least had the card's own edge behind it,
                        and inside a white panel it had nothing and read as a
                        smudge on the picture. Emerald rather than black: a
                        neutral scrim on these warm interiors goes grey. */}
                    <span
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-emerald/45 to-transparent"
                    />
                    <span className="absolute top-5 left-5 font-label text-cream/90">
                      {service.index}
                    </span>
                  </button>

                  <div className="shrink-0 border-t border-emerald/10 p-5 xl:p-6">
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
                          "mt-2 shrink-0 text-gold-ink transition-transform duration-500 ease-editorial",
                          open && "rotate-45"
                        )}
                        size={18}
                        aria-hidden
                      />
                    </button>

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

                        {/* The discipline's own destination, offered where the
                            reader already is rather than by turning the whole
                            card into a link. `tabIndex` follows the panel: a
                            link inside a collapsed row is still in the tab
                            order and would send a keyboard user to a page they
                            cannot see the name of. */}
                        {service.link && (
                          <SmoothLink
                            href={service.link.href}
                            tabIndex={open ? undefined : -1}
                            /* `pt-1.5` on top of the existing `pb-1`: the link
                               is 12px label type, which is a 21px-tall target
                               without it. The underline is the bottom BORDER,
                               so padding added above the text grows the target
                               without moving the rule. */
                            className="group/link mt-4 inline-flex items-center gap-2 border-b border-gold/50 pt-1.5 pb-1 font-label text-gold-ink transition-colors duration-500 hover:text-emerald"
                          >
                            {service.link.label}
                            <FiArrowUpRight
                              size={13}
                              aria-hidden
                              className="transition-transform duration-500 ease-editorial group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                            />
                          </SmoothLink>
                        )}
                      </div>
                    </div>
                  </div>
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
              className="group mt-7 inline-flex items-center gap-2.5 self-start border-b border-gold/60 pt-1.5 pb-1.5 font-label text-gold-ink transition-colors duration-500 hover:text-emerald"
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
          <div className="relative h-px bg-emerald/15">
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
