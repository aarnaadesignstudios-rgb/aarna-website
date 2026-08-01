/**
 * Global site metadata and shared, section-agnostic constants.
 * Editing brand copy here propagates everywhere.
 */
/**
 * Loading-screen timing, shared so a section can hand off from the intro instead
 * of re-hard-coding the same numbers. <LoadingScreen> owns these; the hero uses
 * them to begin its imagery exactly as the curtain starts to lift.
 */
const INTRO_HOLD_MS = 1900;
const INTRO_LIFT_MS = 900;

export const INTRO = {
  /** How long the brand overlay is held before it lifts away. */
  holdMs: INTRO_HOLD_MS,
  /** How long the curtain takes to clear the viewport. */
  liftMs: INTRO_LIFT_MS,
  /** When the page below is fully uncovered. */
  clearedMs: INTRO_HOLD_MS + INTRO_LIFT_MS,
} as const;

export const SITE = {
  name: "Aarnaa Design Studios",
  shortName: "Aarnaa",
  tagline: "Architecture of quiet luxury",
  description:
    "Aarnaa Studios is a premium architecture and interior design practice crafting calm, sophisticated spaces where light, material and proportion meet.",
  email: "studio@aarnaa.com",
  phone: "+91 98765 43210",
  address: "12 Marine Drive, Mumbai, India",
  url: "https://aarnaa.studio",
} as const;
