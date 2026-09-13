import "server-only";

import { groq } from "next-sanity";

import {
  HERO_SLIDES,
  SITE_IMAGES,
  TESTIMONIALS,
  WORKS,
} from "@/constants";
import type {
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

    return docs.map((doc, i) => {
      const photo = resolvePhoto(doc.photo, doc.title);
      return {
        id: doc.id,
        title: doc.title,
        category: doc.category,
        description: doc.description ?? "",
        location: doc.location,
        area: doc.area,
        year: doc.year,
        image: photo?.src ?? "",
        objectPosition: photo?.objectPosition,
        width: WIDTHS[i % WIDTHS.length] ?? WIDTHS[0],
      };
    });
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
  const link = (w: Work | undefined): WorkLink | undefined =>
    w && { id: w.id, title: w.title, category: w.category, image: w.image, objectPosition: w.objectPosition };
  return {
    ...WORKS[i]!,
    siblings: { prev: link(WORKS[i - 1]), next: link(WORKS[i + 1]) },
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

    const cover = resolvePhoto(doc.photo, doc.title);
    const i = (all ?? []).findIndex((w) => w.id === doc.id);
    const link = (w: (typeof all)[number] | undefined): WorkLink | undefined => {
      if (!w) return undefined;
      const p = resolvePhoto(w.photo, w.title);
      return { id: w.id, title: w.title, category: w.category, image: p?.src ?? "", objectPosition: p?.objectPosition };
    };

    return {
      id: doc.id,
      title: doc.title,
      category: doc.category,
      description: doc.description ?? "",
      location: doc.location,
      area: doc.area,
      year: doc.year,
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
      siblings: i === -1 ? {} : { prev: link(all[i - 1]), next: link(all[i + 1]) },
    };
  } catch {
    return detailFromConstants(slug);
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
   The two one-off photographs
   ──────────────────────────────────────────────────────────────────────── */

const SITE_IMAGES_QUERY = groq`*[_id == "siteImages"][0] {
  founderPortrait,
  contactBackdrop
}`;

type SiteImagesDoc = {
  founderPortrait?: Photo;
  contactBackdrop?: Photo;
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
    };
  } catch {
    return SITE_IMAGES;
  }
}
