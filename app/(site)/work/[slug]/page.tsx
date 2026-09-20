import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import ProjectDetail from "@/components/sections/ProjectDetail";
import { SITE } from "@/constants";
import { getSiteImages, getWork, getWorkSlugs } from "@/sanity/lib/content";
import { projectDescription } from "@/lib/projectMeta";

/**
 * /work/[slug] — one commission from the Selected Works ring, at length.
 *
 * ── Where this sits in the site ──────────────────────────────────────────
 *
 * The ring on the home page is a shop window: a handful of photographs
 * turning past, each captioned with a name and a category and nothing else.
 * Every card used to link to #contact, which meant the only thing a visitor
 * could do with a project that interested them was ask about a different one.
 * This is what a card leads to now.
 *
 * ── It serves the RING's collection, and only that one ───────────────────
 *
 * `work` documents and `disciplineProject` documents are two separate
 * collections that happen to share a page design — see the note at the top of
 * components/sections/ProjectDetail.tsx and sanity/schemas/index.ts. This
 * route reads `work`, the catalogue under What we do has its own route at
 * /services/<discipline>/<slug>, and neither ever resolves a slug belonging
 * to the other. A project that should appear in both places is published
 * twice, deliberately.
 *
 * ── Prerendered, and revalidated by the webhook ──────────────────────────
 *
 * `generateStaticParams` builds a page per project at deploy time; the `work`
 * cache tag means publishing in the Studio drops exactly these pages and
 * nothing else. See app/api/revalidate/route.ts.
 */

/**
 * Ten minutes, matching `REVALIDATE_SECONDS` in sanity/lib/content.ts — and a
 * literal rather than an import of it, because Next requires this value to be
 * statically analysable and will not follow a reference. Keep the two in step;
 * the note on that constant explains what the number is actually for.
 */
export const revalidate = 600;

export async function generateStaticParams() {
  const slugs = await getWorkSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const work = await getWork(slug);
  if (!work) return { title: "Project not found" };

  const description = projectDescription(work);
  return {
    title: work.title,
    description,
    alternates: { canonical: `/work/${slug}` },
    openGraph: {
      title: `${work.title} — ${SITE.name}`,
      description,
      images: work.image ? [{ url: work.image }] : undefined,
    },
  };
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  /**
   * In parallel, and the backdrop is fetched even for a slug that turns out
   * not to exist — a wasted read on the 404 path, against a serialised round
   * trip on every real project page. The 404s are the rare case.
   */
  const [work, siteImages] = await Promise.all([getWork(slug), getSiteImages()]);

  // A URL that names no project is a 404, never a redirect to a different one
  // — see the note on `getWork`.
  if (!work) notFound();

  return (
    <>
      <Navbar />
      <main>
        <ProjectDetail
          work={work}
          backHref="/projects"
          backLabel="Selected Works"
          /* Neighbours stay inside the ring's collection. */
          hrefFor={(id) => `/work/${id}`}
          backdrop={siteImages.contactBackdrop}
        />
      </main>
    </>
  );
}
