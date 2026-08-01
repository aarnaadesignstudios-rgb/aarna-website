"use client";

/**
 * Navbar — floating, rounded "pill" with a symmetric editorial layout.
 *
 * The bar detaches from the top edge and floats as a glassy, blurred pill.
 * Links split evenly around a centred brand emblem. Glass-dark over the hero,
 * frosted cream once scrolled.
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

import { NAV_LINKS, SITE } from "@/constants";
import { Mark } from "@/components/ui";
import { useIsomorphicLayoutEffect } from "@/hooks";
import { cn } from "@/utils/cn";

// Split the six links symmetrically around the centred emblem.
const LEFT_LINKS = NAV_LINKS.slice(0, 3);
const RIGHT_LINKS = NAV_LINKS.slice(3);

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
      className="group relative block overflow-hidden py-1 text-[0.78rem] uppercase tracking-[0.2em] whitespace-nowrap"
    >
      {/* Outgoing label (rolls up on hover). */}
      <span
        className={cn(
          "block transition-transform duration-500 ease-editorial group-hover:-translate-y-[130%]",
          active ? "text-gold" : "opacity-80"
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
      transition={{ delay: 2.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      {/* Floating rounded pill */}
      <nav
        className={cn(
          "mx-auto mt-4 flex w-[calc(100%-1.5rem)] max-w-[1400px] items-center justify-between rounded-full border px-6 py-4 backdrop-blur-md transition-colors duration-500 md:mt-5 md:px-10 md:py-5 lg:grid lg:grid-cols-3",
          scrolled
            ? "border-charcoal/10 bg-cream/80 text-charcoal shadow-[0_12px_45px_-18px_rgba(20,20,18,0.5)]"
            // Slightly deeper tint than the rest of the glass: the wordmark is
            // gold here, which needs more backdrop than cream did to hold up
            // against a bright frame behind it.
            : "border-cream/15 bg-charcoal/35 text-cream shadow-[0_12px_45px_-22px_rgba(0,0,0,0.55)]"
        )}
      >
        {/* Left links */}
        <ul className="hidden items-center justify-start gap-8 lg:flex">
          {LEFT_LINKS.map((link) => (
            <li key={link.href}>
              <NavItem label={link.label} href={link.href} active={isActive(link.href)} />
            </li>
          ))}
        </ul>

        {/* Center: brand emblem. The name carries the palette — gold to match
            the emblem over the hero, emerald once the bar turns cream, since
            gold on cream is far too low-contrast to read. */}
        <a
          href="#hero"
          className="flex items-center gap-3.5 lg:justify-self-center"
        >
          <Mark size={40} priority />
          <span className="font-serif text-xl font-semibold tracking-tight md:text-2xl">
            <span
              className={cn(
                "transition-colors duration-500",
                scrolled
                  ? "text-emerald"
                  : "text-gold-soft [text-shadow:0_1px_16px_rgba(9,22,16,0.75)]"
              )}
            >
              {SITE.shortName}
            </span>
            <span
              className={cn(
                "hidden font-medium transition-colors duration-500 xl:inline",
                scrolled ? "text-charcoal/65" : "text-cream/75"
              )}
            >
              {" "}
              Design Studios
            </span>
          </span>
        </a>

        {/* Right links (desktop) + menu trigger (mobile) */}
        <div className="flex items-center justify-end gap-8">
          <ul className="hidden items-center gap-8 lg:flex">
            {RIGHT_LINKS.map((link) => (
              <li key={link.href}>
                <NavItem label={link.label} href={link.href} active={isActive(link.href)} />
              </li>
            ))}
          </ul>
          <button
            type="button"
            aria-label="Open menu"
            className="lg:hidden"
            onClick={() => setMenuOpen(true)}
          >
            <FiMenu size={26} />
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
            <div className="flex items-center justify-between px-6 py-4">
              <span className="flex items-center gap-3.5">
                <Mark size={40} />
                <span className="font-serif text-xl font-semibold tracking-tight">
                  <span className="text-gold-soft">{SITE.shortName}</span>
                  <span className="font-medium text-cream/75"> Design Studios</span>
                </span>
              </span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              >
                <FiX size={24} />
              </button>
            </div>
            <motion.ul
              className="flex flex-1 flex-col justify-center gap-6 px-6"
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

            <div className="px-6 pb-10">
              <a
                href="#contact"
                onClick={() => setMenuOpen(false)}
                className="inline-flex border border-cream/40 px-6 py-3 text-xs uppercase tracking-[0.2em] transition-colors hover:bg-gold hover:text-emerald"
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
