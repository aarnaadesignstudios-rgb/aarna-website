import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Contact from "@/components/sections/Contact";
import {
  Media,
  PageContainer,
  ProjectBody,
  Reveal,
  SmoothLink,
} from "@/components/ui";
import { SITE } from "@/constants";
import { getSiteImages, getWork, getWorkSlugs } from "@/sanity/lib/content";
import type { WorkLink } from "@/types";

/**
 * /work/[slug] — one commission, at length.
 *
 * ── Where this sits in the site ──────────────────────────────────────────
 *
 * The ring on the home page is a shop window: nine photographs turning past,
 * each captioned with a name and a category and nothing else. Every card used
 * to link to #contact, which meant the only thing a visitor could do with a
 * project that interested them was ask about a different one. This is what a
 * card leads to now.
 *
 * ── Everything on it is optional ─────────────────────────────────────────
 *
 * A project has a name, a category and one photograph — those are required by
 * the schema, because without them it cannot appear on the ring at all. The
 * write-up, the gallery, the location, the area and the year are all optional,
 * and this page is built so that a project with none of them still reads as a
 * finished page rather than as a broken one: the sections simply are not there.
 *
 * That is not defensive coding for its own sake. It is what lets the studio
 * publish a commission the day the photographs come back and write it up the
 * following week, instead of having to choose between an empty page and no
 * page.
 *
 * ── Prerendered, and revalidated by the webhook ──────────────────────────
 *
 * `generateStaticParams` builds a page per project at deploy time; the
 * `work` cache tag means publishing in the Studio drops exactly these pages
 * and nothing else. See app/api/revalidate/route.ts.
 */

export const revalidate = 3600;

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

  // The write-up is Portable Text, so its opening paragraph has to be walked
  // out of the block array rather than sliced off a string.
  const firstParagraph = Array.isArray(work.body)
    ? (work.body as { _type?: string; children?: { text?: string }[] }[])
        .find((b) => b?._type === "block" && b.children?.length)
        ?.children?.map((c) => c.text ?? "")
        .join("") ?? ""
    : "";
  const description =
    work.description?.trim() ||
    firstParagraph.trim() ||
    `${work.title} — ${work.category} by ${SITE.name}.`;

  return {
    title: work.title,
    description: description.slice(0, 180),
    openGraph: {
      title: `${work.title} — ${SITE.name}`,
      description: description.slice(0, 180),
      images: work.image ? [{ url: work.image }] : undefined,
    },
  };
}

/** The spec strip. Renders only the facts that exist. */
function Spec({ items }: { items: [string, string][] }) {
  if (!items.length) return null;
  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-7 border-t border-emerald/12 pt-8 sm:grid-cols-3 lg:grid-cols-1 lg:border-t-0 lg:pt-0">
      {items.map(([label, value]) => (
        <div key={label}>
          {/* 65%, matching the meta slot in <SectionHeading />. At 45 these
              12px spec labels measured 2.8:1 on paper. */}
          <dt className="font-label text-charcoal/65">{label}</dt>
          <dd className="mt-1.5 font-serif text-xl leading-snug text-emerald">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * The next / previous pair at the foot of the page.
 *
 * ── It was a second gallery, and it should be a signpost ──────────────────
 *
 * This used to be a 16:9 plate at half the page width — measured at 640×360 on
 * a 1440 screen, with the title set at `text-3xl` beneath it. Two things went
 * wrong with that. It out-shouted the project's OWN gallery directly above it,
 * so the page ended on a big photograph of a different commission; and where a
 * project has only one neighbour — the first and last always do — the other
 * half of the row was 640px of nothing.
 *
 * So it is a signpost now: a small square thumbnail, the direction, and the
 * name, on one line. The two ends of the row read as a footer rather than as
 * more work, the empty half is small enough to pass as margin, and the eye
 * leaves the page on the studio's photographs rather than on a thumbnail.
 *
 * `flex-row-reverse` for `next` mirrors the whole thing — image outboard, type
 * inboard — so the pair points outward from the centre in the direction each
 * one travels.
 *
 * ── Two things fixed on the way past ──────────────────────────────────────
 *  · `sizes` was `45vw`, which asked for a ~650px image for what is now an
 *    80px thumbnail. It is the real box now, so the browser fetches a
 *    thumbnail-sized file.
 *  · `cardLabel` was missing, so the chapter card covering the navigation
 *    announced the raw CMS slug — "33424" — instead of the project's name.
 *    Same fix as the ring's cards; see <SelectedWorks />.
 */
function Sibling({ work, side }: { work: WorkLink; side: "prev" | "next" }) {
  const isNext = side === "next";
  return (
    <SmoothLink
      href={`/work/${work.id}`}
      cardLabel={work.title}
      /* `ml-auto` on the next-ward one: below `sm` the pair is a stacked
         column, where `justify-between` has no horizontal axis to work on and
         the block would otherwise sit wherever its own width left it — mirrored
         but not ranged. In the `sm` row it is a no-op, because
         `justify-between` has already pushed it to the far end. */
      className={`group flex max-w-[17rem] items-center gap-4 ${
        isNext ? "ml-auto flex-row-reverse text-right" : ""
      }`}
    >
      <span className="relative block size-16 shrink-0 overflow-hidden rounded-lg bg-emerald-deep md:size-20">
        <Media
          src={work.image}
          alt=""
          objectPosition={work.objectPosition}
          sizes="80px"
          className="transition-transform duration-700 ease-editorial group-hover:scale-108"
        />
        {/* A whisper of a veil, not the 45% the full plate carried. At this
            size a heavy tint stops reading as treatment and just makes the
            thumbnail muddy. */}
        <span
          aria-hidden
          className="absolute inset-0 bg-emerald/20 transition-colors duration-500 group-hover:bg-transparent"
        />
      </span>
      <span className="min-w-0">
        <span className="block font-label text-gold-ink">
          {isNext ? "Next →" : "← Previous"}
        </span>
        <span className="mt-1 block truncate font-serif text-xl leading-tight tracking-tight text-emerald transition-colors duration-500 group-hover:text-gold-ink md:text-2xl">
          {work.title}
        </span>
      </span>
    </SmoothLink>
  );
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  /**
   * In parallel, and the backdrop is fetched even for a slug that turns out not
   * to exist — a wasted read on the 404 path, against a serialised round trip
   * on every real project page. The 404s are the rare case.
   */
  const [work, siteImages] = await Promise.all([getWork(slug), getSiteImages()]);

  // A URL that names no project is a 404, never a redirect to a different one —
  // see the note on `getWork`.
  if (!work) notFound();

  const spec: [string, string][] = [
    ["Discipline", work.category],
    ...(work.location ? ([["Location", work.location]] as [string, string][]) : []),
    ...(work.area ? ([["Area", work.area]] as [string, string][]) : []),
    ...(work.year ? ([["Year", work.year]] as [string, string][]) : []),
  ];
  const gallery = work.gallery ?? [];
  const hasBody = Array.isArray(work.body) && work.body.length > 0;
  const { prev, next } = work.siblings ?? {};

  return (
    <>
      <Navbar />

      <main>
        {/* ── The cover ───────────────────────────────────────────────────
            Full-bleed, the way the home page's hero opens, and for the same
            reason: the work should be the first thing that speaks. The title
            sits ON the photograph rather than under it so the page starts with
            one image instead of an image and a header competing. */}
        <section
          data-chrome="dark"
          data-hero
          className="relative flex min-h-[82vh] items-end overflow-hidden bg-emerald-deep text-cream"
        >
          <div className="absolute inset-0">
            <Media
              src={work.image}
              alt={work.title}
              objectPosition={work.objectPosition}
              priority
              sizes="100vw"
            />
            {/* Neutral, not green: a green scrim over a photograph tints the
                materials in it, which on a page about interiors is the one
                thing a scrim must not do. See --color-ink. */}
            <div
              aria-hidden
              className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/35 to-ink/10"
            />
          </div>

          <PageContainer className="relative z-10 pb-14 md:pb-20">
            <Reveal>
              <SmoothLink
                href="/projects"
                /* `-my-1.5 py-1.5` grows the tap target to 26px without moving
                   the label: 12px type on its own is a 14px-tall hit area, and
                   this is the page's only way back to the gallery. */
                className="-my-1.5 inline-block py-1.5 font-label text-cream/70 transition-colors duration-300 hover:text-gold-soft"
              >
                {"← Selected Works"}
              </SmoothLink>
              <p className="mt-7 font-label text-gold-soft">{work.category}</p>
              <h1 className="mt-3 max-w-[16ch] font-serif text-[2.6rem] leading-[1.02] tracking-tight md:text-6xl lg:text-7xl">
                {work.title}
              </h1>
            </Reveal>
          </PageContainer>
        </section>

        {/* ── The write-up, with the spec alongside ───────────────────────
            Two columns at `lg`: the facts in the margin, the prose in the
            measure. Below that they stack, spec first — on a phone the facts
            are the part someone scrolling wants soonest. */}
        <section
          className={`bg-paper relative ${
            // A project published before it has been written up has one line in
            // this band. At the full rhythm that line floats in ~500px of empty
            // paper, which reads as a page that failed to load rather than as a
            // page that is waiting for copy. The spacing follows the content.
            hasBody || work.description ? "py-20 md:py-28" : "py-14 md:py-16"
          }`}
        >
          <PageContainer>
            <div className="grid gap-14 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-20">
              <Reveal className="lg:sticky lg:top-32 lg:self-start">
                <Spec items={spec} />
              </Reveal>

              <div>
                {/* The one-line description is the standfirst when there is a
                    body under it, and the whole write-up when there is not. */}
                {work.description && (
                  <Reveal>
                    <p className="max-w-[38ch] font-serif text-[1.5rem] leading-[1.35] text-emerald md:text-[1.85rem]">
                      {work.description}
                    </p>
                  </Reveal>
                )}

                {hasBody && (
                  <Reveal>
                    <div className={work.description ? "mt-12" : ""}>
                      <ProjectBody value={work.body} />
                    </div>
                  </Reveal>
                )}

                {/* Nothing written yet. Rather than an empty column, the page
                    closes the gap — the cover, the spec and the gallery are a
                    complete page on their own. */}
                {!work.description && !hasBody && (
                  <p className="font-serif text-[1.5rem] leading-[1.35] text-emerald/70 italic">
                    {`${work.category} — ${work.title}.`}
                  </p>
                )}
              </div>
            </div>
          </PageContainer>
        </section>

        {/* ── The photographs ─────────────────────────────────────────────
            Two up, with any picture the studio marked `wide` taking the full
            measure. The grid adapts to whatever number arrives: one photograph
            is one full-width plate, an odd count simply ends on a half. */}
        {gallery.length > 0 && (
          <section className="bg-paper relative pb-24 md:pb-32">
            <PageContainer>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                {gallery.map((shot) => (
                  <Reveal
                    key={shot.id}
                    className={shot.wide ? "md:col-span-2" : undefined}
                  >
                    <figure>
                      <div
                        className={`relative w-full overflow-hidden rounded-xl bg-mist ${
                          shot.wide ? "aspect-16/9" : "aspect-4/3"
                        }`}
                      >
                        <Media
                          src={shot.src}
                          alt={shot.alt}
                          objectPosition={shot.objectPosition}
                          sizes={
                            shot.wide
                              ? "(max-width: 768px) 100vw, 90vw"
                              : "(max-width: 768px) 100vw, 45vw"
                          }
                          className="scale-[1.02] transition-transform duration-[1400ms] ease-editorial hover:scale-[1.06]"
                        />
                      </div>
                      {shot.caption && (
                        <figcaption className="mt-3 font-label text-charcoal/50">
                          {shot.caption}
                        </figcaption>
                      )}
                    </figure>
                  </Reveal>
                ))}
              </div>
            </PageContainer>
          </section>
        )}

        {/* ── Where to go next ────────────────────────────────────────────
            The neighbouring commissions, so the page has an exit that is not
            the back button. Only rendered when there is one — the first and
            last projects have a single neighbour each. */}
        {(prev || next) && (
          /* Shallower than the py-16/20 it was: the row is a signpost now
             rather than a gallery, and it no longer needs a gallery's air. */
          <section className="bg-paper relative border-t border-emerald/10 py-10 md:py-12">
            <PageContainer>
              {/* `justify-between` on a flex, not a two-column grid. The grid
                  reserved a half-page cell for a neighbour that may not exist —
                  the first and last projects each have only one — and filled it
                  with an empty <span>. Here a lone `next` simply ranges right
                  and a lone `prev` ranges left, which is what a pager does.

                  Stacked below `sm`, where two of these side by side would each
                  be about 150px wide and the names would all truncate. */}
              <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
                {prev ? (
                  <Sibling work={prev} side="prev" />
                ) : (
                  /* Holds the left end of the row so a lone `next` stays
                     ranged right. `hidden` below `sm`, where the row is a
                     stack and an empty cell would be a gap in it. */
                  <span aria-hidden className="hidden sm:block" />
                )}
                {next && <Sibling work={next} side="next" />}
              </div>
            </PageContainer>
          </section>
        )}

        {/* The enquiry form, which is where every path on this site ends. */}
        <Contact backdrop={siteImages.contactBackdrop} />
      </main>
    </>
  );
}
