"use client";

/**
 * SelectedWorks — pinned horizontal cinematic gallery.
 *
 * The section pins for the length of the horizontal scroll and the track
 * translates under it, driven by GSAP ScrollTrigger (pin + scrub) synced to
 * Lenis in SmoothScrollProvider — so the travel is buttery rather than
 * reactive.
 *
 * ── Changed in the client review ──────────────────────────────────────────
 *
 *  - The nine placeholder projects are replaced by the studio's nine real
 *    commissions, in the order supplied.
 *  - The section id is now `projects`, not `works`. The navbar's "Projects"
 *    link has always pointed at `#projects`, and the only element with that id
 *    was <FeaturedProjects />, which is commented out of the page — so that
 *    nav link has been silently doing nothing.
 *  - The meta row and the description now render ONLY when there is something
 *    to put in them. The studio has not yet supplied location, area or year
 *    per project, and rendering the row regardless left an empty hairline
 *    strip under every title.
 *
 * Behaviour preserved: uneven panel widths (so it never reads as a carousel),
 * hover zoom + description reveal, the progress hairline, the "01 / 09"
 * readout, index buttons that smooth-scroll to a panel, ←/→ keyboard stepping,
 * and a release into a normal vertical stack below lg.
 */
import { useRef, useState } from "react";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks";
import { PageContainer, Media, Button, SectionHeading } from "@/components/ui";
import { WORKS } from "@/constants";
import { smoothScrollTo } from "@/lib/SmoothScrollProvider";
import { cn } from "@/utils/cn";

export default function SelectedWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const track = trackRef.current;
    if (!section || !pin || !track) return;

    const mm = gsap.matchMedia();

    // Desktop: pin + horizontal scrub.
    mm.add("(min-width: 1024px)", () => {
      const distance = () => track.scrollWidth - window.innerWidth;

      const tween = gsap.to(track, { x: () => -distance(), ease: "none" });

      const st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => "+=" + distance(),
        pin,
        scrub: 1,
        invalidateOnRefresh: true,
        animation: tween,
        onUpdate: (self) => {
          if (progressRef.current) {
            progressRef.current.style.width = self.progress * 100 + "%";
          }
          const idx = Math.round(self.progress * (WORKS.length - 1));
          if (idx !== activeRef.current) {
            activeRef.current = idx;
            setActive(idx);
          }
        },
      });
      stRef.current = st;

      return () => {
        st.kill();
        tween.kill();
        stRef.current = null;
      };
    });

    // ←/→ steps between panels while the gallery is on screen.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const r = section.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      jump(
        Math.max(
          0,
          Math.min(
            WORKS.length - 1,
            activeRef.current + (e.key === "ArrowRight" ? 1 : -1)
          )
        )
      );
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      mm.revert();
    };
  }, []);

  /** Smooth-scroll so panel `i` lands at the viewport's left edge. */
  const jump = (i: number) => {
    const track = trackRef.current;
    const st = stRef.current;
    if (!track) return;

    const panel = track.children[i] as HTMLElement | undefined;
    if (!panel) return;

    // Mobile (no pin): scroll to the stacked panel directly.
    if (!st) {
      smoothScrollTo(panel, { offset: -90 });
      return;
    }

    const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    const distance = track.scrollWidth - window.innerWidth;
    const frac =
      distance > 0
        ? Math.min(1, Math.max(0, (panel.offsetLeft - pad) / distance))
        : 0;
    const targetY = st.start + frac * (st.end - st.start);
    smoothScrollTo(targetY);
  };

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative bg-cream text-charcoal"
    >
      {/* Pinned 100vh panel (desktop) / natural flow (mobile). */}
      <div ref={pinRef} className="flex flex-col overflow-hidden lg:h-screen">
        {/* Header — the counter rides in the heading's title-block slot. */}
        <PageContainer className="shrink-0 pt-24 pb-3 md:pt-28">
          <SectionHeading
            index="02"
            eyebrow="Selected Works"
            meta={`${String(active + 1).padStart(2, "0")} / ${String(
              WORKS.length
            ).padStart(2, "0")}`}
          />
        </PageContainer>

        {/* Track */}
        <div
          ref={trackRef}
          className="relative flex flex-1 flex-col items-stretch gap-6 px-6 pb-8 will-change-transform md:px-10 lg:flex-row lg:gap-8 lg:px-16"
        >
          {WORKS.map((work) => {
            // Only render the meta row / description for the projects that
            // actually have that data — see the note at the top of the file.
            const meta = [work.location, work.area, work.year].filter(Boolean);

            return (
              <a
                key={work.id}
                href="#contact"
                style={{ width: work.width }}
                className="group relative block shrink-0 overflow-hidden rounded-2xl bg-stone max-lg:aspect-4/5! max-lg:w-full!"
              >
                {/* Zooming image */}
                <Media
                  src={work.image}
                  alt={work.title}
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="scale-[1.03] transition-transform duration-1600 ease-editorial group-hover:scale-110"
                />
                {/* Legibility scrim — neutral, not green.
                    This used to be built from emerald-deep at 82%, which tinted
                    the bottom half of every project photograph green. The panels
                    now darken without colouring, so nine photographs shot by
                    different people at least share a neutral ground. */}
                <div className="scrim-b absolute inset-0" />

                {/* Content */}
                <div className="relative flex h-full flex-col justify-end p-6 text-cream md:p-10">
                  <div className="mb-2.5 font-label text-[12px] uppercase tracking-[0.16em] text-cream/70">
                    {work.category}
                  </div>
                  <h3 className="font-serif text-3xl font-light leading-[1.02] tracking-tight md:text-5xl">
                    {work.title}
                  </h3>

                  {meta.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-cream/25 pt-3.5 font-label text-[12px] uppercase tracking-[0.14em] text-cream/70">
                      {meta.map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </div>
                  )}

                  {/* Open by default on mobile, hover-reveal on desktop. */}
                  <div className="max-h-[320px] overflow-hidden opacity-100 transition-all duration-700 ease-editorial lg:max-h-0 lg:opacity-0 lg:group-hover:max-h-[320px] lg:group-hover:opacity-100">
                    {work.description && (
                      <p className="mt-4 max-w-[40ch] text-sm leading-[1.65] text-cream/80">
                        {work.description}
                      </p>
                    )}
                    <span className="mt-3.5 inline-block font-label text-[12px] uppercase tracking-[0.16em] text-gold">
                      View project &rarr;
                    </span>
                  </div>
                </div>
              </a>
            );
          })}

          {/* Closing invitation panel */}
          <div
            style={{ width: "min(46vw, 520px)" }}
            className="flex shrink-0 flex-col justify-end pb-6 max-lg:w-full! max-lg:pt-4"
          >
            <h3 className="mb-5 max-w-[14ch] font-serif text-3xl font-light leading-[1.04] tracking-tight text-emerald md:text-5xl">
              More, on request.
            </h3>
            <p className="mb-7 max-w-[34ch] text-[15px] leading-[1.7] text-charcoal/60">
              Several commissions are held privately. We share them in
              conversation.
            </p>
            <Button href="#contact" variant="outline" className="self-start text-charcoal">
              Enquire about a project
            </Button>
          </div>
        </div>

        {/* Footer: progress + index (desktop only) */}
        <PageContainer className="hidden shrink-0 pb-3 lg:block">
          <div className="relative mb-0.5 h-px bg-charcoal/20">
            <div ref={progressRef} className="absolute top-0 left-0 h-px w-0 bg-gold" />
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 font-label text-[12px] uppercase tracking-[0.14em]">
            {WORKS.map((work, i) => (
              <button
                key={work.id}
                type="button"
                onClick={() => jump(i)}
                className={cn(
                  "cursor-pointer py-4 transition-colors duration-300",
                  i === active
                    ? "text-charcoal"
                    : "text-charcoal/50 hover:text-charcoal/80"
                )}
              >
                {String(i + 1).padStart(2, "0")} {work.title}
              </button>
            ))}
          </div>
        </PageContainer>
      </div>
    </section>
  );
}
