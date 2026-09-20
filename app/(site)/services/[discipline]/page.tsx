import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Contact from "@/components/sections/Contact";
import {
  Media,
  PageContainer,
  Reveal,
  SectionHeading,
  SheetTexture,
  SmoothLink,
} from "@/components/ui";
import { SERVICES, SITE } from "@/constants";
import {
  assertDisciplinesMatchServices,
  DISCIPLINE_IDS,
  disciplineFor,
} from "@/lib/disciplines";
import { getDisciplineProjects, getSiteImages } from "@/sanity/lib/content";
import type { Work } from "@/types";

/**
 * /services/architecture, /services/commercial-interiors,
 * /services/boutique-interiors — one discipline's commissions.
 *
 * ── The middle step that was missing ─────────────────────────────────────
 *
 * The site had two views of the work and nothing between them: the ring on
 * the home page, which is a shop window showing every project at once, and
 * /work/<slug>, which is one project at length. A visitor who reads the
 * Services track, decides that Boutique Interiors is the thing they want, and
 * goes looking for the studio's boutique work had nowhere to go — the ring is
 * not filterable and the categories on it are printed, not navigable.
 *
 * This is that step. Each of the three buildable disciplines gets a page, the
 * discipline's card on the Services track links to it, and every card here
 * leads to the project's own page at /services/<discipline>/<slug>.
 *
 * ── It reads its OWN collection, not the ring's ─────────────────────────
 *
 * `disciplineProject`, not `work`. The two are separate document types with
 * separate Studio sections and no link between them — the studio asked for
 * the ring and the catalogue kept apart, and this is the half of it that is
 * the catalogue. See sanity/schemas/index.ts, and lib/disciplines.ts for the
 * three-discipline taxonomy itself.
 *
 * ── Why this URL, and not `/architecture` ────────────────────────────────
 *
 * `app/(site)/[section]/page.tsx` is a greedy one-segment route serving the
 * home page's chapters, and it answers for every unclaimed top-level path —
 * so `/architecture` would have been a 404 from that file rather than a page
 * from this one. Nesting under `/services` sidesteps it (two segments never
 * reach a one-segment route) and is the truer address anyway: these pages are
 * what the Services chapter is about. `/services` itself is untouched and
 * still renders the home document — a folder with no `page.tsx` claims no
 * route, so that path still falls to `[section]`.
 *
 * ── Prerendered, and revalidated by the webhook ──────────────────────────
 *
 * Three pages at build time. They read `disciplineProject`, so publishing one
 * in the Studio drops exactly these pages and the project pages under them,
 * and leaves the home page's ring alone. See app/api/revalidate/route.ts.
 */

/**
 * A rename in `lib/disciplines.ts` that is not also a rename in `SERVICES`
 * would leave a card linking to a page that is not generated. Checking it at
 * module scope makes that a build failure here rather than a 404 somebody
 * finds later — see the note on the function.
 */
assertDisciplinesMatchServices(SERVICES.map((s) => s.id));

/**
 * Ten minutes, matching `REVALIDATE_SECONDS` in sanity/lib/content.ts — and a
 * literal rather than an import of it, because Next requires this value to be
 * statically analysable and will not follow a reference. Keep the two in step.
 */
export const revalidate = 600;

/**
 * All three, always — including one with no projects in it yet.
 *
 * A discipline the studio offers is a discipline the Services card links to,
 * so its page has to exist the moment the card does. Generating only the
 * populated ones would mean Architecture 404s until the first architecture
 * project is published, which is a broken link on the home page caused by a
 * content gap. The page renders an honest empty state instead.
 *
 * `dynamicParams` is deliberately left alone. Setting it false would close the
 * route to this list and then 404 every one of these pages the moment their
 * `work` tag is revalidated — the NoFallbackError trap documented at length in
 * app/(site)/[section]/page.tsx. The guard is the `notFound()` below instead.
 */
export function generateStaticParams() {
  return DISCIPLINE_IDS.map((discipline) => ({ discipline }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ discipline: string }>;
}): Promise<Metadata> {
  const { discipline: id } = await params;
  const discipline = disciplineFor(id);
  if (!discipline) return { title: "Not found" };

  return {
    title: discipline.title,
    description: discipline.standfirst,
    alternates: { canonical: `/services/${id}` },
    openGraph: {
      title: `${discipline.title} — ${SITE.name}`,
      description: discipline.standfirst,
    },
  };
}

/**
 * One project in the grid.
 *
 * ── The plate is the project page's gallery plate ────────────────────────
 *
 * `aspect-4/3`, `rounded-xl`, `bg-mist` under the photograph while it loads,
 * and the same slow `ease-editorial` push on hover — all of it lifted from
 * the Gallery grid on /work/<slug>, because a visitor moving between the two
 * should not be able to tell that two different people laid them out.
 *
 * ── Caption UNDER the plate, not over it ─────────────────────────────────
 *
 * The obvious alternative is a scrim with the name across the bottom of the
 * photograph, and it is wrong for this page specifically: these are interiors
 * shot light, so a legible scrim has to be heavy, and a heavy scrim over four
 * photographs is a page of grey rectangles. Type underneath also matches the
 * ring's own cards and the Layout/Gallery figures, which is the site's
 * established way of captioning a picture.
 *
 * The hover moves BOTH — the photograph pushes in, the name goes to gold —
 * so the card reads as one object rather than as a picture with a label
 * beside it. Same two gestures the `Sibling` pager on /work/<slug> uses.
 */
function ProjectCard({ work }: { work: Work }) {
  return (
    <SmoothLink
      /* Inside the discipline, never /work/<slug>: this is the other
         collection and it has its own addresses. See the note at the top of
         components/sections/ProjectDetail.tsx. */
      href={`/services/${work.discipline}/${work.id}`}
      cardLabel={work.title}
      className="group block"
    >
      <span className="relative block aspect-4/3 w-full overflow-hidden rounded-xl bg-mist">
        <Media
          src={work.image}
          alt={work.title}
          objectPosition={work.objectPosition}
          /* Two up from `md`, one below it. The measure is capped at the
             container, so 45vw is the real box on a wide screen and 100vw on
             a phone — the same hint the project page's gallery gives. */
          sizes="(max-width: 768px) 100vw, 45vw"
          className="scale-[1.02] transition-transform duration-[1400ms] ease-editorial group-hover:scale-[1.06]"
        />
      </span>

      <span className="mt-4 block font-label text-gold-ink">
        {work.category}
      </span>
      <span className="mt-1.5 block font-serif text-2xl leading-tight tracking-tight text-emerald transition-colors duration-500 group-hover:text-gold-ink md:text-[1.75rem]">
        {work.title}
      </span>
    </SmoothLink>
  );
}

export default async function DisciplinePage({
  params,
}: {
  params: Promise<{ discipline: string }>;
}) {
  const { discipline: id } = await params;
  const discipline = disciplineFor(id);

  /**
   * The guard `dynamicParams = false` would have been, reached a different
   * way — see the note on `generateStaticParams`. Only runs for a segment
   * nobody generated: a typo, a stale link, a crawler guessing.
   */
  if (!discipline) notFound();

  const [works, siteImages] = await Promise.all([
    getDisciplineProjects(id),
    getSiteImages(),
  ]);

  return (
    <>
      <Navbar />

      <main>
        {/* `pt-36 md:pt-44` clears the fixed masthead, the same way /vastu
            opens. This page has no full-bleed cover on purpose: the cover on
            /work/<slug> is that project's own photograph, and a discipline
            has no single photograph that is honestly its own — picking one of
            its projects to stand for all of them puts one commission above
            the rest for a reason that is purely layout. */}
        <section className="relative bg-paper pt-36 pb-14 text-charcoal md:pt-44 md:pb-16">
          <SheetTexture />

          <PageContainer className="relative z-10">
            <Reveal>
              <SmoothLink
                href="/services"
                /* `-my-1.5 py-1.5` grows the tap target to 26px without moving
                   the label — 12px type on its own is a 14px hit area. Same
                   treatment as the "← Selected Works" link on a project. */
                className="-my-1.5 inline-block py-1.5 font-label text-charcoal/60 transition-colors duration-300 hover:text-gold-ink"
              >
                {"← What we do"}
              </SmoothLink>
            </Reveal>

            {/* `titleAs="h1"`: this page's subject IS the discipline, unlike
                the home page's sections, which are chapters of a document
                whose h1 is elsewhere. */}
            <SectionHeading
              className="mt-7"
              eyebrow="Discipline"
              eyebrowClassName="text-gold"
              title={discipline.title}
              titleAs="h1"
              description={discipline.standfirst}
              /* The count is the title block of the drawing sheet, and here it
                 is doing a second job: it is what tells a visitor that a page
                 with three projects on it is a page with three projects on it,
                 rather than one that failed to load the rest. */
              meta={
                works.length > 0 ? (
                  <>
                    {works.length}{" "}
                    {works.length === 1 ? "project" : "projects"}
                  </>
                ) : undefined
              }
            />
          </PageContainer>
        </section>

        {/* ── The work ────────────────────────────────────────────────────
            Two up, which is the grid the project page already uses for its
            Layout and Gallery blocks. One column below `md`: a half-measure
            card on a 390px phone is ~170px wide, at which size an interior
            photograph is a swatch.

            `gap-y` is deliberately larger than `gap-x`. Each card is a
            picture with two lines of type under it, so an equal gap puts the
            next row's photograph nearly as close to this row's caption as the
            caption is to its own picture, and the columns stop reading as
            columns. */}
        <section className="relative bg-paper pb-24 md:pb-32">
          <PageContainer className="relative z-10">
            {works.length > 0 ? (
              <div className="grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-2 md:gap-y-14">
                {works.map((work: Work) => (
                  <Reveal key={work.id}>
                    <ProjectCard work={work} />
                  </Reveal>
                ))}
              </div>
            ) : (
              /* ── Nothing published under this discipline yet ────────────
                 The studio offers all three and has photographed two, so this
                 is a state the site is in today rather than a defensive
                 branch — /services/architecture renders it until the first
                 architecture project is published with the discipline set.

                 It says what is true and offers the two ways on: the rest of
                 the work, and a conversation. An empty grid with a heading
                 over it would read as a page that failed. */
              <Reveal>
                <div className="max-w-[46ch] border-t border-emerald/12 pt-10">
                  <p className="font-serif text-[1.5rem] leading-[1.35] text-emerald/70 italic md:text-[1.75rem]">
                    {`${discipline.title} commissions are not published here yet.`}
                  </p>
                  <p className="mt-5 max-w-[42ch]">
                    The practice works across all three disciplines — the
                    photographs for this one are still being prepared.
                  </p>
                  <span className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
                    <SmoothLink
                      href="/projects"
                      className="-my-1.5 inline-block border-b border-gold/50 py-1.5 font-label text-gold-ink transition-colors duration-300 hover:text-emerald"
                    >
                      See all the work
                    </SmoothLink>
                    <SmoothLink
                      href="/contact"
                      className="-my-1.5 inline-block border-b border-gold/50 py-1.5 font-label text-gold-ink transition-colors duration-300 hover:text-emerald"
                    >
                      Start a conversation
                    </SmoothLink>
                  </span>
                </div>
              </Reveal>
            )}
          </PageContainer>
        </section>

        {/* The enquiry form, which is where every path on this site ends. */}
        <Contact backdrop={siteImages.contactBackdrop} />
      </main>
    </>
  );
}
