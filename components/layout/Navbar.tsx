"use client";

/**
 * Navbar — a floating masthead cut from liquid glass.
 *
 *   ┌──────────────────────────────────────────────────────────────────┐
 *   │ ABOUT  WHY US  …   [mark] Aarnaa Design Studios      ( ENQUIRE ↗)│
 *   └──────────────────────────────────────────────────────────────────┘
 *      ↑ inset from all three edges; photography runs behind and through it
 *
 * ── Why this shape ────────────────────────────────────────────────────────
 *
 * Several earlier versions each failed for a nameable reason. Transparent over
 * the hero with no blur: illegible, because the frame behind it changes every
 * five seconds. A full-width solid emerald bar: legible, but a saturated green
 * band welded across the top of every screen. A near-black glass slab: legible
 * everywhere and the same object on every surface, but it read as black, which
 * the brief ruled out.
 *
 * A floating inset bar of real glass answers all three. It is inset rather than
 * full-bleed, so imagery runs past it on all sides and the page reads as one
 * continuous canvas with a small object resting on it. It transmits what is
 * behind it, so it is never a hole in the page. And legibility comes from the
 * BLUR rather than from opacity — it is high-frequency detail, not brightness,
 * that makes type on a photograph unreadable, so 30px of blur buys more
 * legibility than 50% more tint would.
 *
 * ── The bar knows what it is over ─────────────────────────────────────────
 *
 * The one thing genuine transparency costs is a fixed ink colour: cream type
 * needs a dark backdrop and emerald type needs a light one, and this page
 * alternates between the two all the way down. So the bar reads the band behind
 * it and flips its own palette.
 *
 * Dark bands declare themselves with `data-chrome="dark"`; light is the
 * default, so most sections say nothing. There used to be five declarations —
 * hero, the figures strip, Testimonials, Founder and Contact — and the site is
 * light throughout now, so the list is down to the two places where the backdrop
 * is a full-bleed PHOTOGRAPH: the home hero and the /photography hero. Nothing
 * else on either page needs cream chrome.
 *
 * The mechanism stays exactly as it was, and is worth keeping at two callers
 * rather than being replaced with something simpler, because those two are
 * precisely the case that defeats the alternatives: a hit test or a luminance
 * sample cannot read a hero whose computed background-color is `bg-ink` behind
 * a photograph of unknown brightness. Detection is a rect overlap test against
 * the declared elements.
 *
 * ── Layout: a 3-column grid, not a centred absolute ───────────────────────
 *
 * The brand sits in the middle column of `1fr auto 1fr`. Because the two outer
 * tracks are both `1fr` they always resolve to the same width, so the middle
 * one is centred on the BAR — the property that matters, and one that survives
 * links being added, the active state changing width, or one edge control being
 * wider than the other.
 *
 * An earlier version got the same centring by absolutely positioning the lockup
 * across the full bar, and paid for it with a `px-14` "collision guard" to stop
 * the name growing underneath the edge controls. Grid tracks cannot overlap by
 * construction, so both the hack and the class of bug it patched are gone.
 *
 * Both edge controls are the same 36/40px circle-or-pill so the bar reads as
 * control · brand · control. Below `xl` the link list is replaced by the menu
 * trigger in the SAME left track, so the phone layout is the identical grid
 * with a different left cell rather than a second layout to keep in sync.
 *
 * ── Motion ────────────────────────────────────────────────────────────────
 *
 * Seven things move, and none of them costs a re-render at input rate:
 *
 *   · the bar TIGHTENS on scroll — less padding, a smaller emblem
 *   · SCROLL PROGRESS runs along the bottom edge, written to a transform by
 *     `quickTo` (a `setState` per scroll event re-renders the whole masthead)
 *   · a pointer-tracked SPECULAR highlight, written to two custom properties
 *     the same way — this is the "liquid" in liquid glass
 *   · the links ARRIVE staggered, once, after the intro clears
 *   · a glass PILL slides between links as you move along them, carried by
 *     framer's `layoutId` so it animates from wherever it currently is
 *   · each label ROLLS vertically to its gold copy on hover
 *   · the emblem and the CTA arrow answer their own hovers
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";

import { INTRO, NAV_LINKS, SITE } from "@/constants";
import { Mark, SmoothLink } from "@/components/ui";
import { useIsomorphicLayoutEffect } from "@/hooks";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { introDelay, introHasPlayed, onIntroCleared } from "@/lib/intro";
import { setSmoothScrollPaused } from "@/lib/SmoothScrollProvider";
import { cn } from "@/utils/cn";

/** Links shown inline on desktop. Contact is the CTA, so it is excluded. */
const INLINE_LINKS = NAV_LINKS.filter((l) => l.href !== "#contact");

/**
 * Every link in the bar goes through <SmoothLink />, which is what makes an
 * in-page anchor scroll rather than jump AND what makes "About" still work from
 * /faq, where `#practice` does not exist. Two of them animate, so they need the
 * motion wrapper — see the note on `forwardRef` in that component.
 */
const MotionSmoothLink = motion.create(SmoothLink);

/**
 * ── The bar's own type ────────────────────────────────────────────────────
 *
 * `.font-label` is the site's label recipe (12px, 0.16em, uppercase, 600) and
 * everything in the bar uses it — but the masthead is the one place it needs
 * overriding, and it is worth saying why.
 *
 * The review was that the navigation "is not clearly visible". Two causes, both
 * of them structural rather than a matter of taste. Cormorant is a low-contrast
 * old-style face: its thin strokes land near a single pixel at 12px, and this
 * bar is genuine glass, so those strokes sit over whatever photograph happens
 * to be behind them rather than over a solid ground. And the labels were then
 * dimmed to 70–80% on top of that, which is a reasonable way to rank a link
 * below a heading and an unreasonable one when legibility is already marginal.
 *
 * So: 700 rather than 600 (loaded explicitly in app/layout.tsx — an unrequested
 * weight would have silently fallen back to 600 and changed nothing), the tint
 * dropped so labels sit at full ink, and a tight shadow over the dark bands to
 * separate type from image. The brand wordmark is deliberately untouched.
 */
const BAR_LABEL = "font-label font-bold";
/** Lifts 12px type off live photography without reading as a glow. */
const ON_IMAGE = "[text-shadow:0_1px_10px_rgba(10,10,9,0.55)]";

/**
 * Entrance: the bar's contents arrive in sequence after the intro clears.
 *
 * A FUNCTION rather than a constant, because the delay depends on whether the
 * intro is playing at all. It plays once per page load, so on a return to `/`
 * from another page there is no brand screen to wait behind — and a masthead
 * that still waited 1.7 seconds would leave a live page with no navigation on
 * it. See lib/intro.ts.
 */
const barContentsFor = (delay: number) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: delay + 0.35,
    },
  },
});

const barItem = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/**
 * Nav link with a vertical text-roll on hover, and the slot the sliding
 * glass pill occupies while this is the current item.
 */
function NavItem({
  label,
  href,
  active,
  indicated,
  onDark,
  onHover,
}: {
  label: string;
  href: string;
  active: boolean;
  indicated: boolean;
  onDark: boolean;
  onHover: (href: string | null) => void;
}) {
  return (
    <SmoothLink
      href={href}
      onPointerEnter={() => onHover(href)}
      onFocus={() => onHover(href)}
      onBlur={() => onHover(null)}
      className={cn("group relative block py-1.5 whitespace-nowrap", BAR_LABEL)}
    >
      {/* The sliding pill. One instance across the whole list — `layoutId`
          moves it from wherever it is to here, so it reads as one object
          travelling rather than as a highlight blinking between items.

          NEGATIVE insets rather than padding on the <a>. The pill has to be
          bigger than its label, and paying for that with `px-3` on the link
          widened all six of them by 24px each — enough to push the list back
          over its grid track and across the wordmark at 1280–1366. Being
          absolutely positioned, the pill can grow outside its anchor for
          free; the link keeps its text-width and the layout is unmoved. */}
      {indicated && (
        <motion.span
          aria-hidden
          layoutId="nav-pill"
          className={cn(
            "absolute -inset-x-1.5 -inset-y-0.5 -z-10 rounded-full",
            onDark
              ? "bg-cream/12 shadow-[inset_0_1px_0_rgba(246,242,233,0.22)]"
              : "bg-emerald/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]",
          )}
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
      )}

      {/* The roll. This wrapper must be BOTH `relative` and `overflow-hidden`:
          relative so it is the containing block for the incoming copy below
          (otherwise that copy resolves against the <a>, which is relative for
          the pill's sake, and escapes the clip entirely — printing a second
          row of labels under the bar), and overflow-hidden so the two copies
          are masked to one line's worth of space. It sits here rather than on
          the <a> because the pill has to paint outside the text's bounds. */}
      <span className="relative block overflow-hidden">
        <span
          className={cn(
            "block transition-transform duration-500 ease-editorial group-hover:translate-y-[-130%]",
            // Full ink, not 70–80% of it. Over glass at 12px the tint was
            // costing more legibility than it bought hierarchy; the roll to
            // gold on hover is what marks a link as live, and the gold `active`
            // state is what marks the current section.
            active ? "text-gold" : onDark ? "text-cream" : "text-emerald",
            onDark && ON_IMAGE,
          )}
        >
          {label}
        </span>
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 block translate-y-[130%] transition-transform duration-500 ease-editorial group-hover:translate-y-0",
            onDark ? "text-gold-soft" : "text-emerald",
            onDark && ON_IMAGE,
          )}
        >
          {label}
        </span>
      </span>
    </SmoothLink>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  /** Phone-width layout. Drives the emblem, which is sized in JS (see below). */
  const [compact, setCompact] = useState(false);
  /** Is the band currently behind the bar a dark one? Drives the palette. */
  const [onDark, setOnDark] = useState(true);
  /** Has the intro handed the brand over? See the note on the brand below. */
  const [brandReady, setBrandReady] = useState(introHasPlayed);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("");
  const [hovered, setHovered] = useState<string | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const specularRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  /** Coalesces pointermove writes to one per frame. */
  const specularFrame = useRef<number | null>(null);

  /**
   * ── One measurement per FRAME, and one layout read inside it ────────────
   *
   * This handler used to run on every scroll event and, each time, ask the
   * document three separate questions that can only be answered by laying the
   * page out: `window.innerWidth`, a `querySelectorAll` for the dark bands, and
   * a `getBoundingClientRect()` on every one of them. Scroll events fire at
   * input rate — faster than frames during a programmatic scroll — so that was
   * a forced synchronous layout several times a frame, each one potentially
   * followed by a React re-render of a masthead full of animated nodes. It is
   * the most expensive thing on the page during a scroll, and it was running
   * hardest exactly when a smooth scroll needed the frame budget most.
   *
   * Three changes, in order of what they save:
   *
   *   1. COALESCE to one measurement per animation frame. Extra scroll events
   *      within a frame are dropped rather than queued — the answer they would
   *      produce is the same one the frame is already about to compute.
   *   2. CACHE the dark bands' absolute positions instead of re-querying and
   *      re-measuring them. They only move when the page is re-laid out, so the
   *      cache is rebuilt on resize, on navigation, and on ScrollTrigger's own
   *      refresh — which is precisely when the pinned sections change the
   *      document's height and therefore everything below them.
   *   3. Read `innerWidth` on RESIZE only. It cannot change during a scroll.
   *
   * What is left per frame: `window.scrollY`, and one rect on the bar itself.
   */
  useIsomorphicLayoutEffect(() => {
    const bar = progressRef.current;
    // `quickTo` writes to an already-created tween, so this costs nothing per
    // scroll event — see the note at the top of the file.
    const setProgress = bar
      ? gsap.quickTo(bar, "scaleX", { duration: 0.25, ease: "power2" })
      : null;

    /** Absolute document-space ranges of the bands that want cream chrome. */
    let bands: Array<{ top: number; bottom: number }> = [];
    let scrollHeight = document.documentElement.scrollHeight;
    const measureBands = () => {
      const y = window.scrollY;
      bands = Array.from(
        document.querySelectorAll<HTMLElement>('[data-chrome="dark"]'),
      ).map((el) => {
        const r = el.getBoundingClientRect();
        return { top: r.top + y, bottom: r.bottom + y };
      });
      scrollHeight = document.documentElement.scrollHeight;
    };

    let frame = 0;

    const measure = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 40);

      const max = scrollHeight - window.innerHeight;
      setProgress?.(max > 0 ? Math.min(1, Math.max(0, y / max)) : 0);

      // Which band is under the bar? Compare the bar's box against the cached
      // ranges — no DOM query, no per-band measurement.
      const rect = navRef.current?.getBoundingClientRect();
      if (rect) {
        const top = rect.top + y;
        const bottom = rect.bottom + y;
        setOnDark(bands.some((b) => b.top < bottom && b.bottom > top));
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    const onResize = () => {
      setCompact(window.innerWidth < 640);
      measureBands();
      onScroll();
    };

    onResize();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    // ScrollTrigger re-measures on load, on resize and whenever a pinned
    // section's dimensions change; the band cache has to follow it or the bar
    // keeps flipping palette against stale positions.
    ScrollTrigger.addEventListener("refresh", measureBands);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ScrollTrigger.removeEventListener("refresh", measureBands);
    };
    // Re-run on navigation: the dark bands are different on every page, and a
    // client-side route change does not scroll, so nothing would otherwise
    // re-measure them and the bar would keep the palette of the page it left.
  }, [pathname]);

  // Scroll-spy: mark the nav link whose section is currently in view.
  // Route links (/faq) have no section to observe and are simply skipped.
  useIsomorphicLayoutEffect(() => {
    const sections = NAV_LINKS.filter((l) => l.href.startsWith("#"))
      .map((l) => document.getElementById(l.href.slice(1)))
      .filter((el): el is HTMLElement => Boolean(el));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // Same reason as above: which of these sections exist depends on the page.
  }, [pathname]);

  // The index is a full-screen overlay, so the page behind it must not move.
  // Escape closes it, which is the one keyboard affordance a modal owes you.
  useEffect(() => {
    setSmoothScrollPaused(menuOpen);
    if (!menuOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      setSmoothScrollPaused(false);
    };
  }, [menuOpen]);

  /** Park the specular under the pointer, at most once per frame. */
  const onPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const el = specularRef.current;
    if (!el || e.pointerType !== "mouse") return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (specularFrame.current !== null) return;
    specularFrame.current = requestAnimationFrame(() => {
      specularFrame.current = null;
      el.style.setProperty("--gx", `${x}px`);
      el.style.setProperty("--gy", `${y}px`);
      el.style.opacity = "1";
    });
  }, []);

  const onPointerLeave = useCallback(() => {
    const el = specularRef.current;
    if (el) el.style.opacity = "0";
    setHovered(null);
  }, []);

  useEffect(
    () => () => {
      if (specularFrame.current !== null)
        cancelAnimationFrame(specularFrame.current);
    },
    [],
  );

  /**
   * A section link is current when its section is in view; a ROUTE link is
   * current when you are on it. The second half was missing, so /faq — the one
   * nav item that is a page rather than a section — was the only link in the bar
   * that never lit up, including while you were standing on it.
   */
  /**
   * How long the bar waits before arriving. Read at render time rather than
   * baked into the variants — see the note on `barContentsFor`.
   */
  const introWait = introDelay(INTRO.navbarMs);

  /**
   * ── The brand must never be able to stay hidden ─────────────────────
   *
   * It waits for the intro to fly it in, and `onIntroCleared` only ever fires
   * for a load that actually PLAYED an intro. <LoadingScreen /> is rendered
   * from `app/page.tsx` alone — so on `/faq`, on `/photography`, and on any
   * direct load of a route without one, that signal never comes and the brand
   * would sit at opacity 0 for the whole visit.
   *
   * Two ways out, because this is the site's name and it failing open is not
   * acceptable:
   *
   *   · no `[data-intro]` in the DOM means nothing is going to deliver it, so
   *     show it on the spot. That covers every route but `/`
   *   · a timer past the latest the intro could possibly finish, in case one is
   *     present but never completes
   */
  useEffect(() => {
    if (brandReady) return;

    if (!document.querySelector("[data-intro]")) {
      setBrandReady(true);
      return;
    }

    const off = onIntroCleared(() => setBrandReady(true));
    const failsafe = window.setTimeout(
      () => setBrandReady(true),
      INTRO.clearedMs + INTRO.revealWaitCapMs + 600,
    );

    return () => {
      off();
      window.clearTimeout(failsafe);
    };
  }, [brandReady]);

  const isActive = (href: string) =>
    href.startsWith("#") ? activeId === href.slice(1) : pathname === href;

  // The emblem is sized by a prop rather than a class, because <Mark /> pins
  // width/height inline so `size` stays authoritative (see that component).
  // That means the responsive step has to happen here in JS.
  const markSize = compact ? (scrolled ? 26 : 30) : scrolled ? 32 : 38;

  // The pill follows the pointer, and parks on the current section when the
  // pointer is elsewhere.
  const activeHref = INLINE_LINKS.find((l) => isActive(l.href))?.href ?? null;
  const indicatedHref = hovered ?? activeHref;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      /* Timed to `INTRO.navbarMs`, so the bar is already at rest behind the
         intro screen rather than fading in over a live page — and timed to
         nothing at all when the intro is not playing. */
      transition={{
        delay: introWait,
        duration: 0.9,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 px-3 transition-[padding] duration-500 ease-editorial sm:px-4 md:px-6 lg:px-8",
        scrolled ? "pt-2 md:pt-3" : "pt-3 md:pt-5",
      )}
    >
      <motion.nav
        ref={navRef}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        variants={barContentsFor(introWait)}
        initial="hidden"
        animate="visible"
        className={cn(
          // `overflow-hidden` keeps the sheen, the specular and the progress
          // hairline inside the rounded shape — without it each one paints
          // square corners back on.
          "relative mx-auto grid max-w-[1560px] grid-cols-[1fr_auto_1fr] items-center gap-2 overflow-hidden rounded-[18px] px-3 transition-[padding,border-color,background-color,box-shadow] duration-700 ease-editorial sm:gap-4 sm:px-4 md:px-6",
          "glass-bar border",
          onDark
            ? "glass-bar-dark border-cream/18"
            : "glass-bar-light border-emerald/12",
          onDark && scrolled && "border-cream/24",
          scrolled ? "py-2" : "py-2.5 md:py-3.5",
        )}
      >
        {/* Glass layers. Both are inert and sit under the content. */}
        <span
          aria-hidden
          className={cn(
            "glass-sheen pointer-events-none absolute inset-0 z-0 transition-opacity duration-700",
            onDark ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          ref={specularRef}
          aria-hidden
          style={{ opacity: 0 }}
          className={cn(
            "pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 ease-editorial",
            onDark ? "glass-specular" : "glass-specular-light",
          )}
        />

        {/* ── Left track: the links on desktop, the trigger on a phone ───── */}
        <div className="relative z-10 flex min-w-0 items-center justify-start">
          {/* `xl`, not `lg`. The six labels need ~440px and the left track is
              only `(bar - brand) / 2` wide, which at 1024–1280 is 300–430px —
              so at `lg` the list used to overrun its track and paint itself
              across the wordmark. It is the one measurement in this bar that
              cannot be reasoned about from the markup, so: below 1280 the
              trigger is the navigation, and the full index is one tap away. */}
          <ul className="hidden list-none items-center gap-4 p-0 xl:flex 2xl:gap-6">
            {INLINE_LINKS.map((link) => (
              <motion.li key={link.href} variants={barItem}>
                <NavItem
                  label={link.label}
                  href={link.href}
                  active={isActive(link.href)}
                  indicated={indicatedHref === link.href}
                  onDark={onDark}
                  onHover={setHovered}
                />
              </motion.li>
            ))}
          </ul>

          {/* Below `xl` this trigger IS the navigation, so it goes with the
              links. That does mean the opening screen offers no way to navigate
              on a phone except the invitation — which is what was asked for, and
              is survivable because the very next scroll brings it back. */}
          <motion.button
            variants={barItem}
            type="button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className={cn(
              "group flex size-9 shrink-0 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-full border transition-colors duration-500 ease-editorial xl:hidden",
              onDark
                ? "border-cream/20 hover:bg-cream/10"
                : "border-emerald/15 hover:bg-emerald/6",
            )}
          >
            {/* Two rules of unequal length that swap on hover — the bar's
                quietest animation, and the only one on the trigger. */}
            <span
              className={cn(
                "block h-px w-4 transition-all duration-500 ease-editorial group-hover:w-5",
                onDark ? "bg-cream" : "bg-emerald",
              )}
            />
            <span
              className={cn(
                "block h-px w-5 transition-all duration-500 ease-editorial group-hover:w-3",
                onDark ? "bg-cream" : "bg-emerald",
              )}
            />
          </motion.button>
        </div>

        {/* ── Centre track: the brand ─────────────────────────────────────
            Centred by the grid, not by absolute positioning — see the note
            at the top of the file. `min-w-0` lets this track give way before
            it can push the edge controls off the bar. */}
        {/* ── It is not visible until the intro has delivered it ─────────
            The loader flies its own copy of the mark and the wordmark into
            exactly this spot and fades it out on arrival. If this one were
            already painted underneath, the last frame of that flight would be
            two overlapping wordmarks — so it holds at zero until the intro
            signals cleared, and the two crossfade at the same position and
            scale, which is invisible.

            `brandReady` is true from the first render when the intro is not
            playing at all (a return visit, or any route that is not `/`). */}
        <MotionSmoothLink
          variants={barItem}
          href="#hero"
          aria-label={`${SITE.name} — back to top`}
          style={{ opacity: brandReady ? 1 : 0 }}
          className="group relative z-10 flex min-w-0 items-center justify-center gap-2 sm:gap-3 transition-opacity duration-300 ease-out"
        >
          {/* `data-brand-mark` / `data-brand-name` are what <LoadingScreen />
              measures to fly its own mark and wordmark into this position at
              the end of the intro — see the note there. They are attributes
              rather than refs because the two components never meet: the
              loader is a sibling, mounted and unmounted on its own clock. */}
          <span
            data-brand-mark
            className="inline-flex shrink-0 transition-transform duration-700 ease-editorial group-hover:scale-108"
          >
            <Mark size={markSize} priority />
          </span>
          {/* The name carries the brand, so it is set to be read: a full
              weight, and a size that holds its own against the section
              headings further down the page. `whitespace-nowrap` guarantees
              the single line the brief asked for at every width — it scales
              down on a phone rather than wrapping or disappearing.

              Champagne over a dark band; emerald over a light one, because
              gold display type on cream is about 2:1 contrast, which is the
              reason gold is not a text colour on this site. */}
          <span
            data-brand-name
            className={cn(
              "block font-display text-[0.72rem] leading-none font-semibold tracking-[0.015em] whitespace-nowrap transition-all duration-700 ease-editorial group-hover:opacity-80 min-[360px]:text-[0.82rem] min-[400px]:text-[0.92rem] sm:text-[1.15rem] lg:text-[1.4rem]",
              onDark ? "text-gold-soft" : "text-emerald",
            )}
          >
            {SITE.name}
          </span>
        </MotionSmoothLink>

        {/* ── Right track: the one CTA ────────────────────────────────────
            A pill, and the only one on the bar — the shape is what marks it
            as the thing you press. The label drops below `sm` and the arrow
            carries it alone, so the control stays a 36px tap target on a
            360px phone instead of crowding the brand. */}
        <div className="relative z-10 flex min-w-0 items-center justify-end">
          <MotionSmoothLink
            variants={barItem}
            href="#contact"
            aria-label="Enquire"
            className={cn(
              "group relative inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-full border px-2.5 py-2 transition-colors duration-500 ease-editorial sm:px-5 sm:py-2.5",
              BAR_LABEL,
              onDark
                ? "border-gold/50 text-gold-soft hover:text-emerald"
                : "border-emerald/25 text-emerald hover:text-cream",
            )}
          >
            {/* Gold on dark, emerald on light — the fill sweeps up from the
                bottom edge rather than switching, so the control resolves
                into a solid button instead of blinking into one. */}
            <span
              aria-hidden
              className={cn(
                "absolute inset-0 -z-10 origin-bottom scale-y-0 transition-transform duration-500 ease-editorial group-hover:scale-y-100",
                onDark ? "bg-gold" : "bg-emerald",
              )}
            />
            <span className="hidden sm:inline">Enquire</span>
            <FiArrowUpRight
              size={14}
              aria-hidden
              className="shrink-0 transition-transform duration-500 ease-editorial group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </MotionSmoothLink>
        </div>

        {/* Scroll progress — the bar's own bottom edge. */}
        <div
          ref={progressRef}
          aria-hidden
          className={cn(
            "absolute inset-x-0 bottom-0 z-10 h-px origin-left scale-x-0",
            onDark ? "bg-gold/70" : "bg-emerald/45",
          )}
        />
      </motion.nav>

      {/* ── Full-screen index ────────────────────────────────────────────
          Deliberately NOT the transparent glass the bar is made of: this one
          has to hold seven 32–60px words over whatever section you happened
          to open it on, and a 14% veil cannot do that. It is the SAGE surface
          the site uses for its full-bleed panels — it was the dark emerald
          one until the site went light throughout — with the blur kept so the
          page still reads faintly behind it.
          `data-lenis-prevent` keeps this subtree scrollable while the page
          underneath is frozen. */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            data-lenis-prevent
            className="glass-bar fixed inset-0 z-50 flex flex-col overflow-y-auto overscroll-contain bg-paper text-charcoal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex shrink-0 items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5 md:px-10">
              <span className="flex min-w-0 items-center gap-3">
                <Mark size={30} />
                <span className="truncate font-display text-[0.95rem] leading-none font-semibold tracking-[0.015em] text-emerald sm:text-[1.15rem]">
                  {SITE.name}
                </span>
              </span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="group relative size-10 shrink-0 cursor-pointer rounded-full border border-emerald/20 transition-colors duration-500 ease-editorial hover:bg-emerald/6"
              >
                <span className="absolute top-1/2 left-1/2 block h-px w-5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-emerald transition-colors duration-500 group-hover:bg-gold-ink" />
                <span className="absolute top-1/2 left-1/2 block h-px w-5 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-emerald transition-colors duration-500 group-hover:bg-gold-ink" />
              </button>
            </div>

            <motion.ul
              className="flex flex-1 list-none flex-col justify-center gap-3 p-0 px-5 py-6 sm:gap-4 sm:px-6 md:gap-5 md:px-14"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: { staggerChildren: 0.06, delayChildren: 0.12 },
                },
              }}
            >
              {NAV_LINKS.map((link, i) => (
                <motion.li
                  key={link.href}
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  {/* ── Order matters here, and it is not obvious ──────────
                      <SmoothLink /> runs this handler and THEN starts its
                      tween, which is why the overlay is dismissed here: an
                      index still covering the screen would hide the whole
                      journey.

                      The freeze has to be released in the same breath, and
                      BEFORE the tween begins. Lenis's `start()` calls
                      `reset()`, which snaps its animated position back to the
                      real one and kills whatever is in flight — so releasing it
                      the way it normally happens, in the effect cleanup after
                      React commits `menuOpen: false`, landed mid-tween and
                      dropped the page back where it started. Tapping an index
                      entry closed the menu and went nowhere.

                      Released first, the tween starts against a live Lenis and
                      the cleanup's release becomes the no-op it should be —
                      `start()` returns early when it is already running. */}
                  <SmoothLink
                    href={link.href}
                    onClick={() => {
                      setSmoothScrollPaused(false);
                      setMenuOpen(false);
                    }}
                    className="group flex items-baseline gap-4 md:gap-8"
                  >
                    <span className="font-label text-gold-ink/75">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-serif text-[2rem] leading-[1.15] text-emerald transition-all duration-500 ease-editorial group-hover:translate-x-2 group-hover:text-gold-ink sm:text-4xl md:text-6xl">
                      {link.label}
                    </span>
                  </SmoothLink>
                </motion.li>
              ))}
            </motion.ul>

            <div className="flex shrink-0 flex-col gap-2 border-t border-emerald/15 px-5 py-6 sm:px-6 md:flex-row md:items-center md:justify-between md:px-14 md:py-7">
              <a
                href={`mailto:${SITE.email}`}
                className="font-label text-gold-ink transition-colors duration-500 hover:text-emerald"
              >
                {SITE.email}
              </a>
              <span className="font-label text-charcoal/50">
                {SITE.address}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
