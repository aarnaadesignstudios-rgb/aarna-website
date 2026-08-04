/**
 * Placeholder content for Phase 1.
 *
 * All copy and imagery here is temporary and exists only to build out layout
 * and motion structure. Remote Unsplash URLs are used as placeholders and are
 * whitelisted in next.config.ts.
 *
 * TODO: replace every image with an optimised local asset in /public/images and
 *       swap placeholder copy for final brand content.
 */
import {
  FiCompass,
  FiFeather,
  FiLayers,
  FiSun,
  FiHome,
  FiAward,
} from "react-icons/fi";
import { FaInstagram, FaLinkedinIn, FaBehance, FaPinterestP } from "react-icons/fa";

import type {
  Feature,
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
  { label: "Contact", href: "#contact" },
];

/**
 * Hero imagery — real studio work, cross-dissolved one frame at a time.
 *
 * Sources live in /assets at full resolution; these are the 2560px web copies.
 * Order alternates commercial ↔ residential so the cycle keeps showing range
 * instead of settling into one mood.
 */
export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "corporate-lounge",
    image: "/images/hero/corporate-lounge.jpg",
    alt: "Corporate reception lounge with brass pendants and gold velvet armchairs",
  },
  {
    id: "residence-bedroom",
    image: "/images/hero/residence-bedroom.jpg",
    alt: "Master bedroom with botanical panelling and a coved, backlit ceiling",
  },
  {
    id: "workplace-open-plan",
    image: "/images/hero/workplace-open-plan.jpg",
    alt: "Open-plan workplace with a slatted ceiling raft and planted desk dividers",
  },
  {
    id: "residence-foyer",
    image: "/images/hero/residence-foyer.jpg",
    alt: "Residential foyer with fluted joinery and a cluster of brass-framed mirrors",
  },
  {
    id: "workplace-collaborative",
    image: "/images/hero/workplace-collaborative.jpg",
    alt: "Workstation bay running to a glazed façade beside private cabins",
    // The desk run reads better than the cabin doors when cropped to portrait.
    position: "35% 50%",
  },
];

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
 * Five is deliberate — enough to establish the studio, few enough to stay a
 * glance rather than a section.
 *
 * TODO: confirm every figure with the studio before launch. Note that the hero
 *       currently reads "Est. 2008", which contradicts the 8-year figure below —
 *       one of the two needs correcting.
 */
export const STATS: Stat[] = [
  { id: "years", value: 8, suffix: "+", label: "Years in practice" },
  { id: "projects", value: 150, suffix: "+", label: "Projects delivered" },
  { id: "area", value: 2, suffix: "M+", label: "Sq. ft. designed" },
  { id: "cities", value: 12, label: "Cities across India" },
  { id: "returning", value: 96, suffix: "%", label: "Repeat & referred" },
];

/** Studio services rendered as large horizontal cards. */
export const SERVICES: Service[] = [
  {
    id: "architecture",
    title: "Architecture",
    description:
      "Ground-up architectural design for private residences, retreats and cultural spaces.",
    image:
      "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1600&q=80",
  },
  {
    id: "interiors",
    title: "Interiors",
    description:
      "Interior architecture and bespoke detailing that carries the concept indoors.",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&q=80",
  },
  {
    id: "landscape",
    title: "Landscape",
    description:
      "Site, garden and threshold design that dissolves the line between inside and out.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80",
  },
  {
    id: "advisory",
    title: "Advisory",
    description:
      "Art direction, material curation and long-term stewardship of completed works.",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80",
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
  {
    id: "stone-pavilion",
    title: "Stone Pavilion",
    location: "Udaipur, India",
    year: "2023",
    category: "Cultural",
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1600&q=80",
  },
  {
    id: "forest-retreat",
    title: "Forest Retreat",
    location: "Coorg, India",
    year: "2023",
    category: "Hospitality",
    image:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&q=80",
  },
  {
    id: "city-loft",
    title: "City Loft",
    location: "Mumbai, India",
    year: "2022",
    category: "Interior",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&q=80",
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
 * Client testimonials. Split down the middle across the two marquee bands in
 * the Testimonials section, so keep enough entries for each band to fill a row
 * (four apiece is comfortable).
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
 * Selected Works — panels for the pinned horizontal gallery.
 * Widths are intentionally uneven so the row never reads as a carousel.
 */
export const WORKS: Work[] = [
  {
    id: "vaastu-nivas",
    category: "Luxury Residential",
    title: "Vaastu Nivas",
    location: "Alibaug, Maharashtra",
    area: "11,400 sq ft",
    year: "2024",
    description:
      "A laterite plinth cut into the slope, four courts turned to the monsoon wind. The sea is never shown, only heard.",
    image:
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=2000&q=85",
    width: "min(78vw, 980px)",
  },
  {
    id: "travertine-house",
    category: "Luxury Residential",
    title: "The Travertine House",
    location: "Jaipur, Rajasthan",
    area: "8,200 sq ft",
    year: "2023",
    description:
      "One stone, quarried once, cut nine ways. A house that gets warmer as the desert cools.",
    image:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1800&q=85",
    width: "min(52vw, 660px)",
  },
  {
    id: "amaris",
    category: "Hospitality",
    title: "Amaris",
    location: "Coorg, Karnataka",
    area: "42,000 sq ft",
    year: "2025",
    description:
      "Twenty-two keys hidden in a coffee estate. No lobby — you arrive into a room with a fire already lit.",
    image:
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=2000&q=85",
    width: "min(66vw, 860px)",
  },
  {
    id: "kinha-atelier",
    category: "Boutique Interiors",
    title: "Kinha Atelier",
    location: "Mumbai",
    area: "3,600 sq ft",
    year: "2022",
    description:
      "Our own rooms, rebuilt — nine desks, one nine-metre table, no partitions.",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&q=85",
    width: "min(40vw, 480px)",
  },
  {
    id: "sanchaya",
    category: "Commercial",
    title: "Sanchaya",
    location: "Ahmedabad, Gujarat",
    area: "96,000 sq ft",
    year: "2024",
    description:
      "A headquarters organised around shade rather than floors. Nobody sits more than seven metres from daylight.",
    image:
      "https://images.unsplash.com/photo-1481253127861-534498168948?w=2000&q=85",
    width: "min(60vw, 780px)",
  },
  {
    id: "two-courtyards",
    category: "Sustainable",
    title: "House of Two Courtyards",
    location: "Assagao, Goa",
    area: "6,900 sq ft",
    year: "2021",
    description:
      "Two open rooms with no roof, and a house arranged politely around them.",
    image:
      "https://images.unsplash.com/photo-1524230572899-a752b3835840?w=1800&q=85",
    width: "min(48vw, 600px)",
  },
];

/** Footer social links. */
export const SOCIAL_LINKS: SocialLink[] = [
  { label: "Instagram", href: "https://instagram.com", icon: FaInstagram },
  { label: "LinkedIn", href: "https://linkedin.com", icon: FaLinkedinIn },
  { label: "Behance", href: "https://behance.net", icon: FaBehance },
  { label: "Pinterest", href: "https://pinterest.com", icon: FaPinterestP },
];
