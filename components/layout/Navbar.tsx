"use client";

/**
 * Navbar — a floating inset masthead.
 *
 *   ┌──────────────────────────────────────────────────────────────────┐
 *   │ ABOUT  WHY US  …   [mark] Aarnaa Design Studios      [ENQUIRE]   │
 *   └──────────────────────────────────────────────────────────────────┘
 *      ↑ inset from all three edges; photography runs behind and around it
 *
 * ── Why this shape ────────────────────────────────────────────────────────
 *
 * Three previous versions each failed for a nameable reason. Transparent over
 * the hero: illegible, because the frame behind it changes every five seconds.
 * Frosted-to-cream on scroll: the masthead changed colour scheme halfway down
 * the page and the wordmark had to change with it. A full-width solid emerald
 * bar: legible, but a saturated green band welded across the top of every
 * screen, which is a large amount of the loudest colour in the palette sitting
 * permanently in the visitor's eyeline.
 *
 * A floating inset bar solves all three at once. It keeps its own ground, so
 * legibility never depends on the photograph. It never changes colour. And
 * because it is inset rather than full-bleed, the imagery runs past it on all
 * sides — the page reads as one continuous full-bleed canvas with a small
 * object resting on it, rather than as a header stacked above content.
 *
 * ── The details that make it read as expensive ────────────────────────────
 *
 * SQUARE CORNERS. The floating-island pattern is usually drawn as a rounded
 * pill, which is the single fastest way to make an architecture studio look
 * like a SaaS product. Architecture reads sharp.
 *
 * NEUTRAL GLASS, NOT GREEN. The ground is `--color-ink` — a true neutral — so
 * it darkens what is behind it without tinting it, the same correction applied
 * to every scrim on the site. A gold hairline draws the edge; the brand is
 * present as a line, not as a fill. See the note on the opacity itself, which
 * is high on purpose.
 *
 * BRAND CENTRED, AND LOUD. The name sits on the page's axis and is the largest
 * thing in the chrome — set in champagne rather than the deeper logo gold,
 * which loses too much contrast against a dark ground at this size. It is
 * positioned absolutely on the bar rather than laid out between the two
 * groups, so it stays on the true centre line however wide the links get.
 * (An earlier pass put it top-left, on the reasoning that symmetrical
 * mastheads read institutional. Overruled: the studio wants its name read.)
 *
 * A SCROLL PROGRESS HAIRLINE runs along the bar's bottom edge. It is the only
 * moving element in the chrome, it tells you where you are in a long page, and
 * it costs one transform.
 *
 * ── Motion ────────────────────────────────────────────────────────────────
 *
 * The bar tightens on scroll: less padding, a smaller emblem, a stronger
 * hairline. Progress is written straight to a transform via `quickTo` rather
 * than through React state — a `setState` per scroll event re-renders the
 * whole masthead at scroll rate.
 */
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";

import { INTRO, NAV_LINKS, SITE } from "@/constants";
import { Mark } from "@/components/ui";
import { useIsomorphicLayoutEffect } from "@/hooks";
import { gsap } from "@/lib/gsap";
import { cn } from "@/utils/cn";

/** Links shown inline on desktop. Contact is the CTA, so it is excluded. */
const INLINE_LINKS = NAV_LINKS.filter((l) => l.href !== "#contact");

/** Nav link with a vertical text-roll on hover. */
function NavItem({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <a
      href={href}
      className="group relative block overflow-hidden py-1 font-label text-[12px] tracking-[0.16em] whitespace-nowrap uppercase"
    >
      <span
        className={cn(
          "block transition-transform duration-500 ease-editorial group-hover:translate-y-[-130%]",
          active ? "text-gold" : "text-cream/70"
        )}
      >
        {label}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 block translate-y-[130%] py-1 text-gold transition-transform duration-500 ease-editorial group-hover:translate-y-0"
      >
        {label}
      </span>
    </a>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("");
  const progressRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const bar = progressRef.current;
    // `quickTo` writes to an already-created tween, so this costs nothing per
    // scroll event — see the note at the top of the file.
    const setProgress = bar
      ? gsap.quickTo(bar, "scaleX", { duration: 0.25, ease: "power2" })
      : null;

    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);

      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress?.(max > 0 ? Math.min(1, Math.max(0, y / max)) : 0);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

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
      { rootMargin: "-30% 0px -60% 0px" }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const isActive = (href: string) =>
    href.startsWith("#") && activeId === href.slice(1);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      /* Timed to `INTRO.navbarMs`, so the bar is already at rest behind the
         intro screen rather than fading in over a live page. */
      transition={{
        delay: INTRO.navbarMs / 1000,
        duration: 0.9,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 px-4 transition-[padding] duration-500 ease-editorial md:px-6 lg:px-8",
        scrolled ? "pt-3" : "pt-4 md:pt-5"
      )}
    >
      <nav
        className={cn(
          // Square corners, neutral glass, gold hairline — see the notes above.
          //
          // The ground is nearly opaque (88%) rather than a light 60% veil,
          // and that is a correction rather than a preference. A 60% dark
          // glass reads beautifully over the hero photograph and turns into a
          // muddy olive-grey smear the moment it crosses a cream section —
          // which is most of this page. At 88% it stops being a translucent
          // film and becomes a deliberate dark object resting on the page, so
          // it looks the same over a photograph, over cream and over stone.
          "relative mx-auto flex max-w-[1560px] items-center justify-between gap-6 border bg-ink/88 px-5 backdrop-blur-xl transition-all duration-500 ease-editorial md:px-7",
          scrolled
            ? "border-gold/25 py-2.5 shadow-[0_14px_44px_-14px_rgba(10,10,9,0.75)]"
            : "border-gold/15 py-3.5"
        )}
      >
        {/* Links — left track. */}
        <ul className="hidden list-none items-center gap-7 p-0 lg:flex xl:gap-9">
          {INLINE_LINKS.map((link) => (
            <li key={link.href}>
              <NavItem
                label={link.label}
                href={link.href}
                active={isActive(link.href)}
              />
            </li>
          ))}
        </ul>

        {/* ── Brand — the centre track ─────────────────────────────────────
            Absolutely positioned and centred on the BAR, not placed between
            the two link groups. That distinction is the whole point: laid out
            in flow, the lockup sits at the midpoint of whatever space the
            links happen to leave, so it drifts left or right as soon as a
            label is added or the active state changes width. Centring it on
            the bar itself pins it to the page's true axis and keeps it there.

            `pointer-events-none` on the wrapper with `pointer-events-auto` on
            the link: the wrapper spans the full bar width, and without this it
            would sit over the nav links and swallow their clicks. */}
        <a
          href="#hero"
          aria-label={`${SITE.name} — back to top`}
          // `px-14` is a collision guard, not spacing. The wrapper spans the
          // whole bar, so without it the centred lockup is free to grow under
          // the menu trigger at the right edge — which it does on a 360px
          // phone, where the name is ~175px wide and the trigger is 40px. The
          // padding keeps the centred content inside a box that both edge
          // controls sit outside of.
          className="pointer-events-none absolute inset-x-0 flex items-center justify-center gap-3 px-14 transition-opacity duration-500 hover:opacity-85"
        >
          <span className="pointer-events-auto inline-flex shrink-0">
            <Mark size={scrolled ? 34 : 40} priority />
          </span>
          {/* Set to be read, not to be tasteful about it: champagne rather
              than the deeper logo gold (which loses too much against a dark
              ground at this size), a full weight, and a size that holds its
              own against the section headings further down the page.
              `whitespace-nowrap` guarantees the single line the brief asked
              for at every width — it scales down on a phone rather than
              wrapping or disappearing. */}
          <span className="pointer-events-auto block font-display text-[0.95rem] leading-none font-semibold tracking-[0.015em] whitespace-nowrap text-gold-soft transition-all duration-500 ease-editorial sm:text-[1.3rem] lg:text-[1.5rem]">
            {SITE.name}
          </span>
        </a>

        {/* Actions — right track. `ml-auto` pushes this to the far edge on
            the widths where the left link list is hidden. */}
        <div className="ml-auto flex shrink-0 items-center gap-3">
          {/* The one CTA. Square, hairline, fills gold on hover. */}
          <a
            href="#contact"
            className="group hidden items-center gap-2 border border-gold/45 px-5 py-2.5 font-label text-[12px] tracking-[0.16em] uppercase text-gold transition-colors duration-500 ease-editorial hover:bg-gold hover:text-emerald sm:inline-flex"
          >
            Enquire
            <FiArrowUpRight
              size={14}
              aria-hidden
              className="transition-transform duration-500 ease-editorial group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>

          {/* Menu trigger. Present at every width — below lg it is the only
              navigation, and at lg+ it still opens the full index, which is
              where the sections that do not fit inline live. */}
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="group flex size-10 cursor-pointer flex-col items-center justify-center gap-1.25 lg:hidden"
          >
            <span className="block h-px w-5 bg-cream transition-transform duration-500 ease-editorial group-hover:w-6" />
            <span className="block h-px w-5 bg-cream transition-transform duration-500 ease-editorial group-hover:w-3.5" />
          </button>
        </div>

        {/* Scroll progress — the bar's own bottom edge. */}
        <div
          ref={progressRef}
          aria-hidden
          className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-gold/70"
        />
      </nav>

      {/* Full-screen index */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="surface-emerald fixed inset-0 z-50 flex flex-col text-cream"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between px-6 py-5 md:px-10">
              <span className="flex items-center gap-3">
                <Mark size={34} />
                <span className="font-display text-[1.05rem] leading-none tracking-[0.01em] text-gold">
                  {SITE.name}
                </span>
              </span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="group relative size-10 cursor-pointer"
              >
                <span className="absolute top-1/2 left-1/2 block h-px w-5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-cream transition-colors duration-500 group-hover:bg-gold" />
                <span className="absolute top-1/2 left-1/2 block h-px w-5 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-cream transition-colors duration-500 group-hover:bg-gold" />
              </button>
            </div>

            <motion.ul
              className="flex flex-1 list-none flex-col justify-center gap-4 p-0 px-6 md:gap-5 md:px-14"
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
                  <a
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="group flex items-baseline gap-5 md:gap-8"
                  >
                    <span className="font-label text-[12px] tracking-[0.16em] text-gold/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-serif text-4xl leading-[1.15] font-light transition-colors duration-500 group-hover:text-gold md:text-6xl">
                      {link.label}
                    </span>
                  </a>
                </motion.li>
              ))}
            </motion.ul>

            <div className="flex flex-col gap-2 border-t border-cream/15 px-6 py-7 md:flex-row md:items-center md:justify-between md:px-14">
              <a
                href={`mailto:${SITE.email}`}
                className="font-label text-[12px] tracking-[0.16em] uppercase text-gold"
              >
                {SITE.email}
              </a>
              <span className="font-label text-[12px] tracking-[0.16em] uppercase text-cream/50">
                {SITE.address}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
