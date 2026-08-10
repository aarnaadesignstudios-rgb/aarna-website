"use client";

/**
 * PhotoGrid — the portfolio grid on /photography, with a lightbox.
 *
 * ── The grid ──────────────────────────────────────────────────────────────
 *
 * Deliberately irregular: portrait pairs, a landscape, a full-bleed panorama.
 * A uniform grid of equal thumbnails is what a stock library looks like; an
 * uneven one reads as a picture editor having chosen the running order, which
 * is the whole point of a photographer's portfolio page. The spans live in the
 * data (see PHOTOGRAPHY_FRAMES) so the rhythm is editable without touching
 * this component.
 *
 * ── The lightbox ──────────────────────────────────────────────────────────
 *
 * Photographs need to be seen large, and a grid tile is not large. Clicking
 * one opens it full-screen; ← / → step through the set and Escape closes.
 *
 * Three things it gets right that a naive implementation does not:
 *
 *  · Scroll is locked while it is open, and the lock is released on unmount as
 *    well as on close — otherwise a fast Escape during the exit transition
 *    leaves the page permanently unscrollable.
 *  · The keydown listener is bound only while open, so the page is not
 *    handling arrow keys the rest of the time (this page also sits next to
 *    sections that use ← / → themselves).
 *  · Focus is not trapped, but the close button is focused on open and the
 *    overlay is `role="dialog" aria-modal`, so a keyboard user lands somewhere
 *    sensible and Escape always works.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiX } from "react-icons/fi";

import { Media, Reveal } from "@/components/ui";
import { cn } from "@/utils/cn";
import type { PhotoFrame } from "@/types";

interface PhotoGridProps {
  frames: PhotoFrame[];
  className?: string;
}

export default function PhotoGrid({ frames, className }: PhotoGridProps) {
  /** Index of the open frame, or null when the lightbox is closed. */
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpenIndex(null), []);

  const step = useCallback(
    (delta: number) =>
      setOpenIndex((i) =>
        i === null ? i : (i + delta + frames.length) % frames.length
      ),
    [frames.length]
  );

  useEffect(() => {
    if (openIndex === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", onKey);
      // Restored on unmount as well as on close — see the note above.
      document.body.style.overflow = previous;
    };
  }, [openIndex, close, step]);

  const open = openIndex === null ? null : frames[openIndex];

  return (
    <>
      <div
        className={cn(
          "grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-6",
          className
        )}
      >
        {frames.map((frame, i) => (
          <Reveal
            key={frame.id}
            variant="fadeScale"
            delay={(i % 3) * 0.07}
            className={frame.span}
          >
            <figure className="m-0">
              <button
                type="button"
                onClick={() => setOpenIndex(i)}
                aria-label={`Open image ${i + 1} of ${frames.length}`}
                className={cn(
                  "group relative block w-full cursor-pointer overflow-hidden rounded-2xl bg-emerald-deep",
                  frame.aspect
                )}
              >
                <Media
                  src={frame.image}
                  alt={frame.caption || ""}
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="transition-transform duration-1400 ease-editorial group-hover:scale-[1.04]"
                />
                {/* A very light veil that lifts on hover — enough that the tile
                    acknowledges the pointer without tinting the photograph. */}
                <span className="absolute inset-0 bg-ink/10 opacity-100 transition-opacity duration-700 group-hover:opacity-0" />
              </button>
              {frame.caption && (
                <figcaption className="mt-3 font-label text-charcoal/50">
                  {frame.caption}
                </figcaption>
              )}
            </figure>
          </Reveal>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Photograph"
            className="fixed inset-0 z-100 flex flex-col bg-ink/96 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={close}
          >
            <div className="flex shrink-0 items-center justify-between px-6 py-5 md:px-10">
              <span className="font-label text-cream/60">
                {String((openIndex ?? 0) + 1).padStart(2, "0")} /{" "}
                {String(frames.length).padStart(2, "0")}
              </span>
              <button
                ref={closeRef}
                type="button"
                aria-label="Close"
                onClick={close}
                className="cursor-pointer text-cream/70 transition-colors duration-300 hover:text-gold"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* stopPropagation so clicking the photograph itself does not
                close the overlay — only the surrounding ground does. */}
            <div
              className="relative flex-1 px-6 pb-6 md:px-14 md:pb-12"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                key={open.id}
                className="relative h-full w-full"
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <Media
                  src={open.image}
                  alt={open.caption || ""}
                  sizes="100vw"
                  className="object-contain!"
                />
              </motion.div>
            </div>

            <div className="flex shrink-0 items-center justify-center gap-8 pb-8">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                className="cursor-pointer font-label text-cream/60 transition-colors duration-300 hover:text-gold"
              >
                ← Previous
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                className="cursor-pointer font-label text-cream/60 transition-colors duration-300 hover:text-gold"
              >
                Next →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
