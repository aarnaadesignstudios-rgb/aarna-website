"use client";

/**
 * FeaturedProjects — alternating editorial project showcase.
 *
 * Layout: each project is an image + caption laid out side-by-side, alternating
 * sides down the page. Captions NEVER overlap the imagery (readability first).
 *
 * Motion (two layered animations per row):
 *  - REVEAL:   clip-path mask + inner zoom as each image enters (useImageReveal).
 *  - PARALLAX: the image drifts continuously within its frame on scroll
 *              (useParallax, scrubbed) — this is the "image scaling / overlap"
 *              feel, done safely inside an overflow-hidden frame.
 *
 * TODO (future phases):
 *  - Cross-fade / clip transition between consecutive projects.
 *  - Pin a project and swap its image on scroll for a gallery moment.
 */
import { PageContainer, Media, SectionHeading } from "@/components/ui";
import { PROJECTS } from "@/constants";
import { useImageReveal, useParallax } from "@/hooks";
import { cn } from "@/utils/cn";
import type { Project } from "@/types";

/** Single project row — isolated so its animation refs stay local. */
function ProjectRow({ project, index }: { project: Project; index: number }) {
  // REVEAL on the frame (mask uncover + inner zoom on enter).
  const frameRef = useImageReveal<HTMLDivElement>();
  // PARALLAX on the inner media layer (continuous drift while scrolling).
  const parallaxRef = useParallax<HTMLDivElement>({ from: -14, to: 14 });

  const isEven = index % 2 === 0;

  return (
    <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
      {/* Image frame */}
      <div
        ref={frameRef}
        className={cn(
          "relative aspect-16/11 overflow-hidden rounded-2xl lg:col-span-7",
          // Alternate which side the image sits on.
          isEven ? "lg:order-1" : "lg:order-2"
        )}
      >
        {/* Parallax layer is scaled up so the drift never exposes an edge. */}
        <div ref={parallaxRef} className="absolute inset-0 scale-125">
          <Media
            data-image
            src={project.image}
            alt={project.title}
            sizes="(max-width: 1024px) 100vw, 58vw"
          />
        </div>
      </div>

      {/* Caption — its own column, no overlap. */}
      <div
        className={cn(
          "lg:col-span-5",
          isEven ? "lg:order-2 lg:pl-4" : "lg:order-1 lg:pr-4"
        )}
      >
        <span className="font-label text-gold">
          {project.category} · {project.year}
        </span>
        <h3 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
          {project.title}
        </h3>
        <p className="mt-3 font-label text-cream/50">
          {project.location}
        </p>
      </div>
    </div>
  );
}

export default function FeaturedProjects() {
  return (
    <section
      id="projects"
      className="surface-emerald overflow-hidden border-y border-gold/15 py-24 text-cream md:py-32 lg:py-40"
    >
      <PageContainer>
        <SectionHeading
          eyebrow="Selected Work"
          title="Featured projects"
          description="A selection of recent works — residences, retreats and cultural spaces."
          className="max-w-2xl"
        />

        <div className="mt-20 flex flex-col gap-24 md:gap-32">
          {PROJECTS.map((project, index) => (
            <ProjectRow key={project.id} project={project} index={index} />
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
