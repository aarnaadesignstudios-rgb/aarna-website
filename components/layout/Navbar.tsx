"use client";

/**
 * Navbar — a symmetric editorial masthead on its own solid panel.
 *
 *      ABOUT  WHY US  SERVICES    [emblem] Aarnaa Design Studios    PROJECTS  PROCESS  FAQ  CONTACT
 *
 * ── What changed in the client review ─────────────────────────────────────
 *
 * 1. THE PANEL. The bar used to float transparently over the hero photograph
 *    and only frost to cream once you scrolled. That meant the logo and the
 *    links sat on whatever the image happened to be doing behind them — a
 *    bright ceiling in one frame, a dark wall in the next — and legibility
 *    changed as the hero cycled. The client asked for a panel; the bar now has
 *    a solid emerald ground from the very first paint, so the masthead always
 *    has a clean field under it. Scrolling only tightens the padding.
 *
 * 2. THE NAME ON ONE LINE. It was "Aarnaa" set large over a letter-spaced
 *    "DESIGN STUDIOS". The client flagged this twice — wrong font, and the
 *    name is to read on one line. It is now the full name, once, in the
 *    display serif.
 *
 * Because the panel is opaque emerald in both states, the wordmark no longer
 * has to change colour on scroll. One less state, and the brand stops changing
 * colour while you read.
 *
 * Link hover is a vertical text-roll: the label slides up and out while a gold
 * copy rolls in from below (masked by overflow-hidden). The active section's
 * label stays gold.
 *
 * Also: scroll-spy, and an entrance timed to the loading screen.
 */
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";

import { INTRO, NAV_LINKS, SITE } from "@/constants";
import { Mark } from "@/components/ui";
import { useIsomorphicLayoutEffect } from "@/hooks";
import { cn } from "@/utils/cn";

// Split the links evenly so the centred lockup sits on the page's axis.
const HALF = Math.ceil(NAV_LINKS.length / 2);
const LEFT_LINKS = NAV_LINKS.slice(0, HALF);
const RIGHT_LINKS = NAV_LINKS.slice(HALF);

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
      className="group relative block overflow-hidden py-1 font-label text-[0.68rem] uppercase tracking-[0.16em] whitespace-nowrap md:text-[0.72rem]"
    >
      {/* Outgoing label (rolls up on hover). */}
      <span
        className={cn(
          "block transition-transform duration-500 ease-editorial group-hover:translate-y-[-130%]",
          active ? "text-gold" : "text-cream/75"
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
const MARK_SIZE = 44;
/** How much the lockup shrinks once the bar has tightened. */
const COMPACT_SCALE = 0.84;

/**
 * The brand lockup: emblem beside the full studio name, on one line.
 *
 * `compact` is the scrolled state. It does two things at once, and needs both:
 *
 *  - a transform scale on the lockup, because that is the only way to *animate*
 *    the change (the emblem's size is a pixel dimension, not a length that
 *    transitions), and
 *  - a height on the wrapper, because a transform doesn't touch layout —
 *    scaling alone left a full-size box behind and the "compact" bar was
 *    barely shorter than the resting one.
 */
function BrandLockup({
  compact = false,
  onClick,
}: {
  compact?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center transition-[height] duration-700 ease-editorial",
        compact ? "h-10" : "h-12"
      )}
    >
      <a
        href="#hero"
        onClick={onClick}
        aria-label={`${SITE.name} — back to top`}
        className="flex origin-center items-center gap-3 transition-transform duration-700 ease-editorial md:gap-3.5"
        style={compact ? { transform: `scale(${COMPACT_SCALE})` } : undefined}
      >
        <span className="inline-flex shrink-0">
          <Mark size={MARK_SIZE} priority />
        </span>
        {/* One line. `whitespace-nowrap` is load-bearing, not tidiness: this is
            the specific thing the client asked to be fixed, so it must not be
            able to wrap at any width the lockup is rendered at. */}
        <span className="block whitespace-nowrap font-display text-[1.05rem] leading-none tracking-[0.01em] text-gold md:text-[1.35rem]">
          {SITE.name}
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
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      /* Timed to `INTRO.navbarMs`, which puts the bar at rest BEHIND the intro
         screen — it is uncovered already in place rather than fading in over a
         live page. */
      transition={{
        delay: INTRO.navbarMs / 1000,
        duration: 0.9,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="fixed inset-x-0 top-0 z-50"
    >
      {/* The panel. Opaque in both states — see the note at the top of the
          file. `surface-emerald` rather than a flat fill so the bar has the
          same dimensional treatment as the site's other green surfaces. */}
      <nav
        className={cn(
          "surface-emerald relative flex w-full items-center justify-center border-b border-gold/20 px-6 shadow-[0_1px_24px_rgba(6,41,28,0.35)] transition-all duration-500 ease-editorial md:px-10 lg:px-16",
          scrolled ? "py-2" : "py-3.5 md:py-4"
        )}
      >
        {/* Desktop: links | lockup | links on three tracks, so the lockup lands
            on the page's centre line regardless of how wide the link groups
            are. The outer tracks are equal-width, which is what keeps it
            optically centred rather than merely between the two groups. */}
        <div className="hidden w-full max-w-[1560px] grid-cols-[1fr_auto_1fr] items-center gap-8 lg:grid">
          <ul className="flex list-none items-center justify-start gap-6 p-0 xl:gap-8">
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

          <BrandLockup compact={scrolled} />

          <ul className="flex list-none items-center justify-end gap-6 p-0 xl:gap-8">
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
          <BrandLockup compact={scrolled} />
          <button
            type="button"
            aria-label="Open menu"
            className="absolute right-6 text-cream md:right-10"
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
            <div className="relative flex items-center justify-center px-6 py-3.5">
              <BrandLockup onClick={() => setMenuOpen(false)} />
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
              className="flex flex-1 list-none flex-col justify-center gap-6 p-0 px-8"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: { staggerChildren: 0.07, delayChildren: 0.2 },
                },
              }}
            >
              {NAV_LINKS.map((link, i) => (
                <motion.li
                  key={link.href}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="flex items-baseline gap-4"
                >
                  <span className="font-label text-[12px] uppercase tracking-[0.16em] text-gold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
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

            <div className="border-t border-cream/15 px-8 py-7">
              <a
                href={`mailto:${SITE.email}`}
                onClick={() => setMenuOpen(false)}
                className="font-label text-[12px] uppercase tracking-[0.16em] text-gold"
              >
                {SITE.email}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
