/**
 * Shared, strictly-typed domain models used across sections.
 * Keep this file free of React/DOM types so it can be imported anywhere.
 */
import type { IconType } from "react-icons";

/** A navigation entry rendered in the navbar and contact block. */
export interface NavLink {
  label: string;
  /** In-page anchor ("#about") or a route ("/faq"). */
  href: string;
}

/** A single "Why choose us" value proposition card. */
export interface Feature {
  id: string;
  icon: IconType;
  title: string;
  description: string;
}

/**
 * A single credibility figure in the achievements band under the hero.
 *
 * `value` is a STRING, not a number. Two of the five figures ("2 Lakh",
 * "Pan India") are not countable, and a count-up that ran on three of five
 * would read as broken rather than as restrained — so the whole row simply
 * arrives instead of counting.
 */
export interface Stat {
  id: string;
  value: string;
  /** Short label sitting under the figure. */
  label: string;
}

/**
 * One entry on a credit band — a client's logo, or the name of an award.
 *
 * ── Why clients and awards are ONE shape and not two ─────────────────────
 *
 * The two bands are visibly the same object: a full-bleed strip carrying a
 * slow row of marks that say "other people vouch for this practice". They
 * differ in ground colour and in what each entry is called, and in nothing
 * else — so a second interface would have been the first one with a field
 * renamed, and <CreditBand /> would have needed a branch per band to read it.
 *
 * What is NOT shared is the SOURCE. `client` and `accolade` are separate
 * document types in the Studio, so a studio ordering its client wall never
 * reorders its awards, and the publish webhook drops exactly one of the two.
 * They converge here, at the point where they stop being different things.
 *
 * ── Two fields, and that is the whole design ─────────────────────────────
 *
 * There is no subtitle, no issuer, no year. The band renders the LOGO when
 * there is one and the NAME when there is not, one line either way, and that
 * single rule is what makes the two strips read as one component: the client
 * band is a wall of lockups because clients have lockups, and the awards band
 * is a line of names — "Indian Express Awards" — because awards are known by
 * their names. Nothing in the component decides that; the content does.
 *
 * An earlier version carried a `detail` line under each name (the issuer and
 * the year, in the small uppercase face). It made every entry two lines tall
 * in a 120px band, which turned a quiet credit strip into a dense table and
 * was the specific thing that stopped the band reading as part of this site.
 */
export interface Credit {
  id: string;
  /** The name as it should be printed. Used as the wordmark when there is no
   *  logo, and as the logo's alt text when there is. */
  name: string;
  /** Optional lockup, fitted into a fixed slot so a tall mark and a wide one
   *  occupy the same optical width. */
  logo?: string;
}

/** One of the studio's disciplines. */
export interface Service {
  id: string;
  /** Display index, e.g. "01". */
  index: string;
  title: string;
  /** Revealed when the title is clicked; not shown at rest. */
  body: string;
  image: string;
  /**
   * This card's image is ARTWORK ON A TRANSPARENT GROUND, not a photograph.
   *
   * The flag turns four presentational decisions over at once, because they are
   * one decision: the image is CONTAINED rather than cropped, it sits on cream
   * rather than the stone ground a loading photograph needs, it is given
   * padding so the artwork does not touch the edges, and it does not take the
   * hover zoom — a photograph pushing very slightly into its frame reads as
   * depth, and a diagram doing it reads as the page failing to hold still.
   *
   * ── NOTHING SETS THIS TODAY, and that is worth reading before you do ─────
   *
   * It was built for one card: Vastu, whose image was a Vastu Purusha Mandala —
   * a circle on a transparent background that meant nothing once cropped. That
   * file has been replaced by a composed plate which carries its OWN cream
   * ground and margin, and every part of this treatment worked against it (the
   * note on that entry in constants/content.ts has the measurements).
   *
   * So the test is not "is it a drawing". It is: does the image END at its
   * subject, with no ground of its own? A logo, a diagram exported on alpha, a
   * mark — yes. A plate with its own paper, however illustrated — no, that is a
   * picture and it wants the picture treatment.
   *
   * Kept rather than deleted because that first kind of image is a real
   * category the studio may well supply again, and this is the tested way to
   * render one. It is a property of the picture, not a style — which is why it
   * lives here beside `image` rather than as a class name at the call site.
   */
  illustration?: boolean;
  /**
   * An optional figure, set above the body's link.
   *
   * A whole string rather than a number, and formatted by whoever writes it —
   * "₹6,999 per session". The studio does not price architecture or
   * interiors by the unit and never will, so this is not a field four of the
   * six cards are leaving blank by oversight: it belongs to the one discipline
   * that is sold as a fixed, bookable thing, and a card without it is a card
   * where the answer is genuinely "it depends on the project".
   *
   * Kept out of `body` because it is not a sentence. It is the one line on the
   * card a visitor scans for, it sets in the card's own type rather than in
   * running copy, and a price buried mid-paragraph is one nobody finds.
   */
  price?: string;
  /**
   * An optional link at the foot of the body, revealed with it.
   *
   * ── This replaced `href`, which made the whole card a link ──────────────
   *
   * Architectural Photography used to carry `href: "/photography"` — a page on
   * this site — and the card read that as "this discipline is a page": the
   * photograph and the name became one big anchor, the `+` became an arrow, and
   * the body was printed at rest instead of on a click, because there was no
   * click to wait for. (The destination is Postcard of Life's own portfolio now
   * and the page is gone; the shape of the field is what this note is about.)
   *
   * One of five cards behaving differently from the other four is a difference
   * a visitor has to notice and then work out, and it cost the row its rhythm:
   * that card was the only one whose height was set by permanent copy, which is
   * what forced the other four to reserve the same space and sit half empty.
   *
   * A link in the body says the same thing without breaking the set. Every card
   * is now the same object — image, name, `+` — and the destination is offered
   * where the reader is already reading.
   */
  link?: { label: string; href: string };
}

/** A featured architecture project. */
export interface Project {
  id: string;
  title: string;
  location: string;
  year: string;
  category: string;
  image: string;
}

/** A single step in the studio's working process. */
export interface ProcessStep {
  id: string;
  /** Display index, e.g. "01". */
  step: string;
  title: string;
  description: string;
}

/**
 * A client testimonial.
 *
 * `role` is the commission and its city, printed under the name. Optional
 * because it comes from the CMS now and a quote with no project attached is a
 * normal thing for a studio to have — see sanity/schemas/testimonial.ts. The
 * card renders the line only when there is something to put in it.
 */
export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role?: string;
}

/**
 * A project panel in the pinned horizontal "Selected Works" gallery.
 *
 * `location`, `area` and `year` are optional and currently unset for every
 * real project: the studio has not supplied them, and an invented area on a
 * real commission is worse than a visible gap. The gallery renders the meta
 * row only when there is something to put in it.
 */
export interface Work {
  id: string;
  category: string;
  /**
   * Which of the three pages under What we do lists this project.
   *
   * Set on every `disciplineProject` and on NO `work` — the ring is its own
   * collection and has no taxonomy, because there is only one ring. Optional
   * here because one interface serves both: the two document types are
   * deliberately separate content (see sanity/schemas/index.ts) but they
   * share a field set and render through the same component, so they share a
   * render shape. One shape, two sources.
   *
   * It is the id from `lib/disciplines.ts` — `"architecture"`,
   * `"commercial-interiors"` or `"boutique-interiors"` — and it is also the
   * first segment of the project's URL, which is why a stray value is a
   * project with no page rather than a project on the wrong page.
   *
   * ── Why this is not `category` ──────────────────────────────────────────
   *
   * `category` is COPY. It is printed above the project name, it is written
   * per commission, and the studio uses it to say the most useful specific
   * thing about that job — "Hospitality", "Private Residence", "Food Court".
   * Two projects in the same discipline routinely carry different categories,
   * which is correct and is the point of the field.
   *
   * This is a TAXONOMY: three values, nothing prints it, and it decides which
   * page the project is on. Serving both jobs from one field would mean
   * either flattening the categories into three repeated labels or matching
   * pages on free text, where "Hospitality" belongs to no page at all.
   */
  discipline?: string;
  title: string;
  location?: string;
  area?: string;
  year?: string;
  description: string;
  image: string;
  /**
   * Art direction for the crop, as a CSS `object-position` value.
   *
   * Set from the photograph's hotspot when the project comes from Sanity — see
   * sanity/lib/image.ts. Undefined means centred, which is what every
   * hand-authored entry in `constants/content.ts` uses.
   */
  objectPosition?: string;
  /** CSS width for the panel — intentionally uneven for editorial rhythm. */
  width: string;
}

/**
 * One photograph on a project's own page.
 *
 * `wide` is the studio's call, made per picture in the Studio, because which
 * shot deserves the full measure is an editorial decision about the photograph
 * and not something a rule about position can get right.
 */
export interface WorkPhoto {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  objectPosition?: string;
  wide?: boolean;
}

/**
 * One drawing in a project's Layout section — a floor plan, a site plan, a
 * section, an elevation.
 *
 * ── Not a WorkPhoto, and the difference is `objectPosition` ──────────────
 *
 * The two carry almost the same fields, and sharing the type would be the
 * obvious move. The field that is missing here is the reason not to: a
 * photograph is rendered `object-cover` and hotspot-cropped to its frame, and
 * `objectPosition` is how the studio says which part survives that crop. A
 * drawing is rendered `object-contain` — cropping a floor plan does not lose
 * an unimportant edge, it loses ROOMS — so there is no crop to steer, and a
 * field for steering one would be a field that does nothing.
 *
 * `caption` is doing more work here than it does on a photograph. Plans come
 * in sets and are indistinguishable without one: "Ground floor", "First
 * floor", "Site plan". The Studio's description says so.
 */
export interface WorkPlan {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  /** Give this drawing the whole measure instead of a half. */
  wide?: boolean;
  /**
   * The drawing's own proportions, `width / height`, so its plate can be cut to
   * fit it rather than the other way round.
   *
   * Read out of the Sanity asset id — see `aspectFromRef`. Undefined where the
   * id cannot be parsed, and the page falls back to a 4:3 plate.
   */
  aspect?: number;
}

/**
 * A project, plus everything that only its own page needs.
 *
 * Separate from `Work` on purpose. The ring asks for all nine projects at once
 * and needs a name, a category and one photograph from each; pulling every
 * write-up and every gallery into that query to render a heading would be a
 * large amount of content fetched to be thrown away. This is read one at a
 * time, by slug.
 *
 * `body` is Portable Text — Sanity's block format — and is typed loosely here
 * so `types/` does not have to depend on the CMS. It is rendered by
 * components/ui/ProjectBody.tsx, which is the only thing that inspects it.
 */
export interface WorkDetail extends Work {
  body?: unknown[];
  /** The drawings, under the Layout heading. See `WorkPlan`. */
  plans?: WorkPlan[];
  gallery?: WorkPhoto[];
  /** The next and previous commissions, for the footer's continue-reading pair. */
  siblings?: { prev?: WorkLink; next?: WorkLink };
}

/** Just enough of a project to link to it. */
export interface WorkLink {
  id: string;
  title: string;
  category: string;
  image: string;
  objectPosition?: string;
}

/** A single frame in the hero's cross-dissolving image cycle. */
export interface HeroSlide {
  id: string;
  image: string;
  alt: string;
  /** Project name, captioned under the hero while this frame is up. */
  title: string;
  /**
   * Optional art direction for the crop, as a CSS `object-position` value.
   * Only set it where centring loses the subject on narrow viewports.
   */
  position?: string;
  /**
   * An optional second photograph, used below 768px in place of `image`.
   *
   * ── Art direction, not a smaller file ───────────────────────────────────
   *
   * Every image on this site is already served at the width it is rendered at,
   * so this is not about bytes. The hero is the one full-VIEWPORT frame on the
   * site, which means a phone shows a landscape photograph through a ~9:19
   * window: `object-cover` keeps the height and throws away most of the width,
   * and `--frame-zoom` then crops in further (see <ImageCycle />). A hotspot
   * can choose WHICH slice survives that; it cannot make the slice a picture of
   * a room. A shot framed vertically can.
   *
   * Undefined — the default, and what every committed entry uses — means the
   * one photograph is shown at every width, exactly as before.
   */
  mobileImage?: string;
  /** `object-position` for `mobileImage`. Independent of `position`. */
  mobilePosition?: string;
}


/** A question and answer on the FAQ page. */
export interface Faq {
  id: string;
  question: string;
  answer: string;
}

/** A social media profile link. */
export interface SocialLink {
  label: string;
  href: string;
  icon: IconType;
}

/**
 * A single photograph that is not part of a list — the founder's portrait, the
 * backdrop behind the enquiry form.
 *
 * It is `src` / `alt` / `objectPosition` because that is exactly what
 * <Media /> takes, which is what lets `getSiteImages()` hand its result
 * straight to the component with no adapter in between. The committed
 * fallbacks are in `constants/content.ts` as SITE_IMAGES.
 */
export interface Photograph {
  src: string;
  alt: string;
  /** CSS `object-position`, from the photograph's hotspot when it came from the CMS. */
  objectPosition?: string;
}

/**
 * A bookable session with a named specialist, priced and sold on its own.
 *
 * ── Why this is not a `Service` ──────────────────────────────────────────
 *
 * `Service` already carries a `price` and a `link`, and Design Consultation
 * uses both — so the shape looks reusable. It is not, because a `Service` is a
 * CARD on the home page's discipline track: it needs an `index` ("01") that
 * the track's progress readout counts against, an `image` the card is mostly
 * made of, and a `body` that only appears once the card is opened. None of
 * those exist here. These are rows in a rate list under a portrait — a name, a
 * figure, and a way to book it.
 *
 * Putting them in SERVICES would also put them on the home page track, which
 * is the opposite of what they are: consultations with one specialist, offered
 * on her page, to someone who has just read who she is.
 */
export interface Consultation {
  id: string;
  /** The session, named as the rate list names it. */
  title: string;
  /**
   * The fee, formatted by whoever writes it — "₹6,999", "from ₹11,999".
   *
   * A whole string for the same reason `Service["price"]` is one: "from" is
   * part of the figure's meaning, not a flag, and a number could not carry it.
   */
  price: string;
  /**
   * The qualification the figure needs, when it needs one.
   *
   * Vastu is quoted by the size of the home, so the fee is a floor rather than
   * a price and saying so is the studio's instruction, not a nicety. Astrology
   * is a fixed session and carries none — which is why this is optional rather
   * than an empty string on the row that does not need it.
   */
  note?: string;
  /** Where "book" goes. WhatsApp, via `whatsappLink` in constants/site.ts. */
  href: string;
}

/** The one-off photographs, together. See `Photograph` above. */
export interface SiteImages {
  founderPortrait: Photograph;
  contactBackdrop: Photograph;
  /**
   * Dr. Vimmi Kinha, on /vastu.
   *
   * OPTIONAL where the other two are required, and that is the difference
   * between "not uploaded yet" and "missing". There is a committed photograph
   * behind each of those, so they always resolve to something; there is no
   * committed portrait for this one, and <Profile /> draws a designed
   * placeholder when it is absent rather than a broken frame. The day a
   * sitting happens it is an upload in the Studio, not a commit.
   */
  vastuPortrait?: Photograph;
}
