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
 * ── Every card behaves the same way now ───────────────────────────────────
 *
 * Architectural Photography used to open its own page INSTEAD of expanding. It
 * was the only card in the row that did, and the exception cost more than it
 * bought: its description had to be printed permanently since it had no panel
 * to reveal, which made it the one card whose text block never matched its
 * neighbours' — and a visitor who clicked it was taken off the page mid-track,
 * out of a section they were halfway through reading.
 *
 * It expands like the rest, and its destinations live INSIDE the panel as
 * links. That is strictly more capable than the old arrangement: a discipline
 * can now describe itself and lead somewhere, rather than having to choose.
 * See `links` on the Service type.
 *
 * ── The ground ────────────────────────────────────────────────────────────
 *
 * Paper, at the studio's request, matching <Testimonials />. It also breaks up
 * what had become three consecutive emerald bands — Process, Services, Contact
 * — and the middle one is the section carrying five photographs, which are the
 * thing worth looking at. Brand colour is carried the way the palette intends
 * on a light ground: emerald in the type and the index chips, gold in the
 * hairlines, the vines and the rail.
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
      /* ── Paper, matching <Testimonials /> ────────────────────────────
         This was a saturated emerald band, on the argument that a green ground
         makes photography read as lit objects. That argument holds in
         isolation and did not hold on the page: <Process /> above and
         <Contact /> below are both `bg-emerald` too, so the last third of the
         document was three consecutive bands of the same colour with the
         densest, most photographic of them in the middle.

         `data-chrome="dark"` is gone with the ground, and that is not
         cosmetic. The masthead and the spine both read that attribute to
         decide whether to draw themselves in cream or in emerald — see the
         note in components/layout/Navbar.tsx. Leaving it on a paper section
         would put cream type and a cream thread on a near-white ground for the
         whole length of the track: invisible, and invisible in the two pieces
         of chrome a visitor uses to know where they are. */
      className="relative bg-paper text-charcoal"
    >
      <SheetTexture placement="top" />

      <div
        ref={pinRef}
        className="relative z-10 flex flex-col overflow-hidden lg:h-screen"
      >
        <PageContainer className="shrink-0 pt-24 pb-8 md:pt-28">
          <SectionHeading
            eyebrow="Services"
            title="What we do"
            tone="light"
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
            const toggle = () => setOpenId(open ? null : service.id);
            const panelId = `service-${service.id}`;

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

                    `bg-stone` is the loading ground, and it is not decoration:
                    these images are lazy-loaded and the track scrolls
                    sideways, so a card can be on screen before its image has
                    arrived. It used to be `bg-emerald-deep`, which was a
                    near-black rectangle — fine against the old emerald band
                    and, on paper, a hole cut in the row. Caught on screen:
                    the Photography card renders exactly that way for as long
                    as its photograph takes to decode.

                    ── The image is the primary target ──────────────────────
                    Clicking the photograph does exactly what clicking the name
                    does. It is by far the biggest thing in the card, so it was
                    always the thing a visitor would aim at first.

                    A real <button>, not a div with an onClick, so it is
                    reachable by keyboard. It is `tabIndex={-1}` / `aria-hidden`
                    because it is a SECOND handle on the same control that the
                    name below already exposes — announcing it twice would make
                    a keyboard user tab through ten stops to cross five cards. */}
                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden
                  onClick={toggle}
                  className="relative block aspect-4/5 w-full shrink-0 cursor-pointer overflow-hidden rounded-2xl bg-stone ring-1 ring-emerald/10 lg:aspect-auto lg:h-auto lg:min-h-0 lg:shrink lg:basis-[60%]"
                >
                  <Media
                    src={service.image}
                    alt=""
                    sizes="(max-width: 1024px) 90vw, 30vw"
                    className="transition-transform duration-1400 ease-editorial group-hover:scale-105"
                  />
                  {/* ── The index needed a ground once the section went light ──
                      It was bare cream type laid straight on the photograph.
                      That worked while every card sat on a dark band, because
                      the images were all darkened by the section around them.
                      On paper the photographs are at full strength and three
                      of these five are bright interiors — cream on a white
                      ceiling is not low contrast, it is no contrast.

                      An emerald chip fixes it independently of what the
                      photograph happens to be, and it is where the brand green
                      goes on a light ground: into a small, dense, deliberate
                      mark rather than across the whole band. */}
                  <span className="absolute top-4 left-4 rounded-full bg-emerald/95 px-3 py-1 font-label text-cream">
                    {service.index}
                  </span>
                </button>

                {/* The image above is a FIXED share of the column height and
                    this block takes the remainder, rather than the image
                    flexing to fill what is left. Opening a description would
                    otherwise shrink that card's photograph as it expanded,
                    which reads as the layout collapsing rather than as a panel
                    opening.

                    The rule is GOLD now rather than a cream tint — on paper it
                    is the same hairline that opens every chapter and rules the
                    spine, so the card joins the drawing the rest of the page is
                    made of. It brightens on the open card, which is the
                    quietest possible way to say which one you are reading. */}
                {/* ── No `overflow-hidden` here, and that is a fix ───────────
                    This block is `flex-1` inside a card that is exactly the
                    height of a pinned 100vh column, so its height is fixed by
                    the viewport rather than by what is in it. Clipping its
                    overflow therefore meant the expanded panel was silently
                    CUT OFF whenever the description plus its links came to
                    more than the space left under the title.

                    Measured at 1600x900: the panel cleared the card's bottom
                    edge by thirteen pixels with one link. A second link is
                    about twenty-eight, so adding the one the studio asked for
                    would have cropped it — and at a laptop height of 800 the
                    panel was already being cut with no links at all. It never
                    showed up because, until now, the only card with anything
                    in its panel was the one card that had no panel.

                    Letting it overflow gives the panel the track's own bottom
                    padding to expand into — forty pixels that were doing
                    nothing — and the collapse still clips correctly, because
                    that is done by the `0fr` grid row and the inner wrapper,
                    not by this. */}
                {/* ── `lg:min-h-52` is the floor the panel needs ─────────────
                    The image was a flat 60% of the column and could not
                    shrink, so the text block was whatever 40% of the viewport
                    happened to be. At 1600x900 that is 234px and everything
                    fits. At a laptop height of 760 it is 178px, and the
                    description plus two links want 246 — the panel ran 81px
                    past the bottom of the card and straight through the
                    progress rail.

                    Now the split is a PREFERENCE rather than a rule: the image
                    still takes 60% wherever there is room for it (so nothing
                    changes at ordinary desktop heights), but the text block
                    holds a floor of 13rem and the image gives way below that.
                    A photograph that is a little more panoramic on a short
                    screen is a far better trade than a link the visitor cannot
                    see.

                    The floor is a CONSTANT, not content-derived, which is what
                    keeps the earlier fault from coming back: the image height
                    depends only on the viewport, so opening a panel never
                    changes it and the row's photographs always agree with each
                    other. */}
                <div
                  className={cn(
                    "mt-6 min-h-0 flex-1 border-t pt-4 transition-colors duration-500 ease-editorial lg:min-h-52",
                    open ? "border-gold" : "border-gold/40"
                  )}
                >
                  <button
                    type="button"
                    onClick={toggle}
                    aria-expanded={open}
                    aria-controls={panelId}
                    className="flex w-full cursor-pointer items-start justify-between gap-4 text-left"
                  >
                    <span className="font-serif text-[1.7rem] leading-[1.1] text-emerald xl:text-3xl">
                      {service.title}
                    </span>
                    {/* `gold-ink`, not `gold`. The logo gold is around 2:1 on
                        paper — the palette's own note reserves it for rules and
                        marks and calls it unreadable as ink on a light ground.
                        A 18px glyph made of 1.5px strokes is ink, not a rule. */}
                    <FiPlus
                      className={cn(
                        "mt-2 shrink-0 text-gold-ink transition-transform duration-500 ease-editorial",
                        open && "rotate-45"
                      )}
                      size={18}
                      aria-hidden
                    />
                  </button>

                  {/* ── `inert` is load-bearing now that the panel has links ──
                      A collapsed panel is `grid-rows-[0fr]` with
                      `overflow-hidden`: zero pixels tall, and still in the
                      document. That was harmless while the only thing inside
                      was a paragraph. It stops being harmless the moment a
                      LINK is in there — a keyboard user would tab into a link
                      they cannot see, inside a card they have not opened, in a
                      pinned track that then scrolls to bring it into view.

                      `inert` takes the subtree out of the tab order and out of
                      the accessibility tree together, which is exactly the
                      pair of things wanted here. */}
                  <div
                    id={panelId}
                    inert={!open}
                    className={cn(
                      "grid transition-[grid-template-rows] duration-600 ease-editorial",
                      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    )}
                  >
                    <div className="overflow-hidden">
                      {/* A gold rule down the left of the revealed copy. On a
                          drawing, what is written beside a rule is an
                          annotation on the thing above it — which is precisely
                          what this text is. It also gives the opened state a
                          shape of its own, so the panel reads as something
                          that was revealed rather than as text that appeared. */}
                      <div className="mt-2.5 border-l border-gold/45 pl-4">
                        {/* `max-w-sm` was 384px inside a card that is ~464px
                            wide once the rule and its padding are taken off —
                            so the copy was being held to three lines by a
                            measure narrower than the space it had. Widening it
                            to the card takes most descriptions to two lines,
                            which is worth about 28px of panel height on every
                            card. That is the difference between the floor
                            below biting on a 1440x800 laptop and not.

                            ~50 characters at this size, which is inside the
                            65-character target the type system sets, so this
                            buys the height without spending readability. */}
                        <p className="text-charcoal/70">{service.body}</p>

                        {service.links && service.links.length > 0 && (
                          <ul className="mt-4 flex flex-col items-start gap-2">
                            {service.links.map((link) => {
                              /* Anything not starting with "/" or "#" leaves
                                 the site. <SmoothLink /> already renders those
                                 as a plain anchor rather than handing them to
                                 the router — but it cannot know they should
                                 open in a new tab, and sending a visitor off
                                 the studio's site mid-section with no way back
                                 is the one thing this panel should not do. */
                              const external =
                                !link.href.startsWith("/") &&
                                !link.href.startsWith("#");

                              return (
                                <li key={link.href}>
                                  <SmoothLink
                                    href={link.href}
                                    {...(external
                                      ? {
                                          target: "_blank",
                                          rel: "noreferrer",
                                        }
                                      : {})}
                                    className="group/link inline-flex items-center gap-2 border-b border-gold/50 pb-1 font-label text-gold-ink transition-colors duration-300 hover:border-emerald hover:text-emerald"
                                  >
                                    {link.label}
                                    {external && (
                                      <span className="sr-only">
                                        (opens in a new tab)
                                      </span>
                                    )}
                                    <FiArrowUpRight
                                      size={13}
                                      aria-hidden
                                      className="transition-transform duration-500 ease-editorial group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                                    />
                                  </SmoothLink>
                                </li>
                              );
                            })}
                          </ul>
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
            {/* `gold-soft` was the champagne cut, which exists specifically to
                carry gold on deep green. On paper it is a pale warm grey at
                about 1.6:1 — the closing call to action would have been the
                least legible type in the section. */}
            <SmoothLink
              href="#contact"
              className="group mt-7 inline-flex items-center gap-2.5 self-start border-b border-gold/60 pb-1.5 font-label text-gold-ink transition-colors duration-500 hover:border-emerald hover:text-emerald"
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
          {/* The track was `cream/25` on emerald. On paper that is a white
              line on a white ground — the rail would have been a gold bar
              growing across nothing. Emerald at 15% is the same relationship
              the other light sections use for a hairline. The FILL stays plain
              `gold`: it is a rule, not type, which is the one job the palette
              keeps the logo gold for. */}
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
