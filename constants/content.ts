/**
 * Site content.
 *
 * Project names, service copy, figures and FAQ text below are the studio's
 * real content, supplied in the client review. IMAGERY is still placeholder —
 * every photograph is a stock stand-in, and the per-project location / area /
 * year are marked TODO rather than invented. See the note on WORKS.
 */
import { FaInstagram, FaLinkedinIn, FaBehance, FaPinterestP } from "react-icons/fa";

import type {
  Faq,
  Feature,
  PhotoFrame,
  HeroSlide,
  NavLink,
  Project,
  ProcessStep,
  Service,
  SocialLink,
  Stat,
  Testimonial,
  Work,
} from "@/types";

/** Primary in-page navigation. Order defines both navbar and scroll flow. */
export const NAV_LINKS: NavLink[] = [
  { label: "About", href: "#practice" },
  { label: "Why Us", href: "#why-us" },
  { label: "Services", href: "#services" },
  { label: "Projects", href: "#projects" },
  { label: "Process", href: "#process" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "#contact" },
];

/**
 * Hero imagery — the four projects the studio wants in view on the opening
 * screen, in this order.
 *
 * TODO: the `image` on each is a placeholder from the old stock set. Replace
 *       with real photography of these four projects.
 */
export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "awc",
    image: "/images/hero/workplace-open-plan.jpg",
    alt: "AWC — workplace interior",
    title: "AWC",
  },
  {
    id: "cha-and-co",
    image: "/images/hero/corporate-lounge.jpg",
    alt: "Cha and Co — hospitality interior",
    title: "Cha and Co",
  },
  {
    id: "kapali-mall",
    image: "/images/hero/workplace-collaborative.jpg",
    alt: "Kapali Mall — food court interior",
    title: "Kapali Mall",
    // The wider run reads better than the cabins when cropped to portrait.
    position: "35% 50%",
  },
  {
    id: "sobha-residence",
    image: "/images/hero/residence-foyer.jpg",
    alt: "Sobha Residence — residential interior",
    title: "Sobha Residence",
  },
];

/** Six premium value propositions rendered in the "Why Us" grid. */
export const FEATURES: Feature[] = [
  {
    id: "vision",
    title: "Considered Vision",
    description:
      "Every project begins with a singular idea, refined until nothing unnecessary remains.",
  },
  {
    id: "craft",
    title: "Material Craft",
    description:
      "We honour natural stone, timber and light — detailing them with quiet precision.",
  },
  {
    id: "space",
    title: "Spatial Clarity",
    description:
      "Proportion and flow are choreographed so that each space breathes with intention.",
  },
  {
    id: "light",
    title: "Light as Material",
    description:
      "Daylight is treated as a building block, shaping mood across the hours of a day.",
  },
  {
    id: "living",
    title: "Human Living",
    description:
      "Spaces are designed around ritual and comfort, not just form and photograph.",
  },
  {
    id: "legacy",
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

/**
 * The studio's five disciplines.
 *
 * `body` is revealed when the discipline's NAME is clicked (client request);
 * it is not shown at rest. `href` is set only where the discipline opens a
 * page of its own — currently just Architectural Photography.
 */
export const SERVICES: Service[] = [
  {
    id: "architecture",
    index: "01",
    title: "Architecture",
    body: "Residential & commercial architecture shaped around site, purpose and context — from concept and planning to design development and execution support.",
    image:
      "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1600&q=80",
  },
  {
    id: "commercial-interiors",
    index: "02",
    title: "Commercial Interiors",
    body: "Workspaces, restaurants, cafés, food courts, hotels, resorts, retail and hospitality spaces designed around people, brand, function and experience.",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80",
  },
  {
    id: "boutique-interiors",
    index: "03",
    title: "Boutique Interiors",
    body: "Bespoke interiors for villas, bungalows, residences and resorts, crafted with character, materiality and attention to detail.",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&q=80",
  },
  {
    id: "vastu",
    index: "04",
    title: "Vastu",
    body: "Vastu-guided planning led by Dr. Vimmi Kinha, PhD, bringing experience and insight into the orientation, balance and harmony of spaces.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80",
  },
  {
    id: "photography",
    index: "05",
    title: "Architectural Photography",
    body: "Led by Ar. Divyank Sirohi | Postcard of Life, capturing architecture through light, composition, materiality and architectural storytelling.",
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1600&q=80",
    href: "/photography",
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
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=2000&q=85",
    width: "min(78vw, 980px)",
  },
  {
    id: "cha-and-co",
    category: "Hospitality",
    title: "Cha and Co",
    description: "",
    image:
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1800&q=85",
    width: "min(52vw, 660px)",
  },
  {
    id: "kapali-mall",
    category: "Commercial Interiors",
    title: "Kapali Mall Food Court",
    description: "",
    image:
      "https://images.unsplash.com/photo-1481253127861-534498168948?w=2000&q=85",
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
    image:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1800&q=85",
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

/** Social links, shown in the contact block. */
export const SOCIAL_LINKS: SocialLink[] = [
  { label: "Instagram", href: "https://instagram.com", icon: FaInstagram },
  { label: "LinkedIn", href: "https://linkedin.com", icon: FaLinkedinIn },
  { label: "Behance", href: "https://behance.net", icon: FaBehance },
  { label: "Pinterest", href: "https://pinterest.com", icon: FaPinterestP },
];

/**
 * Architectural Photography — the portfolio shown on /photography.
 *
 * The discipline and its lead (Ar. Divyank Sirohi | Postcard of Life) are the
 * studio's own copy. The FRAMES below are placeholders: aspect ratios and grid
 * spans are real design decisions and should be kept, but every `image` is a
 * stock stand-in.
 *
 * TODO (needs the studio): 8–12 photographs, plus a caption and the project
 *       each belongs to. See public/images/README.md for where to put them.
 */
export const PHOTOGRAPHY_FRAMES: PhotoFrame[] = [
  { id: "p1", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80", span: "md:col-span-7", aspect: "aspect-4/3", caption: "" },
  { id: "p2", image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&q=80", span: "md:col-span-5", aspect: "aspect-3/4", caption: "" },
  { id: "p3", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80", span: "md:col-span-5", aspect: "aspect-3/4", caption: "" },
  { id: "p4", image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1600&q=80", span: "md:col-span-7", aspect: "aspect-4/3", caption: "" },
  { id: "p5", image: "https://images.unsplash.com/photo-1524230572899-a752b3835840?w=1800&q=80", span: "md:col-span-12", aspect: "aspect-21/9", caption: "" },
  { id: "p6", image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80", span: "md:col-span-6", aspect: "aspect-4/5", caption: "" },
  { id: "p7", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80", span: "md:col-span-6", aspect: "aspect-4/5", caption: "" },
];

/**
 * What the photography discipline actually delivers. Written from the studio's
 * own one-line description of the service; not invented credentials.
 */
export const PHOTOGRAPHY_SCOPE = [
  {
    id: "light",
    index: "01",
    title: "Light",
    body: "Each space is shot at the hour it was designed for, not the hour the shoot was booked. Where that means returning, we return.",
  },
  {
    id: "composition",
    index: "02",
    title: "Composition",
    body: "Frames are built on the building's own geometry — its lines, thresholds and sight-lines — rather than imposed on it.",
  },
  {
    id: "materiality",
    index: "03",
    title: "Materiality",
    body: "Stone, timber, lime and metal photographed so their texture survives the screen, which is where most of them are seen.",
  },
  {
    id: "storytelling",
    index: "04",
    title: "Storytelling",
    body: "A set that reads in sequence: approach, threshold, room, detail. A building explained, not merely recorded.",
  },
];
