import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import ProjectDetail from "@/components/sections/ProjectDetail";
import { SITE } from "@/constants";
import { disciplineFor, pathForDiscipline } from "@/lib/disciplines";
import { projectDescription } from "@/lib/projectMeta";
import {
  getDisciplineProject,
  getDisciplineProjectParams,
  getSiteImages,
} from "@/sanity/lib/content";

/**
 * /services/<discipline>/<slug> — one commission from the catalogue.
 *
 * ── The other project page, and why there are two ────────────────────────
 *
 * /work/<slug> serves the Selected Works ring. This serves the catalogue
 * under What we do. They are two separate collections in the Studio with no
 * link between them (see sanity/schemas/index.ts), so they get two routes —
 * and neither ever resolves a slug belonging to the other.
 *
 * They render the SAME component. A commission's page is a cover, a spec, a
 * write-up, the drawings, the photographs and a pager, and there is one right
 * way for this studio to draw that whichever collection the project came
 * from. See components/sections/ProjectDetail.tsx for what the two routes
 * hand it differently.
 *
 * ── The discipline segment is not decoration ─────────────────────────────
 *
 * It scopes the lookup. Two projects in different disciplines may share a
 * slug without colliding, and the pager at the foot walks the neighbours
 * inside this discipline only — "Next →" from the last architecture project
 * must not hand a visitor a boutique interior. See `getDisciplineProject`.
 *
 * A slug that exists under a DIFFERENT discipline is a 404 here rather than a
 * redirect, for the same reason a missing one is: the URL names a specific
 * project in a specific section, and quietly serving something else would be
 * answering a question nobody asked.
 */

/**
 * Ten minutes, matching `REVALIDATE_SECONDS` in sanity/lib/content.ts — a
 * literal because Next requires this to be statically analysable and will not
 * follow a reference. Keep the two in step.
 */
export const revalidate = 600;

/**
 * A page per project, built from the same list the sitemap reads.
 *
 * `dynamicParams` is left alone deliberately. Setting it false would close the
 * route to this list and then 404 every one of these pages the moment the
 * `disciplineProject` tag is revalidated — the NoFallbackError trap
 * documented at length in app/(site)/[section]/page.tsx. The `notFound()`
 * below is the guard instead.
 */
export async function generateStaticParams() {
  return getDisciplineProjectParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ discipline: string; slug: string }>;
}): Promise<Metadata> {
  const { discipline: id, slug } = await params;
  const work = await getDisciplineProject(id, slug);
  if (!work) return { title: "Project not found" };

  const description = projectDescription(work);
  return {
    title: work.title,
    description,
    alternates: { canonical: `/services/${id}/${slug}` },
    openGraph: {
      title: `${work.title} — ${SITE.name}`,
      description,
      images: work.image ? [{ url: work.image }] : undefined,
    },
  };
}

export default async function DisciplineProjectPage({
  params,
}: {
  params: Promise<{ discipline: string; slug: string }>;
}) {
  const { discipline: id, slug } = await params;
  const discipline = disciplineFor(id);

  // A segment that is not one of the three disciplines, before any read.
  if (!discipline) notFound();

  const [work, siteImages] = await Promise.all([
    getDisciplineProject(id, slug),
    getSiteImages(),
  ]);

  if (!work) notFound();

  return (
    <>
      <Navbar />
      <main>
        <ProjectDetail
          work={work}
          /* Back to the discipline's own grid, not to Selected Works — the
             visitor came from a section and that is where "←" should return
             them. Its label is the discipline's name for the same reason. */
          backHref={pathForDiscipline(id)}
          backLabel={discipline.title}
          hrefFor={(next) => `/services/${id}/${next}`}
          backdrop={siteImages.contactBackdrop}
        />
      </main>
    </>
  );
}
