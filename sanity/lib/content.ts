import "server-only";

import { groq } from "next-sanity";

import {
  ACCOLADES,
  CLIENTS,
  DISCIPLINE_PROJECTS,
  HERO_SLIDES,
  SITE_IMAGES,
  TESTIMONIALS,
  WORKS,
} from "@/constants";
import type {
  Credit,
  HeroSlide,
  SiteImages,
  Testimonial,
  Work,
  WorkDetail,
  WorkLink,
} from "@/types";

import { client } from "./client";
import { aspectFromRef, resolvePhoto, type Photo } from "./image";
import type { ContentTag } from "./tags";

/**
 * Reading content, with the constants as the floor.
 *
 * ── Every read here can fail and the site still works ─────────────────────
 *
 * Three things can be true, and all three are supported:
 *
 *   1. Sanity is not configured  → the constants, unchanged
 *   2. Sanity is configured but empty (a fresh project, before anyone has
 *      uploaded anything) → the constants, unchanged
 *   3. Sanity has content → the CMS wins
 *
 * (2) is the one that is easy to get wrong and the one that matters most in
 * practice: it is the state the project is in for the whole gap between
 * creating it and the studio finishing their first upload. Falling back on an
 * empty result means that gap is invisible rather than being a blank ring.
 *
 * A network failure lands in the same place. `fetch` throwing during a render
 * would take out the page over a photograph, which is never the right trade.
 *
 * `server-only` is imported for real, not as a comment: it makes a client
 * component importing this file a BUILD error rather than a runtime surprise.
 */

/**
 * How long a read stays cached when NOTHING tells the site to drop it.
 *
 * ── This is the fallback, not the mechanism ───────────────────────
 *
 * Publishing in the Studio fires a webhook at `app/api/revalidate/route.ts`,
 * which drops the tag for the type that changed — so an edit is live in
 * SECONDS, and this number has nothing to do with it. What this number decides
 * is how wrong the site can be when that push does not arrive: the webhook is
 * not configured yet, a delivery failed, someone edited through the API instead
 * of the Studio.
 *
 * It was an hour, which is a long time to be showing the wrong photograph
 * because a webhook was misconfigured — and "an hour" is indistinguishable from
 * "broken" to whoever just published. Ten minutes is short enough that a
 * missing webhook reads as a delay rather than a failure.
 *
 * ── It costs almost nothing, because it is not a timer ──────────────
 *
 * Next does not poll. The window only means "the next request after this has
 * elapsed refetches in the background, and serves the stale copy while it
 * does". So the number of extra reads is bounded by TRAFFIC, not by the clock:
 * a quiet hour costs nothing at all, and a busy one costs at most one refetch
 * per tag per window. Six tags at six windows an hour is a few hundred reads a
 * day against a free-plan allowance of a million a month.
 *
 * The practical floor is that stale-while-revalidate serves ONE visitor the old
 * content after the window expires — the one whose request triggers the
 * refetch. Shortening this further buys less than it looks like it does, which
 * is the other reason the fix for "my edit is not showing" is the webhook.
 */
const REVALIDATE_SECONDS = 600;

/** Field-for-field what `Work` needs, so the mapping below stays honest. */
const WORK_FIELDS = groq`
  "id": coalesce(slug.current, _id),
  title,
  category,
  description,
  location,
  area,
  year,
  photo
`;

const WORKS_QUERY = groq`*[_type == "work"] | order(order asc, _createdAt asc) { ${WORK_FIELDS} }`;

type WorkDoc = {
  id: string;
  title: string;
  category: string;
  discipline?: string;
  description?: string;
  location?: string;
  area?: string;
  year?: string;
  photo?: Photo;
};

/**
 * The panel widths are still code, deliberately.
 *
 * They are uneven on purpose so the ring never reads as a carousel, and the
 * value is a CSS length tuned against the card geometry — not something a
 * studio should be asked to nominate per project. Cycling a fixed set keeps the
 * rhythm whatever number of projects exists.
 */
const WIDTHS = [
  "min(78vw, 980px)",
  "min(52vw, 660px)",
  "min(66vw, 860px)",
  "min(46vw, 560px)",
  "min(60vw, 780px)",
  "min(44vw, 540px)",
  "min(58vw, 740px)",
  "min(50vw, 620px)",
  "min(56vw, 700px)",
] as const;

/**
 * A project document → the `Work` the site renders.
 *
 * ── Shared by BOTH project collections ───────────────────────────────────
 *
 * `work` and `disciplineProject` are separate document types on purpose (see
 * ../schemas/index.ts) and they share a field set, so they share this. Two
 * copies of the mapping would drift the first time a field was added, and the
 * symptom would be a field that works on one kind of project page and is
 * silently blank on the other.
 */
function toWork(doc: WorkDoc, i: number): Work {
  const photo = resolvePhoto(doc.photo, doc.title);
  return {
    id: doc.id,
    title: doc.title,
    category: doc.category,
    discipline: doc.discipline,
    description: doc.description ?? "",
    location: doc.location,
    area: doc.area,
    year: doc.year,
    image: photo?.src ?? "",
    objectPosition: photo?.objectPosition,
    width: WIDTHS[i % WIDTHS.length] ?? WIDTHS[0],
  };
}

/** A sibling row from a list query → the pager's `WorkLink`. */
function linkFromDoc(
  w: { id: string; title: string; category: string; photo?: Photo } | undefined
): WorkLink | undefined {
  if (!w) return undefined;
  const p = resolvePhoto(w.photo, w.title);
  return {
    id: w.id,
    title: w.title,
    category: w.category,
    image: p?.src ?? "",
    objectPosition: p?.objectPosition,
  };
}

/** A committed `Work` → the pager's `WorkLink`, for the constants path. */
function workLink(w: Work | undefined): WorkLink | undefined {
  return (
    w && {
      id: w.id,
      title: w.title,
      category: w.category,
      image: w.image,
      objectPosition: w.objectPosition,
    }
  );
}

export async function getWorks(): Promise<Work[]> {
  if (!client) return WORKS;

  try {
    const docs = await client.fetch<WorkDoc[]>(
      WORKS_QUERY,
      {},
      {
        // Tagged so the publish webhook can drop exactly this and nothing else
        // — see app/api/revalidate/route.ts.
        next: { tags: ["work" satisfies ContentTag], revalidate: REVALIDATE_SECONDS },
      }
    );

    if (!docs?.length) return WORKS;

    return docs.map(toWork);
  } catch {
    // A photograph is never worth taking the page down for.
    return WORKS;
  }
}

/* ────────────────────────────────────────────────────────────────────────
   Hero
   ──────────────────────────────────────────────────────────────────────── */

const HERO_QUERY = groq`*[_type == "heroSlide"] | order(order asc, _createdAt asc) {
  "id": coalesce(slug.current, _id),
  title,
  photo,
  mobilePhoto
}`;

type HeroDoc = {
  id: string;
  title: string;
  photo?: Photo;
  mobilePhoto?: Photo;
};

/**
 * The opening screen's frames.
 *
 * Same three-way fallback as `getWorks()`, and the same reason: an empty
 * `heroSlide` collection has to leave the studio's own four photographs in
 * place rather than opening the site on a blank screen.
 *
 * ── Why a slide with no usable image is DROPPED, not rendered ────────────
 *
 * `resolvePhoto` returns null when the document has no asset — a slide saved
 * with a name but no photograph yet, which is a normal half-finished state in
 * a Studio. Rendering it would put an empty frame into a cycle that holds each
 * one for two seconds, so the hero would go blank for two seconds on every
 * pass. Dropping it means an unfinished slide is invisible until it is
 * finished, and if that leaves nothing at all we fall back to the constants.
 */
export async function getHeroSlides(): Promise<HeroSlide[]> {
  if (!client) return HERO_SLIDES;

  try {
    const docs = await client.fetch<HeroDoc[]>(
      HERO_QUERY,
      {},
      { next: { tags: ["heroSlide" satisfies ContentTag], revalidate: REVALIDATE_SECONDS } }
    );

    if (!docs?.length) return HERO_SLIDES;

    const slides = docs.flatMap((doc) => {
      const photo = resolvePhoto(doc.photo, doc.title);
      if (!photo) return [];
      /**
       * The phone crop is optional in both directions: a slide can have one and
       * a slide can not, and `mobileImage` being undefined is what tells
       * <Media /> to render a plain <Image /> rather than a <picture>. So an
       * unused field costs the page nothing — see components/ui/Media.tsx.
       */
      const mobile = resolvePhoto(doc.mobilePhoto, photo.alt || doc.title);
      return [
        {
          id: doc.id,
          image: photo.src,
          alt: photo.alt || doc.title,
          title: doc.title,
          position: photo.objectPosition,
          mobileImage: mobile?.src,
          mobilePosition: mobile?.objectPosition,
        },
      ];
    });

    return slides.length ? slides : HERO_SLIDES;
  } catch {
    return HERO_SLIDES;
  }
}

/* ────────────────────────────────────────────────────────────────────────
   One project, and its own page
   ──────────────────────────────────────────────────────────────────────── */

/**
 * ── Why this is a second query and not a bigger first one ────────────────
 *
 * `getWorks()` reads all nine projects to build the ring, and the ring needs a
 * name, a category and one photograph from each. If the write-ups and the
 * galleries were folded into that query, every visit to the home page would
 * pull every word and every photograph reference of every project in order to
 * render nine headings and throw the rest away.
 *
 * So the page-only content is read one project at a time, by slug, on the route
 * that actually shows it.
 */
const DETAIL_FIELDS = groq`
  "id": coalesce(slug.current, _id),
  title,
  category,
  description,
  location,
  area,
  year,
  photo,
  body,
  plans,
  gallery,
  order
`;

const WORK_QUERY = groq`*[_type == "work" && coalesce(slug.current, _id) == $slug][0] { ${DETAIL_FIELDS} }`;

/**
 * The neighbours, for the "next project" pair at the foot of the page.
 *
 * Read in the same round trip as the project itself rather than as a second
 * request: it is the same dataset, the same moment, and a page that renders
 * before it knows what follows it would have to shift when it found out.
 */
const SIBLINGS_QUERY = groq`*[_type == "work"] | order(order asc, _createdAt asc) {
  "id": coalesce(slug.current, _id), title, category, photo
}`;

type GalleryDoc = Photo & { caption?: string; wide?: boolean };

type DetailDoc = WorkDoc & {
  body?: unknown[];
  /* Same shape as a gallery entry on the wire — an image with a caption and a
     width flag. What differs is how the page renders it; see `WorkPlan`. */
  plans?: GalleryDoc[];
  gallery?: GalleryDoc[];
  order?: number;
};

/** Slugs for `generateStaticParams` — every project gets a prerendered page. */
export async function getWorkSlugs(): Promise<string[]> {
  if (!client) return WORKS.map((w) => w.id);
  try {
    const ids = await client.fetch<string[]>(
      groq`*[_type == "work"].slug.current`,
      {},
      { next: { tags: ["work" satisfies ContentTag], revalidate: REVALIDATE_SECONDS } }
    );
    const real = (ids ?? []).filter(Boolean);
    // An unconfigured or empty dataset still has to produce the nine pages the
    // committed constants describe, or every project on the home page would
    // link to a 404 the moment Sanity was unreachable.
    return real.length ? real : WORKS.map((w) => w.id);
  } catch {
    return WORKS.map((w) => w.id);
  }
}

/** Build a detail record out of the committed constants. */
function detailFromConstants(slug: string): WorkDetail | null {
  const i = WORKS.findIndex((w) => w.id === slug);
  if (i === -1) return null;
  return {
    ...WORKS[i]!,
    siblings: { prev: workLink(WORKS[i - 1]), next: workLink(WORKS[i + 1]) },
  };
}

/**
 * One project by slug, or null if there is no such project.
 *
 * Null is a real answer here and the route turns it into a 404 — unlike the
 * list reads above, "we could not find it" must not fall back to showing
 * something else, because the something else would be a different commission
 * under the URL of the one that was asked for.
 *
 * A network FAILURE still falls back to the constants, which is a different
 * case: there the project may well exist and we simply could not reach it.
 */
export async function getWork(slug: string): Promise<WorkDetail | null> {
  if (!client) return detailFromConstants(slug);

  try {
    const [doc, all] = await Promise.all([
      client.fetch<DetailDoc | null>(
        WORK_QUERY,
        { slug },
        { next: { tags: ["work" satisfies ContentTag], revalidate: REVALIDATE_SECONDS } }
      ),
      client.fetch<{ id: string; title: string; category: string; photo?: Photo }[]>(
        SIBLINGS_QUERY,
        {},
        { next: { tags: ["work" satisfies ContentTag], revalidate: REVALIDATE_SECONDS } }
      ),
    ]);

    // Nothing published yet: fall through to the constants, which are what the
    // ring is showing too, so the link the visitor followed still resolves.
    if (!doc) return all?.length ? null : detailFromConstants(slug);

    const i = (all ?? []).findIndex((w) => w.id === doc.id);

    return {
      ...toDetail(doc),
      siblings:
        i === -1
          ? {}
          : { prev: linkFromDoc(all[i - 1]), next: linkFromDoc(all[i + 1]) },
    };
  } catch {
    return detailFromConstants(slug);
  }
}

/**
 * A project document → the `WorkDetail` a project page renders.
 *
 * Shared by both collections, for the reason `toWork` is — see the note
 * there. `siblings` is NOT set here: it is the one part that differs, because
 * a project's neighbours are the neighbours within its own collection.
 */
function toDetail(doc: DetailDoc): WorkDetail {
  const cover = resolvePhoto(doc.photo, doc.title);
  return {
    ...toWork(doc, 0),
    image: cover?.src ?? "",
    objectPosition: cover?.objectPosition,
    width: WIDTHS[0],
    body: doc.body,
      /* ── The drawings ────────────────────────────────────────────────
         `resolvePhoto` is doing one job here rather than two: it produces the
         CDN url. The `objectPosition` it also computes is dropped, because
         these are rendered `object-contain` and there is no crop to steer —
         see `WorkPlan` in types/index.ts. Passing it through would put a
         meaningless value on the element.

         `flatMap` over `map` for the same reason the gallery uses it: an
         image the studio added and then removed the asset from resolves to
         null, and a card with no src is worse than no card. */
      plans: (doc.plans ?? []).flatMap((g, n) => {
        const p = resolvePhoto(g, doc.title);
        if (!p) return [];
        return [{
          id: `${doc.id}-plan-${n}`,
          src: p.src,
          alt: p.alt,
          caption: g.caption,
          wide: g.wide === true,
          // The drawing's real shape, so its plate can be cut to fit it. Read
          // off the asset id rather than joined for — see `aspectFromRef`.
          aspect: aspectFromRef(g),
        }];
      }),
      gallery: (doc.gallery ?? []).flatMap((g, n) => {
        const p = resolvePhoto(g, doc.title);
        if (!p) return [];
        return [{
          id: `${doc.id}-${n}`,
          src: p.src,
          alt: p.alt,
          caption: g.caption,
          objectPosition: p.objectPosition,
          wide: g.wide === true,
        }];
      }),
      siblings: {},
  };
}


/* ────────────────────────────────────────────────────────────────────────
   The catalogue under What we do — a SEPARATE collection
   ────────────────────────────────────────────────────────────────────────

   `disciplineProject` documents are not `work` documents and nothing joins
   them: the ring above reads one type, these pages read the other, and a
   commission the studio wants in both places is published twice. See the
   note at the top of ../schemas/index.ts for why the studio chose that over
   one list with a flag on it.

   So everything below is a near-mirror of the reads above rather than a
   filter over them. What IS shared is the projection and the mappers — the
   two document types share their field set (../schemas/projectFields.ts), so
   a second copy of either would drift the first time a field was added. */

const DISCIPLINE_LIST_QUERY = groq`*[_type == "disciplineProject" && discipline == $discipline]
  | order(order asc, _createdAt asc) { ${WORK_FIELDS}, discipline }`;

const DISCIPLINE_ANY_QUERY = groq`count(*[_type == "disciplineProject"])`;

const disciplineTag = {
  next: {
    tags: ["disciplineProject" satisfies ContentTag],
    revalidate: REVALIDATE_SECONDS,
  },
};

/** The committed stand-ins for one discipline. */
function disciplineFromConstants(discipline: string): Work[] {
  return DISCIPLINE_PROJECTS.filter((p) => p.discipline === discipline);
}

/**
 * One discipline's commissions, for the 2-up grid at /services/<discipline>.
 *
 * ── "Empty" means two different things and they are not the same answer ──
 *
 * A discipline with no projects in a dataset that HAS projects is a real
 * empty: the studio has published boutique work and no architecture yet, and
 * the page should say so. A discipline with no projects in a dataset where
 * the whole collection is empty is the pre-launch state every read in this
 * file is built around, and there the committed list is the right answer.
 *
 * Telling them apart costs one `count()`, and only on the path where the
 * filtered query came back empty — so the normal case is still one round
 * trip. Getting it wrong the other way would mean invented placeholder
 * commissions reappearing under a heading months after the studio had
 * filled in the other two disciplines.
 */
export async function getDisciplineProjects(
  discipline: string
): Promise<Work[]> {
  if (!client) return disciplineFromConstants(discipline);

  try {
    const docs = await client.fetch<WorkDoc[]>(
      DISCIPLINE_LIST_QUERY,
      { discipline },
      disciplineTag
    );
    if (docs?.length) return docs.map(toWork);

    const published = await client.fetch<number>(
      DISCIPLINE_ANY_QUERY,
      {},
      disciplineTag
    );
    return published > 0 ? [] : disciplineFromConstants(discipline);
  } catch {
    return disciplineFromConstants(discipline);
  }
}

/**
 * Every (discipline, slug) pair — for the nested route's
 * `generateStaticParams` and for the sitemap, so neither can name a page
 * the other does not build.
 */
export async function getDisciplineProjectParams(): Promise<
  { discipline: string; slug: string }[]
> {
  const committed = DISCIPLINE_PROJECTS.flatMap((p) =>
    p.discipline ? [{ discipline: p.discipline, slug: p.id }] : []
  );
  if (!client) return committed;

  try {
    const rows = await client.fetch<{ discipline?: string; slug?: string }[]>(
      groq`*[_type == "disciplineProject" && defined(discipline)] {
        discipline, "slug": coalesce(slug.current, _id)
      }`,
      {},
      disciplineTag
    );
    const real = (rows ?? []).flatMap((r) =>
      r.discipline && r.slug ? [{ discipline: r.discipline, slug: r.slug }] : []
    );
    return real.length ? real : committed;
  } catch {
    return committed;
  }
}

const DISCIPLINE_DETAIL_QUERY = groq`*[_type == "disciplineProject"
  && discipline == $discipline
  && coalesce(slug.current, _id) == $slug][0] { ${DETAIL_FIELDS}, discipline }`;

const DISCIPLINE_SIBLINGS_QUERY = groq`*[_type == "disciplineProject" && discipline == $discipline]
  | order(order asc, _createdAt asc) {
    "id": coalesce(slug.current, _id), title, category, photo
  }`;

/** A discipline project's detail record, from the committed stand-ins. */
function disciplineDetailFromConstants(
  discipline: string,
  slug: string
): WorkDetail | null {
  const list = disciplineFromConstants(discipline);
  const i = list.findIndex((w) => w.id === slug);
  if (i === -1) return null;
  return {
    ...list[i]!,
    siblings: { prev: workLink(list[i - 1]), next: workLink(list[i + 1]) },
  };
}

/**
 * One project in the catalogue, for /services/<discipline>/<slug>.
 *
 * ── The slug is scoped to the discipline, and that buys two things ───────
 *
 * Both the lookup and the neighbours are filtered on `discipline`. It keeps
 * the pager inside the section a visitor is reading — "Next →" from the last
 * architecture project must not hand them a boutique interior — and it means
 * two projects in different disciplines can share a slug without colliding,
 * because the URL carries both segments.
 *
 * Null is a real answer and the route turns it into a 404. Unlike the list
 * reads, "we could not find it" must not fall back to something else: the
 * something else would be a different commission under the URL of the one
 * that was asked for.
 */
export async function getDisciplineProject(
  discipline: string,
  slug: string
): Promise<WorkDetail | null> {
  if (!client) return disciplineDetailFromConstants(discipline, slug);

  try {
    const [doc, all] = await Promise.all([
      client.fetch<DetailDoc | null>(
        DISCIPLINE_DETAIL_QUERY,
        { discipline, slug },
        disciplineTag
      ),
      client.fetch<{ id: string; title: string; category: string; photo?: Photo }[]>(
        DISCIPLINE_SIBLINGS_QUERY,
        { discipline },
        disciplineTag
      ),
    ]);

    /* Nothing published in this discipline yet: fall through to the committed
       list, which is also what the grid is showing, so the link a visitor
       just followed resolves instead of 404ing. */
    if (!doc) {
      return all?.length ? null : disciplineDetailFromConstants(discipline, slug);
    }

    const i = (all ?? []).findIndex((w) => w.id === doc.id);
    return {
      ...toDetail(doc),
      siblings:
        i === -1
          ? {}
          : { prev: linkFromDoc(all[i - 1]), next: linkFromDoc(all[i + 1]) },
    };
  } catch {
    return disciplineDetailFromConstants(discipline, slug);
  }
}
/* ────────────────────────────────────────────────────────────────────────
   Testimonials
   ──────────────────────────────────────────────────────────────────────── */

const TESTIMONIALS_QUERY = groq`*[_type == "testimonial"] | order(order asc, _createdAt asc) {
  "id": coalesce(slug.current, _id),
  quote,
  author,
  role
}`;

type TestimonialDoc = {
  id: string;
  quote?: string;
  author?: string;
  role?: string;
};

/**
 * The client wall.
 *
 * ── A quote with no words is dropped, like a slide with no photograph ────
 *
 * `quote` and `author` are both required in the Studio, so a published
 * testimonial has them. A DRAFT does not, and a half-written document is the
 * normal state of one someone is still typing. The row would render its card
 * regardless — a quote glyph, a hairline and the phoenix around an empty
 * space — and with the sequence repeated to fill the track that blank card
 * comes past twice a lap. Filtering is cheap and the failure is not.
 *
 * Same three-way fallback as everything else here: unconfigured, empty, or
 * nothing usable all land on the committed quotes.
 */
export async function getTestimonials(): Promise<Testimonial[]> {
  if (!client) return TESTIMONIALS;

  try {
    const docs = await client.fetch<TestimonialDoc[]>(
      TESTIMONIALS_QUERY,
      {},
      { next: { tags: ["testimonial" satisfies ContentTag], revalidate: REVALIDATE_SECONDS } }
    );

    if (!docs?.length) return TESTIMONIALS;

    const quotes = docs.flatMap((doc) => {
      const quote = doc.quote?.trim();
      const author = doc.author?.trim();
      if (!quote || !author) return [];
      return [{ id: doc.id, quote, author, role: doc.role?.trim() || undefined }];
    });

    return quotes.length ? quotes : TESTIMONIALS;
  } catch {
    return TESTIMONIALS;
  }
}

/* ────────────────────────────────────────────────────────────────────────
   The two credit bands
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Both bands read the same two fields, so they share a query body and a
 * mapper. They do NOT share a document type or a cache tag — see the note in
 * ../schemas/index.ts on why those stay apart.
 */
const CREDIT_FIELDS = groq`
  "id": coalesce(slug.current, _id),
  title,
  logo
`;

type CreditDoc = {
  id: string;
  title?: string;
  logo?: Photo;
};

/**
 * One credit band's worth of documents, mapped and filtered.
 *
 * ── An entry with no NAME is dropped ─────────────────────────────────────
 *
 * `title` is required in the Studio, so a published document has one. A DRAFT
 * does not, and a half-typed document is the normal state of one someone is
 * still working on. The band would render it regardless — a hairline with
 * nothing in front of it — and because short lists are repeated to fill the
 * track, that blank slot comes past twice a lap.
 *
 * The LOGO is not filtered on, and must not be: an entry with no usable logo
 * is a valid entry that sets as a wordmark instead — which is the normal case
 * for the whole awards band. That is the reason the field is optional.
 * `resolvePhoto` returns null for a document whose asset has been removed as
 * well as for one that never had it, and both land in the same, correct place.
 *
 * Its `alt` is dropped rather than carried. <CreditBand /> labels a logo with
 * the entry's NAME, which is the only honest alt text for a lockup — an
 * uploader writing "logo" or "Screenshot 2024" into the alt field would make
 * the band worse for a screen reader than having no field at all.
 */
function toCredits(docs: CreditDoc[] | null | undefined): Credit[] {
  return (docs ?? []).flatMap((doc) => {
    const name = doc.title?.trim();
    if (!name) return [];
    const logo = resolvePhoto(doc.logo, name);
    return [{ id: doc.id, name, logo: logo?.src }];
  });
}

const CLIENTS_QUERY = groq`*[_type == "client"] | order(order asc, _createdAt asc) { ${CREDIT_FIELDS} }`;
const ACCOLADES_QUERY = groq`*[_type == "accolade"] | order(order asc, _createdAt asc) { ${CREDIT_FIELDS} }`;

/**
 * The client wall, on the white band above Selected Works.
 *
 * Same three-way fallback as everything else here: unconfigured, empty, or
 * nothing usable all land on the committed list — which for this one is
 * INVENTED placeholder content, flagged as such in constants/content.ts. That
 * is a deliberate choice over falling back to `[]`: an empty array makes
 * <CreditBand /> render nothing, and a band that has silently vanished is a
 * far worse thing for whoever is setting the CMS up to diagnose than a band
 * showing names they recognise as the stand-ins. The first `client` document
 * published replaces all of them at once.
 */
export async function getClients(): Promise<Credit[]> {
  if (!client) return CLIENTS;

  try {
    const docs = await client.fetch<CreditDoc[]>(
      CLIENTS_QUERY,
      {},
      { next: { tags: ["client" satisfies ContentTag], revalidate: REVALIDATE_SECONDS } }
    );

    if (!docs?.length) return CLIENTS;
    const credits = toCredits(docs);
    return credits.length ? credits : CLIENTS;
  } catch {
    return CLIENTS;
  }
}

/**
 * Awards and press, on the emerald band above How we work.
 *
 * Identical contract to `getClients()` above, against its own type and its own
 * cache tag — so publishing an award drops the awards and leaves the client
 * wall, the projects and the quotes cached.
 */
export async function getAccolades(): Promise<Credit[]> {
  if (!client) return ACCOLADES;

  try {
    const docs = await client.fetch<CreditDoc[]>(
      ACCOLADES_QUERY,
      {},
      { next: { tags: ["accolade" satisfies ContentTag], revalidate: REVALIDATE_SECONDS } }
    );

    if (!docs?.length) return ACCOLADES;
    const credits = toCredits(docs);
    return credits.length ? credits : ACCOLADES;
  } catch {
    return ACCOLADES;
  }
}

/* ────────────────────────────────────────────────────────────────────────
   The two one-off photographs
   ──────────────────────────────────────────────────────────────────────── */

const SITE_IMAGES_QUERY = groq`*[_id == "siteImages"][0] {
  founderPortrait,
  contactBackdrop,
  vastuPortrait
}`;

type SiteImagesDoc = {
  founderPortrait?: Photo;
  contactBackdrop?: Photo;
  vastuPortrait?: Photo;
};

/**
 * The founder's portrait and the backdrop behind the enquiry form.
 *
 * ── The fallback is per PHOTOGRAPH, not per document ─────────────────────
 *
 * Every other read here falls back as a whole: an empty collection means the
 * committed list, all of it. This one must not. The singleton holds two
 * unrelated pictures and they will not be uploaded on the same afternoon, so
 * under an all-or-nothing rule a document with the portrait filled in and the
 * backdrop still empty would throw the portrait away and show both committed
 * images — and the studio's first upload would appear to have done nothing.
 *
 * `*[_id == "siteImages"]` rather than `*[_type == "siteImages"]`: the Studio
 * pins this open at that exact id (see sanity.config.ts), so there is one
 * document and this is its address. Querying by type would also match a second
 * copy if one were ever created, and `[0]` would then pick by creation order
 * rather than by identity.
 */
export async function getSiteImages(): Promise<SiteImages> {
  if (!client) return SITE_IMAGES;

  try {
    const doc = await client.fetch<SiteImagesDoc | null>(
      SITE_IMAGES_QUERY,
      {},
      { next: { tags: ["siteImages" satisfies ContentTag], revalidate: REVALIDATE_SECONDS } }
    );

    if (!doc) return SITE_IMAGES;

    const portrait = resolvePhoto(
      doc.founderPortrait,
      SITE_IMAGES.founderPortrait.alt
    );
    const backdrop = resolvePhoto(
      doc.contactBackdrop,
      SITE_IMAGES.contactBackdrop.alt
    );

    return {
      founderPortrait: portrait ?? SITE_IMAGES.founderPortrait,
      contactBackdrop: backdrop ?? SITE_IMAGES.contactBackdrop,
      /* No `??` fallback, unlike the two above, because there is nothing to
         fall back TO — see the note on the field in types/index.ts. Undefined
         is the real answer until someone uploads one, and <Profile /> is built
         to render that. */
      vastuPortrait: resolvePhoto(doc.vastuPortrait, "Dr. Vimmi Kinha") ?? undefined,
    };
  } catch {
    return SITE_IMAGES;
  }
}
