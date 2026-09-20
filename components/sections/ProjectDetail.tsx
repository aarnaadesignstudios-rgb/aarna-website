/**
 * ProjectDetail — one commission, at length. Rendered by both project routes.
 *
 * ── Why this is a component and not two pages ────────────────────────────
 *
 * The site has TWO separate collections of projects and they are deliberately
 * unrelated (see sanity/schemas/index.ts):
 *
 *   · `work` — the five or so on the Selected Works ring, at /work/<slug>
 *   · `disciplineProject` — the catalogue under What we do, at
 *     /services/<discipline>/<slug>
 *
 * They are separate CONTENT — separate document types, separate Studio
 * sections, separate URLs, and a project in one is not a project in the other
 * even if it is the same building. What they are not is a separate DESIGN. A
 * commission's page is a cover, a spec, a write-up, the drawings, the
 * photographs and a pager, and there is exactly one right way for this studio
 * to draw that.
 *
 * So the separation the studio asked for is in the data, and this file is why
 * it did not also become 600 duplicated lines that drift the first time either
 * page is touched.
 *
 * ── The three things the two routes do differently ───────────────────────
 *
 * All of them are props, because all of them are about WHERE the page sits
 * rather than what it contains:
 *
 *   · `backHref` / `backLabel` — "← Selected Works" against "← Architecture"
 *   · `hrefFor` — how a neighbour's slug becomes a URL
 *   · `backdrop` — the enquiry form's photograph, already read by the route
 *
 * `hrefFor` matters more than it looks. The pager at the foot walks the
 * neighbours WITHIN one collection, and its hrefs have to stay in that
 * collection: a "Next →" that silently moved a visitor from the ring into the
 * discipline catalogue would be the one place the separation leaked.
 *
 * ── Everything on it is optional ─────────────────────────────────────────
 *
 * A project has a name, a category and one photograph — those are required by
 * the schema. The write-up, the gallery, the location, the area and the year
 * are all optional, and this page is built so that a project with none of them
 * still reads as a finished page rather than as a broken one: the sections
 * simply are not there.
 *
 * That is not defensive coding for its own sake. It is what lets the studio
 * publish a commission the day the photographs come back and write it up the
 * following week, instead of having to choose between an empty page and no
 * page.
 */
import Contact from "@/components/sections/Contact";
import {
  Media,
  PageContainer,
  ProjectBody,
  Reveal,
  SmoothLink,
} from "@/components/ui";
import type { Photograph, WorkDetail, WorkLink } from "@/types";

interface ProjectDetailProps {
  work: WorkDetail;
  /** Where the "←" at the top of the cover goes. */
  backHref: string;
  /** Its label, without the arrow — "Selected Works", "Architecture". */
  backLabel: string;
  /** A neighbouring project's slug to its URL, inside the same collection. */
  hrefFor: (id: string) => string;
  /** The photograph behind the enquiry form at the foot of the page. */
  backdrop: Photograph;
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
 * The heading over Layout and over Gallery.
 *
 * One component rather than the same six lines twice, because the whole point
 * of the pair is that they are the same object: two labels on two grids that
 * a visitor has to be able to tell apart at a glance. If one drifts — a
 * different size, a rule of a different width — they stop reading as a set and
 * start reading as one section that was styled and one that was not.
 *
 * The hairline is the site's recurring gesture, the same rule <Services /> and
 * <Contact /> open with, so a heading appearing on a page that otherwise has
 * none still reads as part of the same drawing.
 */
function SectionMark({ children }: { children: string }) {
  return (
    <Reveal>
      <span aria-hidden className="mb-5 block h-px w-16 bg-gold" />
      <h2 className="font-serif text-[2rem] leading-[1.1] text-emerald md:text-[2.4rem]">
        {children}
      </h2>
    </Reveal>
  );
}

/**
 * A drawing's plate, as a CSS `aspect-ratio`.
 *
 * ── Why the plate takes the DRAWING's shape ──────────────────────────────
 *
 * Photographs get a frame the layout chose and are cropped into it. A plan
 * cannot be cropped — what a crop takes off a floor plan is rooms — so the
 * only other way to fit one into a fixed frame is to letterbox it, and a
 * letterboxed plan is rendered smaller than the space allows. Measured on a
 * 1440 screen with a 4:3 plate: a 472×175 drawing painted at 618×229 inside a
 * 644×483 box, so 47% of the plate was blank and the plan was drawn at about
 * half the size the column could have given it. For something a visitor is
 * trying to READ, that is the whole point lost.
 *
 * So the plate is cut to the drawing. `object-contain` stays on the image as a
 * safety net — with a matching plate it has nothing to do, and if the ratio is
 * ever wrong it letterboxes rather than cropping.
 *
 * ── The clamp, and why it is not symmetrical ─────────────────────────────
 *
 * An unclamped ratio lets one uploaded file decide how tall the page is. The
 * bounds are the shapes architectural drawings actually come in, with room
 * either side:
 *
 *   · 2.6 wide. A long building section or a street elevation is legitimately
 *     2:1 or wider. Past this a half-column plate is a ~250px-tall sliver, and
 *     a drawing that long is better given `wide` and the full measure anyway.
 *   · 0.75 tall. Plans are landscape or square far more often than portrait,
 *     so the tall bound is tighter: at 0.75 a half-width plate on a phone is
 *     already ~455px, and anything squarer than that pushes a single drawing
 *     past the viewport.
 *
 * A file outside the bounds is not rejected — it is fitted into the nearest
 * allowed plate and letterboxed by `object-contain`, which is exactly the
 * behaviour the fixed plate used to give everything.
 *
 * ── The rows are not forced level, and that is the trade ─────────────────
 *
 * Two drawings of different proportions side by side end at different heights,
 * and the shorter one has its caption followed by white space. The alternative
 * is a plate every drawing is fitted INTO, which levels the row by letterboxing
 * — i.e. by drawing every plan smaller than the column allows, permanently, to
 * tidy a case that mostly does not arise: a set of plans for one project comes
 * off the same sheet size, so in practice the ratios match and the rows come
 * out level on their own. Paying readability for symmetry is the wrong way
 * round when the thing on the plate is meant to be read.
 */
const PLATE_MIN = 0.75;
const PLATE_MAX = 2.6;
const plate = (aspect?: number) =>
  aspect && Number.isFinite(aspect)
    ? Math.min(PLATE_MAX, Math.max(PLATE_MIN, aspect))
    : 4 / 3;

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
function Sibling({
  work,
  side,
  hrefFor,
}: {
  work: WorkLink;
  side: "prev" | "next";
  /* Supplied by the caller, because the two collections live at different
     addresses: a Selected Works project is /work/<slug> and a discipline
     project is /services/<discipline>/<slug>. The pager must never hand a
     visitor across that boundary — see the note on <ProjectDetail />. */
  hrefFor: (id: string) => string;
}) {
  const isNext = side === "next";
  return (
    <SmoothLink
      href={hrefFor(work.id)}
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


export default function ProjectDetail({
  work,
  backHref,
  backLabel,
  hrefFor,
  backdrop,
}: ProjectDetailProps) {
  const spec: [string, string][] = [
    ["Discipline", work.category],
    ...(work.location ? ([["Location", work.location]] as [string, string][]) : []),
    ...(work.area ? ([["Area", work.area]] as [string, string][]) : []),
    ...(work.year ? ([["Year", work.year]] as [string, string][]) : []),
  ];
  const gallery = work.gallery ?? [];
  const plans = work.plans ?? [];
  const hasBody = Array.isArray(work.body) && work.body.length > 0;
  const { prev, next } = work.siblings ?? {};

  return (
    <>
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
                href={backHref}
                /* `-my-1.5 py-1.5` grows the tap target to 26px without moving
                   the label: 12px type on its own is a 14px-tall hit area, and
                   this is the page's only way back to the collection it came
                   from. */
                className="-my-1.5 inline-block py-1.5 font-label text-cream/70 transition-colors duration-300 hover:text-gold-soft"
              >
                {`← ${backLabel}`}
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

        {/* ── The layout ──────────────────────────────────────────────────
            The drawings: floor plans, site plans, sections. Placed between the
            write-up and the photographs, which is the order someone reads a
            project in — what it is, how it is arranged, what it looks like.

            ── Layout and Gallery are a PAIR of headings ───────────────────
            The cover names the project and the write-up is obviously the
            write-up, so neither is labelled. These two are, and the reason is
            that they are the only two things on the page that look alike from
            across the room: at half-page size a floor plan and an abstract
            line-work photograph are both pale rectangles with marks on them.
            A visitor who does not know they are looking at a plan does not
            read it as one.

            One heading would have been worse than none. Labelling only the
            drawings implies the unlabelled grid below is more of the same,
            which is exactly the confusion the label existed to prevent — so
            the photographs carry "Gallery" for the same reason these carry
            "Layout". See <SectionMark /> above, which is both of them.

            Drawings come FIRST: how the building is arranged, then what it
            looks like. That is the order an architect presents a project in
            and the order the write-up above has just finished describing. */}
        {plans.length > 0 && (
          <section className="bg-paper relative pb-20 md:pb-24">
            <PageContainer>
              <SectionMark>Layout</SectionMark>

              {/* ── Two up, and it adapts three ways ────────────────────────
                    · WIDTH. One column below `md`, where a half-page plan on a
                      390px screen is ~170px wide and the room labels are
                      unreadable at any zoom the page allows.
                    · COUNT. A single drawing takes the full measure. Half a
                      row of plan and half a row of nothing reads as a missing
                      second plan, and a lone plan is usually the whole layout
                      anyway. An odd count simply ends on a half, as the
                      photographs do.
                    · THE DRAWING. `wide` is the studio's per-plan call, for a
                      long section or a site plan that is illegible at half
                      size — the same control the photographs have. */}
              {/* `items-start`, because the plates are no longer a uniform
                  height. A grid item defaults to `stretch`, which would pull
                  the shorter of two side-by-side drawings down to the taller
                  one's height — and since the plate's height is now set by its
                  `aspect-ratio`, stretching it would either be ignored or
                  reintroduce the letterboxing this replaced. */}
              <div className="mt-8 grid grid-cols-1 items-start gap-5 md:mt-10 md:grid-cols-2 md:gap-6">
                {plans.map((plan) => (
                  <Reveal
                    key={plan.id}
                    className={
                      plan.wide || plans.length === 1
                        ? "md:col-span-2"
                        : undefined
                    }
                  >
                    <figure>
                      {/* ── A sheet, not a photographic plate ───────────────
                          `bg-white` with a hairline, where the photographs sit
                          on `bg-mist` with none. A drawing is ink on paper and
                          it arrives as a PNG with a white ground: on the
                          section's `bg-paper` — a warm off-white — an
                          uncontained white image has no edge at all and the
                          plan appears to float in the page. The rule draws the
                          sheet.

                          `object-contain`, and this is the whole reason
                          <Media /> has a `fit` prop. `object-cover` would crop
                          the drawing to 4:3, and what a crop takes off a floor
                          plan is rooms. Contained, the plate letterboxes
                          whatever the drawing's real proportions are — which
                          for plans vary far more than for photographs — and
                          every one arrives whole.

                          `p-3` so the drawing does not run into its own rule,
                          the way a plan is trimmed inside a sheet. */}
                      <div
                        className="relative w-full overflow-hidden rounded-xl border border-emerald/12 bg-white p-3"
                        style={{ aspectRatio: plate(plan.aspect) }}
                      >
                        <div className="relative size-full">
                          <Media
                            src={plan.src}
                            alt={plan.alt}
                            fit="contain"
                            sizes={
                              plan.wide || plans.length === 1
                                ? "(max-width: 768px) 100vw, 90vw"
                                : "(max-width: 768px) 100vw, 45vw"
                            }
                          />
                        </div>
                      </div>
                      {/* Not optional in practice — a set of plans is
                          unreadable without "Ground floor" under each one —
                          but still guarded, because a single site plan on its
                          own needs no label and an empty caption line under it
                          would be a gap. */}
                      {plan.caption && (
                        <figcaption className="mt-3 font-label text-charcoal/50">
                          {plan.caption}
                        </figcaption>
                      )}
                    </figure>
                  </Reveal>
                ))}
              </div>
            </PageContainer>
          </section>
        )}

        {/* ── The photographs ─────────────────────────────────────────────
            Two up, with any picture the studio marked `wide` taking the full
            measure. The grid adapts to whatever number arrives: one photograph
            is one full-width plate, an odd count simply ends on a half.

            Headed "Gallery", against "Layout" above it — see the note there
            for why both carry a label rather than neither. Unlike the
            drawings, these keep a FIXED plate and are cropped into it: a
            photograph loses an unimportant edge to a crop, and a tidy grid is
            worth that. A plan loses rooms, which is why the section above
            does the opposite. */}
        {gallery.length > 0 && (
          <section className="bg-paper relative pb-24 md:pb-32">
            <PageContainer>
              <SectionMark>Gallery</SectionMark>
              <div className="mt-8 grid grid-cols-1 gap-5 md:mt-10 md:grid-cols-2 md:gap-6">
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
                  <Sibling work={prev} side="prev" hrefFor={hrefFor} />
                ) : (
                  /* Holds the left end of the row so a lone `next` stays
                     ranged right. `hidden` below `sm`, where the row is a
                     stack and an empty cell would be a gap in it. */
                  <span aria-hidden className="hidden sm:block" />
                )}
                {next && <Sibling work={next} side="next" hrefFor={hrefFor} />}
              </div>
            </PageContainer>
          </section>
        )}

      {/* The enquiry form, which is where every path on this site ends. */}
      <Contact backdrop={backdrop} />
    </>
  );
}
