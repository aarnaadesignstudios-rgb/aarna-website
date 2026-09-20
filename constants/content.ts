/**
 * Site content.
 *
 * Project names, service copy, figures and FAQ text below are the studio's
 * real content, supplied in the client review.
 *
 * IMAGERY is now mixed, and the split is worth knowing before reaching for a
 * stock URL: HERO_SLIDES and all six SERVICES are the studio's own files under
 * `/images/`. What is still a stand-in is PROJECTS and WORKS — six Unsplash
 * frames — along with the per-project location / area / year, which are marked
 * TODO rather than invented. See the note on WORKS.
 */
import {
  FiCompass,
  FiFeather,
  FiLayers,
  FiSun,
  FiHome,
  FiAward,
} from "react-icons/fi";
import { FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { SiGmail } from "react-icons/si";

import { SITE, whatsappLink } from "./site";

import type {
  Consultation,
  Credit,
  Faq,
  Feature,
  HeroSlide,
  NavLink,
  Project,
  ProcessStep,
  Service,
  SiteImages,
  SocialLink,
  Stat,
  Testimonial,
  Work,
} from "@/types";

/** Primary in-page navigation. Order defines both navbar and scroll flow. */
export const NAV_LINKS: NavLink[] = [
  /* ── "About" is a page now, not the manifesto ──────────────────────
     This pointed at `#practice`, the studio's statement of intent — which is
     about the WORK. A visitor clicking "About" is asking who they would be
     hiring, and the answer to that (<Founder />: portrait, credentials, the
     philosophy in her own words) was built and then left rendering nowhere
     when the section came off the home page. It has a page now; see
     app/about/page.tsx.

     `#practice` is untouched and still opens with the home page. It has simply
     stopped having to stand in for a biography. */
  { label: "About", href: "/about" },
  // "Why Us" is gone with the section it pointed at. Leaving it would give the
  // masthead, the mobile index and the Contact colophon a link that scrolls
  // nowhere — which is the bug the "Projects" link had before the client
  // review, and it is invisible until someone clicks it.
  /* ── Paths, not fragments ────────────────────────────────────────────
     These were "#services", "#projects", "#process" and "#contact". Every
     chapter of the home page has a real route now — see lib/sections.ts for
     why — so the masthead, the mobile index and the Contact colophon all link
     to an address that can be shared, crawled and typed. Nothing about the
     page changed; it is still one scrolling document. */
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Process", href: "/process" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

/**
 * Hero imagery — the four projects the studio wants in view on the opening
 * screen, in this order.
 *
 * These four are the studio's OWN photography, supplied by the client — the
 * only images on the site that are not stock placeholders, along with the
 * three they also appear as in WORKS.
 */
export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "awc",
    image: "/images/hero/AWC.jpg",
    alt: "AWC — reception and breakout area",
    title: "AWC",
  },
  {
    id: "cha-and-co",
    image: "/images/hero/chaandco.jpg",
    alt: "Cha and Co — open-plan workspace with planted desk dividers",
    title: "Cha and Co",
  },
  {
    id: "kapali-mall",
    image: "/images/hero/kapalimall.jpg",
    alt: "Kapali Mall — food court seating and bar",
    title: "Kapali Mall",
  },
  {
    id: "sobha-residence",
    image: "/images/hero/shobharesidency.jpg",
    alt: "Sobha Residence — bedroom with feature mural wall",
    title: "Sobha Residence",
  },
];

/**
 * The photographs that belong to no list.
 *
 * ── Why these moved out of their components ──────────────────────────────
 *
 * Both were written into the JSX — the founder's portrait in <Founder />,
 * `/images/hero/kapalimall.jpg` in <Contact />. That was fine
 * while they could only ever be those files. They are editable in the Studio
 * now (`siteImages`, a singleton), and the rule everywhere else on this site is
 * that the CMS supplies the picture and this file is what it falls back to —
 * see sanity/lib/content.ts. A fallback cannot live inside the component that
 * consumes it, because then there are two sources of truth for the same
 * photograph and the CMS one wins silently.
 *
 * So: one committed default per photograph, in the one place the site keeps
 * committed defaults.
 */
export const SITE_IMAGES: SiteImages = {
  founderPortrait: {
    src: "/images/people/annpurna-kinha.png",
    alt: "Ar. Annpurna Kinha, Founder and Principal Architect",
  },
  /**
   * Dr. Vimmi Kinha, on /vastu.
   *
   * A committed file like the founder's, and the Studio's `vastuPortrait`
   * overrides it — the same arrangement every photograph on this site has. The
   * placeholder <Profile /> draws when there is NO portrait at all is still
   * there and still correct; it simply is not reached any more.
   */
  vastuPortrait: {
    src: "/images/people/vimmi-kinha.png",
    alt: "Dr. Vimmi Kinha, Director — Astrology, Vastu & Colour Therapy",
    /**
     * ── The crop is pulled UP, and the zoom could not do it ──────────────
     *
     * This frame is 4:5 (0.80) and this photograph is 1086x1448 (0.75) — taller
     * in proportion than the box — so `object-cover` matches the width and
     * spills roughly 6% of the image's height, half off each end. Centred, that
     * put the top cut at her hairline: measured 5.1% lost from the top against
     * hair beginning about 5% down the file.
     *
     * Reducing the wrapper's scale (see <Profile />) fixed the part of the crop
     * the ZOOM was causing and could not touch this part, because the spill is
     * a property of the two aspect ratios rather than of the zoom. Moving the
     * crop window up is the only thing that answers it, and it costs nothing
     * that matters: what leaves the bottom of the frame is the lower edge of a
     * blazer.
     *
     * 15%, not 0. Top-aligned would put her hair against the frame edge with no
     * headroom, which reads as a photograph that has been pushed up rather than
     * one that is framed.
     *
     * Ar. Annpurna Kinha's portrait needs none of this: at 1145x1374 (0.83) it
     * is WIDER in proportion than the frame, so `object-cover` matches the
     * height and spills sideways instead — there is no vertical crop for an
     * object-position to steer.
     */
    objectPosition: "50% 15%",
  },
  /**
   * Kapali Mall, from the studio's own photography. It is deliberately a warm,
   * dense room: the enquiry section lays a flat emerald veil at 94% over it, and
   * a pale photograph disappears into that entirely rather than reading as a
   * texture inside the green. Whatever replaces it in the Studio has the same
   * constraint — see the note in <Contact />.
   */
  contactBackdrop: { src: "/images/hero/kapalimall.jpg", alt: "" },
};

/** Six premium value propositions rendered in the "Why Us" grid. */
export const FEATURES: Feature[] = [
  {
    id: "vision",
    icon: FiCompass,
    title: "Considered Vision",
    description:
      "Every project begins with a singular idea, refined until nothing unnecessary remains.",
  },
  {
    id: "craft",
    icon: FiFeather,
    title: "Material Craft",
    description:
      "We honour natural stone, timber and light — detailing them with quiet precision.",
  },
  {
    id: "space",
    icon: FiLayers,
    title: "Spatial Clarity",
    description:
      "Proportion and flow are choreographed so that each space breathes with intention.",
  },
  {
    id: "light",
    icon: FiSun,
    title: "Light as Material",
    description:
      "Daylight is treated as a building block, shaping mood across the hours of a day.",
  },
  {
    id: "living",
    icon: FiHome,
    title: "Human Living",
    description:
      "Spaces are designed around ritual and comfort, not just form and photograph.",
  },
  {
    id: "legacy",
    icon: FiAward,
    title: "Enduring Legacy",
    description:
      "We build for permanence — architecture meant to age gracefully across generations.",
  },
];

/**
 * Credibility figures for the achievements band directly under the hero.
 *
 * Figures corrected in the client review: 7+ years (consistent with Est. 2019),
 * 2 Lakh sq ft, and "Pan India" in place of a city count.
 *
 * `value` is a string rather than a number because two of the five are no
 * longer countable — "2 Lakh" and "Pan India" cannot animate up from zero, and
 * a counter that ran on three of five figures and not the other two would look
 * broken rather than restrained. So none of them count; they simply arrive.
 */
export const STATS: Stat[] = [
  { id: "years", value: "7+", label: "Years in practice" },
  { id: "projects", value: "150+", label: "Projects delivered" },
  { id: "area", value: "2 Lakh", label: "Sq. ft. designed" },
  { id: "reach", value: "Pan India", label: "Projects across" },
  { id: "returning", value: "96%", label: "Repeat & referred" },
];

/* ─────────────────────────────────────────────────────────────────────────
   The two credit bands — PLACEHOLDER CONTENT, REPLACE BEFORE LAUNCH
   ─────────────────────────────────────────────────────────────────────────

   Everything else in this file is the studio's real content. These two lists
   are not: the companies and awards below are invented, and the eight logos
   are drawn by scripts/make-placeholder-logos.mjs. They are here so the bands
   can be composed, measured and reviewed against the rest of the page before
   the studio has supplied theirs.

   Do not let them reach production. They are claims about who has hired the
   practice and who has recognised it, which is exactly the kind of copy that
   is damaging rather than merely wrong if it ships untouched.

   ── They are also the empty state, which is why they are not `[]` ────────

   Both bands read from Sanity and fall back here, the same three-way contract
   every other read in sanity/lib/content.ts has: unconfigured, empty, or
   unreachable all land on these lists. An empty array would make <CreditBand />
   render nothing, and "the band has silently disappeared" is a worse thing for
   whoever is setting the CMS up to debug than "the band is showing the wrong
   names". The first real `client` document published replaces all of these at
   once — see `getClients()`.
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Clients, on the white band above Selected Works. A wall of logos.
 *
 * `name` is set here even though nothing prints it: it is the logo's ALT
 * text, and it is what the entry falls back to as a wordmark if the file goes
 * missing. A logo with no name behind it is an unlabelled picture to a screen
 * reader, which is the one way a logo wall can be completely illegible.
 */
export const CLIENTS: Credit[] = [
  { id: "meridian", name: "Meridian Group", logo: "/images/clients/meridian-group.svg" },
  { id: "verdance", name: "Verdance Hotels", logo: "/images/clients/verdance-hotels.svg" },
  { id: "northbridge", name: "Northbridge Developers", logo: "/images/clients/northbridge-developers.svg" },
  { id: "saanjh", name: "Saanjh Foundation", logo: "/images/clients/saanjh-foundation.svg" },
  { id: "casa-lumina", name: "Casa Lumina", logo: "/images/clients/casa-lumina.svg" },
  { id: "indus-retail", name: "Indus Retail", logo: "/images/clients/indus-retail.svg" },
  { id: "tanvi-health", name: "Tanvi Healthcare", logo: "/images/clients/tanvi-healthcare.svg" },
  { id: "ashwin-realty", name: "Ashwin Realty", logo: "/images/clients/ashwin-realty.svg" },
];

/**
 * Awards and press, on the emerald band above How we work. Names only.
 *
 * No logos, and that is the normal case here rather than a gap: an award is
 * known by its name in a way a company is not, and the seals that do exist
 * are dark-on-white artwork that would disappear on brand emerald. The band
 * sets these in the serif, one line each, which is the same treatment the
 * client band gives a client who has not sent a lockup.
 *
 * Keep them SHORT. They do not wrap — a name much past thirty characters is
 * simply a very wide entry that dominates the strip as it passes.
 */
export const ACCOLADES: Credit[] = [
  { id: "indian-express", name: "Indian Express Awards" },
  { id: "iid-excellence", name: "Design Excellence Awards" },
  { id: "architect-year", name: "Architect of the Year" },
  { id: "elle-deco", name: "Elle Decor Design Awards" },
  { id: "good-homes", name: "Good Homes Awards" },
  { id: "ficci-interior", name: "FICCI Interior Awards" },
];

/**
 * The studio's six disciplines.
 *
 * `body` is revealed when the discipline's NAME is clicked (client request);
 * it is not shown at rest.
 *
 * `link` is an optional line at the foot of a body, revealed with it. It is
 * where a discipline that has somewhere to send you sends you — see the note on
 * the field in types/index.ts for why this is not `href` on the card any more.
 */
export const SERVICES: Service[] = [
  {
    id: "architecture",
    index: "01",
    title: "Architecture",
    body: "Residential & commercial architecture shaped around site, purpose and context — from concept and planning to design development and execution support.",
    /* ── The studio's own, replacing Unsplash ───────────────────────────────
       The first three disciplines ran on stock frames while the studio's own
       set was being prepared. It arrived, and all three are now theirs — which
       matters beyond provenance: a stock interior and a studio interior next to
       each other on one track read as two different practices. */
    image: "/images/services/architecture.jpg",
  },
  {
    id: "commercial-interiors",
    index: "02",
    title: "Commercial Interiors",
    body: "Workspaces, restaurants, cafés, food courts, hotels, resorts, retail and hospitality spaces designed around people, brand, function and experience.",
    image: "/images/services/commercial-interiors.jpg",
  },
  {
    id: "boutique-interiors",
    index: "03",
    title: "Boutique Interiors",
    body: "Bespoke interiors for villas, bungalows, residences and resorts, crafted with character, materiality and attention to detail.",
    image: "/images/services/boutique-interiors.jpg",
  },
  /* ── The second card that names a person ───────────────────────────────
     Like Architectural Photography, this one credits someone by name, and a
     name on a card raises a question the card has no room to answer. That one
     sends you off-site to Ar. Divyank Sirohi's own practice; this one has a
     page here — see app/(site)/vastu/page.tsx. The link is INTERNAL, so
     <SmoothLink /> routes it and `linkOut` leaves it in the same tab. */
  {
    id: "vastu",
    index: "04",
    title: "Vastu",
    body: "Vastu-guided planning led by Dr. Vimmi Kinha, PhD, bringing experience and insight into the orientation, balance and harmony of spaces.",
    /* The Vastu Purusha Mandala laid over a real floor plan.

       PNG, not JPEG: it is line art over flat washes, which is what PNG is good
       at and what JPEG rings around. Palette-quantised (864KB against 2.7MB
       truecolour, no visible banding in the washes at 1:1).

       ── `illustration` came OFF with this file ──────────────────────────
       The previous image was a mandala on a TRANSPARENT ground, and the flag
       existed for it: contained rather than cropped, on cream, with padding,
       and no hover zoom — see `illustration` in types/index.ts.

       This plate is a different kind of object. It carries its own cream ground
       and its own decorative margin, so every part of that treatment worked
       against it: contained in a tall card it floated as a small square with
       106px of dead ground, and because the plate's ground is warmer than
       `--color-cream` the padding drew a visible rectangle where the two met.

       Cropping costs less than it looks like it should. `cover` loses 11.1% off
       each side — the "W" and "E" labels, though their arrows survive — and
       keeps the mandala, the plan, N/S and all four diagonals. Those two labels
       set about 5px tall at the card's width, so contain was not preserving
       anything legible; it was only making everything else smaller. */
    image: "/images/services/vastu.png",
    link: {
      /* Parallel with "See the photography" on the card two along: a verb and
         the thing it acts on, not a generic "Read more". */
      label: "Meet Dr. Vimmi Kinha",
      href: "/vastu",
    },
  },
  /* ── Sold by the session, not by the project ───────────────────────────
     The other five disciplines are engagements: a brief, a site, a fee that
     depends on all of it. This one is a fixed, bookable hour, and it is on
     this track rather than in <Contact /> because a visitor reading "what we
     do" is exactly the person who has one floor plan and one question and no
     appetite for a full-service appointment. It sits fifth so it is the last
     thing offered before the track hands over to a practice that is not ours.

     It carries the two fields no discipline needed until now — a `price`,
     because an hour with a fixed fee is the one thing here a visitor can
     compare, and a `link` that opens WhatsApp rather than a page, because the
     next step after "book" is a conversation and the studio already answers
     on that number. See `whatsappLink` in constants/site.ts. */
  {
    id: "consultation",
    index: "05",
    title: "Design Consultation",
    body: "A focused 60-minute online session with an architect — review a floor plan, work through space planning, or get your design questions answered.",
    price: "₹6,999 per session",
    /* The studio's own. It replaced a stock frame of an architect at a drawing
       board — which was the right subject and somebody else's desk. */
    image: "/images/services/design-consultation.jpg",
    link: {
      label: "Book your consultation",
      href: whatsappLink(
        "Hi Aarnaa Design Studios — I’d like to book the 60-minute Space & Design Consultation (₹6,999). Could you share the next available slots?"
      ),
    },
  },
  {
    id: "photography",
    index: "06",
    title: "Architectural Photography",
    body: "Led by Ar. Divyank Sirohi | Postcard of Life, capturing architecture through light, composition, materiality and architectural storytelling.",
    /* The studio's own, and the one card where the photograph is the service
       rather than an illustration of it — a twilight exterior carrying the
       camera's own framing marks, which is the discipline describing itself.

       1536x1024, so LANDSCAPE in a card that is tall: `cover` crops to the
       middle third and what survives is the lit facade and the pool, which is
       the subject. (It replaced a 2067x3674 frame that filled the desktop card
       almost entirely — the note here used to say so, and no longer applies.) */
    image: "/images/services/architectural-photography.jpg",
    /* ── The Postcard of Life portfolio ──────────────────────────────────
       This was `/photography`, a page on this site standing in until the real
       address existed. It exists, so the placeholder is gone and the page with
       it — the discipline is led by Ar. Divyank Sirohi under his own practice,
       and a second portfolio of ours competing with his was always going to be
       the weaker of the two.

       It is EXTERNAL now, which changes how it renders: <SmoothLink /> hands
       an off-site href to a plain anchor rather than the router, and the
       Services cards open it in a new tab (see `linkOut` in that file). */
    link: {
      label: "See the photography",
      href: "https://postcardoflife.myportfolio.com/personal-1",
    },
  },
];

/**
 * Dr. Vimmi Kinha's bookable sessions, as the rate list under her portrait on
 * /vastu. See `Consultation` in types/index.ts for why these are not SERVICES.
 *
 * ── Two figures, quoted two different ways ───────────────────────────────
 *
 * Astrology is a fixed session, so it is a price. Vastu is quoted against the
 * size of the home, so ₹11,999 is a FLOOR — and the difference is the whole
 * reason `note` exists: a bare "₹11,999" beside a Vastu consultation is a
 * number the studio would then have to walk back on the call. "From", plus the
 * band it applies to, is what the studio asked to be said and it is also the
 * honest form of the figure.
 *
 * ── The messages ─────────────────────────────────────────────────────────
 *
 * Each names the session and its fee, so the first thing in the composer
 * already answers "which one, and did you see the price". Same pattern and
 * same reasoning as Design Consultation's on the track above — see the note on
 * `whatsappLink` in constants/site.ts for why the copy is written out here
 * rather than assembled at the call site.
 */
export const VASTU_CONSULTATIONS: Consultation[] = [
  {
    id: "astrology",
    title: "Astrology Consultation",
    price: "₹6,999",
    href: whatsappLink(
      "Hi Aarnaa Design Studios — I’d like to book an Astrology consultation with Dr. Vimmi Kinha (₹6,999). Could you share the next available slots?"
    ),
  },
  {
    id: "vastu",
    title: "Vastu Consultation",
    price: "from ₹11,999",
    note: "Vastu consultation charges start from ₹11,999 for flats up to 4 BHK.",
    href: whatsappLink(
      "Hi Aarnaa Design Studios — I’d like to book a Vastu consultation with Dr. Vimmi Kinha (from ₹11,999). Could you share the next available slots?"
    ),
  },
];

/** Featured projects rendered as an image stack. */
export const PROJECTS: Project[] = [
  {
    id: "coastal-house",
    title: "Coastal House",
    location: "Alibaug, India",
    year: "2024",
    category: "Residence",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80",
  },
];

/** Four-step working process rendered as a minimal timeline. */
export const PROCESS_STEPS: ProcessStep[] = [
  {
    id: "discover",
    step: "01",
    title: "Discover",
    description:
      "We listen deeply — to site, to client, to context — before a single line is drawn.",
  },
  {
    id: "design",
    step: "02",
    title: "Design",
    description:
      "Concept becomes form through iterative sketches, models and material studies.",
  },
  {
    id: "develop",
    step: "03",
    title: "Develop",
    description:
      "Every junction is detailed and documented with obsessive precision.",
  },
  {
    id: "deliver",
    step: "04",
    title: "Deliver",
    description:
      "We steward construction on site, ensuring the built work honours the vision.",
  },
];

/**
 * Client testimonials. Rendered in one continuous row, so keep enough entries
 * that half a track still overflows the widest viewport.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    quote:
      "They gave us a home that feels like a long, quiet exhale. Every corner was considered.",
    author: "Ananya Rao",
    role: "Coastal House, Alibaug",
  },
  {
    id: "t2",
    quote:
      "Restraint is their signature. Nothing shouts, yet everything speaks.",
    author: "Vikram Mehta",
    role: "City Loft, Mumbai",
  },
  {
    id: "t3",
    quote:
      "A rare studio that treats light and silence as building materials.",
    author: "Priya Nair",
    role: "Forest Retreat, Coorg",
  },
  {
    id: "t4",
    quote:
      "We asked for a house that would be quiet. They gave us one that stays quiet even when it is full.",
    author: "Rohan Malhotra",
    role: "Vaastu Nivas, Alibaug",
  },
  {
    id: "t5",
    quote:
      "Four years on, the stone has warmed exactly as they said it would. Nothing has needed replacing.",
    author: "Devika Shah",
    role: "The Travertine House, Jaipur",
  },
  {
    id: "t6",
    quote:
      "Guests stop talking when they walk in. That was the brief, and nobody ever wrote it down.",
    author: "Kabir Menon",
    role: "Amaris, Coorg",
  },
  {
    id: "t7",
    quote:
      "Our teams moved in and the complaints simply never came — no glare, no corridors, no thermostats to argue over.",
    author: "Aditi Bhandari",
    role: "Sanchaya, Ahmedabad",
  },
  {
    id: "t8",
    quote:
      "Two rooms with no roof, and they are the rooms we actually live in.",
    author: "Neel Fernandes",
    role: "House of Two Courtyards, Goa",
  },
];

/**
 * Selected Works — the studio's nine real projects, in the order supplied.
 *
 * ── Placeholder imagery, real names ───────────────────────────────────────
 *
 * The names, order and categories are final. Everything visual is not: each
 * `image` is a stock stand-in reused from the previous placeholder set, and
 * `location` / `area` / `year` are deliberately left EMPTY rather than
 * invented, because a plausible-looking wrong area on a real commission is
 * worse than an obvious gap. <SelectedWorks /> renders the meta row only for
 * the entries that have data, so nothing shows a blank field.
 *
 * TODO (needs the studio): real photography per project, plus location, area
 *       and year. Widths are intentionally uneven so the row never reads as a
 *       carousel — keep that when the real crops arrive.
 */
export const WORKS: Work[] = [
  {
    id: "awc",
    category: "Commercial Interiors",
    title: "AWC",
    description: "",
    image: "/images/hero/AWC.jpg",
    width: "min(78vw, 980px)",
  },
  {
    id: "cha-and-co",
    // Categorised from the supplied photograph, which shows an open-plan
    // office fit-out rather than a hospitality space.
    category: "Commercial Interiors",
    title: "Cha and Co",
    description: "",
    image: "/images/hero/chaandco.jpg",
    width: "min(52vw, 660px)",
  },
  {
    id: "kapali-mall",
    category: "Commercial Interiors",
    title: "Kapali Mall Food Court",
    description: "",
    image: "/images/hero/kapalimall.jpg",
    width: "min(66vw, 860px)",
  },
  {
    id: "hero-vadodra",
    category: "Commercial Interiors",
    title: "Hero Vadodra",
    description: "",
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1600&q=85",
    width: "min(46vw, 560px)",
  },
  {
    id: "kyukotoh",
    category: "Hospitality",
    title: "Kyukotoh Gurugram",
    description: "",
    image:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1800&q=85",
    width: "min(60vw, 780px)",
  },
  {
    id: "polo-elevator",
    category: "Commercial Interiors",
    title: "Polo Elevator",
    description: "",
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1600&q=85",
    width: "min(44vw, 540px)",
  },
  {
    id: "sobha-villa",
    category: "Boutique Interiors",
    title: "Sobha Villa Interior",
    description: "",
    // Confirmed as the same commission as the hero's "Sobha Residence".
    image: "/images/hero/shobharesidency.jpg",
    width: "min(58vw, 740px)",
  },
  {
    id: "westerlies-residence",
    category: "Boutique Interiors",
    title: "Westerlies Residence",
    description: "Café theme.",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&q=85",
    width: "min(50vw, 620px)",
  },
  {
    id: "satish-residence",
    category: "Boutique Interiors",
    title: "Satish Residence",
    description: "The muted palette.",
    image:
      "https://images.unsplash.com/photo-1524230572899-a752b3835840?w=1800&q=85",
    width: "min(56vw, 700px)",
  },
];

/** Frequently asked questions — rendered on /faq. */
export const FAQS: Faq[] = [
  {
    id: "project-types",
    question: "What types of projects does Aarnaa Design Studios take on?",
    answer:
      "We work across residential and commercial projects, including villas, bungalows, workplaces, restaurants, cafés, food courts, hotels, resorts and retail spaces.",
  },
  {
    id: "outside-ncr",
    question: "Do you take on projects outside Gurgaon / Delhi NCR?",
    answer:
      "Yes. We undertake projects across India, with the scope and mode of collaboration tailored to the project's location and requirements.",
  },
  {
    id: "smaller-projects",
    question: "Do you take on smaller projects or individual rooms?",
    answer:
      "Yes, depending on the scope and design requirements. We evaluate each project individually to understand where we can bring meaningful value to the space.",
  },
  {
    id: "process",
    question: "What does your design process include?",
    answer:
      "Our process typically moves from understanding the brief and site to concept development, spatial planning, material selection, detailed design, drawings and execution support.",
  },
  {
    id: "timeline",
    question: "How long does the design process take?",
    answer:
      "The timeline depends on the size, complexity and type of project. A detailed timeline is established after understanding the scope and requirements.",
  },
  {
    id: "execution",
    question: "Do you handle execution as well as design?",
    answer:
      "Yes. Aarnaa Design Studios offers design and build / turnkey solutions through our execution partners, allowing the design intent to be carried through to the finished space.",
  },
  {
    id: "fees",
    question: "How do you charge for design?",
    answer:
      "Our design fees are structured based on the project's scope, scale and complexity. We believe in transparent engagements, with the commercial structure and deliverables clearly defined before we begin.",
  },
  {
    id: "vastu",
    question: "Do you offer Vastu consultation?",
    answer:
      "Yes. Vastu-guided planning is available as part of our design approach, led by Dr. Vimmi Kinha, PhD, and integrated with contemporary architectural and interior planning.",
  },
  {
    id: "collaboration",
    question: "Do you work with existing architects or contractors?",
    answer:
      "Yes. We can collaborate with existing consultants, contractors and project teams where required, while clearly defining responsibilities and design deliverables.",
  },
  {
    id: "post-handover",
    question: "Do you provide post-handover support?",
    answer:
      "Yes. We remain available after handover for design-related clarifications and support where required, helping ensure the finished space continues to perform as intended.",
  },
  {
    id: "start",
    question: "How do I start a project with Aarnaa Design Studios?",
    answer:
      "Simply email us your project details with the subject line: “NEW PROJECT — [LOCATION]”. Include the project type, approximate area, location and a brief about your requirements. Our team will get back to you to take the conversation forward.",
  },
];

/**
 * The marks in the colophon — the row that ends every page on the site.
 *
 * ── Two real profiles, and the inbox ─────────────────────────────────────
 *
 * Behance and Pinterest used to sit here pointing at `https://behance.net` and
 * `https://pinterest.com` — the services' own front pages, not the studio's
 * profiles on them. A mark that carries a brand's logo and lands on that
 * brand's homepage is worse than no mark: it looks like a profile that has been
 * taken down. They are out until there is something to point them at.
 *
 * ── The Instagram address is the studio's, verbatim ──────────────────────
 *
 * It carries `?stkn=…&utm_source=qr` — what Instagram appends when you copy the
 * link out of your own profile's QR sheet — and it is kept at the studio's
 * explicit instruction, asked for twice. Do not "tidy" it without checking
 * first; the two things it costs are worth knowing about but were not reasons
 * enough to overrule the request:
 *
 *   · `stkn` is a share token rather than part of the address. If Instagram
 *     ever retires it the profile still resolves, so the failure mode is mild.
 *   · `utm_source=qr` labels every visitor who arrives from THIS website as
 *     having scanned a QR code, so the studio's own analytics cannot separate
 *     website traffic from the printed code.
 *
 * The bare `https://www.instagram.com/aarnaadesignstudios/` reaches the same
 * profile if either ever becomes a problem.
 *
 * ── Gmail is a link, not a logo ──────────────────────────────────────────
 *
 * The studio is reached at a Gmail address, so the mark is Gmail's rather than
 * a generic envelope, and it opens `mailto:` — the visitor's own mail client,
 * whatever that is, with the address filled in. It is NOT a link to Gmail's web
 * compose: that only works for someone signed into Google in that browser, and
 * sends everyone else to a login screen instead of to an email.
 *
 * <Contact /> reads the scheme to decide on `target="_blank"` — a new tab for
 * the two profiles, and none for the mail client. See the note there.
 */
export const SOCIAL_LINKS: SocialLink[] = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/aarnaadesignstudios?stkn=MW8xN3ViYmV3b3cxbA%3D%3D&utm_source=qr",
    icon: FaInstagram,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/aarnaa-estudo/",
    icon: FaLinkedinIn,
  },
  { label: "Email", href: `mailto:${SITE.email}`, icon: SiGmail },
];

