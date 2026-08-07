"use client";

/**
 * Navbar — a symmetric editorial masthead: the brand lockup centred and given
 * real scale, with the six links split evenly to either side of it.
 *
 *      ABOUT  WHY US  SERVICES        [emblem] Aarnaa        PROJECTS  PROCESS  CONTACT
 *                                              DESIGN STUDIOS
 *
 * The lockup is the focal point rather than one item competing in a row, which
 * is why it is centred and set two to three times the size of the links: at
 * this scale the emblem and the name read as the studio's signature, the way a
 * masthead does on a printed cover.
 *
 * Bulk is avoided in the chrome, not in the brand. There is no pill, no border
 * box, no shadow and no inset margin — over the hero the bar is pure content on
 * the hero's own top scrim, and the only rule appears once it has frosted to
 * cream. On scroll the whole lockup eases down to 84% and the bar's padding
 * tightens with it, so the masthead has full presence at rest and gets out of
 * the way while reading.
 *
 * Colour: the wordmark is the logo gold over the hero and emerald once the bar
 * frosts — gold on cream is far too low-contrast to read.
 *
 * Link hover = vertical text-roll: the label slides up and out while a gold
 * copy rolls in from below (mask via overflow-hidden). The active section's
 * label stays gold.
 *
 * Also: scroll-spy, and an entrance timed after the loading screen lifts.
 *
 * TODO (future phases): use the Lenis instance for smooth anchor scrolling.
 */
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";

import { INTRO, NAV_LINKS, SITE } from "@/constants";
import { Mark } from "@/components/ui";
import { useIsomorphicLayoutEffect } from "@/hooks";
import { cn } from "@/utils/cn";

// Split the six links evenly so the centred lockup sits on the page's axis.
const HALF = Math.ceil(NAV_LINKS.length / 2);
const LEFT_LINKS = NAV_LINKS.slice(0, HALF);
const RIGHT_LINKS = NAV_LINKS.slice(HALF);

/** Nav link with a vertical text-roll on hover (gold copy rolls up from below). */
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
      className="group relative block overflow-hidden py-1 font-mono text-[0.62rem] uppercase tracking-[0.2em] whitespace-nowrap md:text-[0.68rem]"
    >
      {/* Outgoing label (rolls up on hover). */}
      <span
        className={cn(
          "block transition-transform duration-500 ease-editorial group-hover:-translate-y-[130%]",
          active ? "text-gold" : "opacity-70"
        )}
      >
        {label}
      </span>
      {/* Incoming gold label (rolls in from below). */}
      <span
        aria-hidden
        className="absolute inset-0 block translate-y-[130%] py-1 text-gold transition-transform duration-500 ease-editorial group-hover:translate-y-0"
      >
        {label}
      </span>
    </a>
  );
}

/** Emblem height in the resting bar, in px. `compact` scales down from this. */
const MARK_SIZE = 56;
/** How much the lockup shrinks once the bar has frosted. */
const COMPACT_SCALE = 0.78;

/**
 * The brand lockup: emblem beside a stacked wordmark, mirroring the logo file's
 * own composition. Shared by the bar and the mobile overlay so the two can
 * never drift apart.
 *
 * `compact` is the scrolled state. It does two things at once, and needs both:
 *
 *  - a transform scale on the lockup, because that is the only way to *animate*
 *    the change (the emblem's size is a pixel dimension, not a length that
 *    transitions), and
 *  - a height on the wrapper, because a transform doesn't touch layout — scaling
 *    alone left a full-size box behind and the "compact" bar was barely shorter
 *    than the resting one.
 *
 * The scaled lockup is a couple of px taller than the compact wrapper; it is
 * centred and nothing clips it, so that slack just reads as breathing room.
 */
function BrandLockup({
  scrolled,
  compact = false,
  onClick,
}: {
  scrolled: boolean;
  compact?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center transition-[height] duration-700 ease-editorial",
        compact ? "h-11" : "h-14"
      )}
    >
      <a
        href="#hero"
        onClick={onClick}
        aria-label={`${SITE.name} — back to top`}
        className="flex origin-center items-center gap-3.5 transition-transform duration-700 ease-editorial md:gap-4"
        style={compact ? { transform: `scale(${COMPACT_SCALE})` } : undefined}
      >
        <Mark size={MARK_SIZE} priority className="shrink-0" />
        <span className="flex flex-col items-start justify-center leading-none">
          <span
            className={cn(
              "font-serif text-[1.75rem] font-semibold leading-[0.95] tracking-tight transition-colors duration-500 md:text-[2.1rem]",
              scrolled
                ? "text-emerald"
                : "text-gold [text-shadow:0_1px_18px_rgba(6,41,28,0.8)]"
            )}
          >
            {SITE.shortName}
          </span>
          <span
            className={cn(
              "mt-[0.42rem] font-mono text-[8px] uppercase leading-none tracking-[0.38em] transition-colors duration-500 md:text-[9px]",
              scrolled ? "text-charcoal/50" : "text-cream/75"
            )}
          >
            Design Studios
          </span>
        </span>
      </a>
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("");

  useIsomorphicLayoutEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy: mark the nav link whose section is currently in view.
  useIsomorphicLayoutEffect(() => {
    const ids = NAV_LINKS.map((l) => l.href.replace("#", ""));
    const sections = ids
      .map((id) => document.getElementById(id))
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

  const isActive = (href: string) => activeId === href.replace("#", "");

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      /* Timed to `INTRO.landedMs` — the moment the intro's phoenix leaves the
         frame — so the emblem arriving up here reads as the same bird landing
         rather than as a new element fading in. */
      transition={{
        delay: INTRO.landedMs / 1000,
        duration: 0.9,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <nav
        className={cn(
          "relative flex w-full items-center justify-center border-b px-6 transition-all duration-500 ease-editorial md:px-10 lg:px-16",
          scrolled
            ? "border-charcoal/10 bg-cream/85 py-2.5 text-charcoal backdrop-blur-xl"
            : "border-transparent py-4 text-cream md:py-5"
        )}
      >
        {/* Desktop: links | lockup | links on three tracks, so the lockup lands
            on the page's centre line regardless of how wide the link groups
            are. The outer tracks are equal-width, which is what keeps it
            optically centred rather than merely between the two groups. */}
        <div className="hidden w-full max-w-360 grid-cols-[1fr_auto_1fr] items-center gap-10 lg:grid">
          <ul className="flex list-none items-center justify-start gap-7 p-0 xl:gap-9">
            {LEFT_LINKS.map((link) => (
              <li key={link.href}>
                <NavItem
                  label={link.label}
                  href={link.href}
                  active={isActive(link.href)}
                />
              </li>
            ))}
          </ul>

          <BrandLockup scrolled={scrolled} compact={scrolled} />

          <ul className="flex list-none items-center justify-end gap-7 p-0 xl:gap-9">
            {RIGHT_LINKS.map((link) => (
              <li key={link.href}>
                <NavItem
                  label={link.label}
                  href={link.href}
                  active={isActive(link.href)}
                />
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile / tablet: the lockup stays centred and the trigger is taken
            out of flow, so the brand is on the axis here too. */}
        <div className="flex w-full items-center justify-center lg:hidden">
          <BrandLockup scrolled={scrolled} compact={scrolled} />
          <button
            type="button"
            aria-label="Open menu"
            className="absolute right-6 md:right-10"
            onClick={() => setMenuOpen(true)}
          >
            <FiMenu size={22} />
          </button>
        </div>
      </nav>

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="surface-emerald fixed inset-0 z-50 flex flex-col text-cream lg:hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="relative flex items-center justify-center px-6 py-4">
              {/* `scrolled={false}` on purpose: the overlay is a dark surface, so
                  the lockup keeps its gold-on-emerald treatment here. */}
              <BrandLockup scrolled={false} onClick={() => setMenuOpen(false)} />
              <button
                type="button"
                aria-label="Close menu"
                className="absolute right-6"
                onClick={() => setMenuOpen(false)}
              >
                <FiX size={22} />
              </button>
            </div>
            <motion.ul
              className="flex flex-1 list-none flex-col justify-center gap-6 p-0 px-6 text-center"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
              }}
            >
              {NAV_LINKS.map((link) => (
                <motion.li
                  key={link.href}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                >
                  <a
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="font-serif text-4xl"
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </motion.ul>

            <div className="flex justify-center px-6 pb-10">
              <a
                href="#contact"
                onClick={() => setMenuOpen(false)}
                className="inline-flex border border-cream/40 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors hover:bg-gold hover:text-emerald"
              >
                Enquire
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
