/**
 * Global site metadata and shared, section-agnostic constants.
 * Editing brand copy here propagates everywhere.
 */

/**
 * Loading-screen choreography, shared so a section can hand off from the intro
 * instead of re-hard-coding the same numbers.
 *
 * ── Why this is now three beats instead of eight ──────────────────────────
 *
 * The previous intro was a full set-piece: the phoenix separated from the
 * letterform, beat its wings, flew out of frame, tore the emerald curtain away
 * along its flight path, and the "A" then flew back to land in the masthead.
 * The client's verdict was blunt — "this animation is very bad" — so it is
 * gone, along with the machinery that supported it (the vector silhouette, the
 * FLIP landing, the masked curtain tear).
 *
 * What replaces it is deliberately unshowy. A logo, a name, a pause, a
 * dissolve. Nothing to dislike, and it is over in under three seconds instead
 * of nearly five:
 *
 *   0.00  the mark fades up and settles
 *   0.45  the name fades in beneath it, on ONE line
 *   1.20  a held beat — the lockup simply sits there
 *   2.00  the whole screen dissolves into the page
 *   2.90  done
 *
 * Seconds are the authoring unit (they match the GSAP timeline); the exported
 * values are ms because that is what the consumers want.
 */
const CUE = {
  /** Mark fades up + settles. */
  settle: 0,
  /** Wordmark fades in beneath it. */
  name: 0.45,
  /** The screen begins to dissolve. */
  dissolve: 2.0,
} as const;

/** How long the dissolve takes. */
const DISSOLVE_DURATION = 0.9;

export const INTRO = {
  /** Cue sheet, in seconds — consumed by the intro timeline. */
  cue: CUE,
  /** Duration of the closing dissolve, in seconds. */
  dissolveDuration: DISSOLVE_DURATION,

  /**
   * When the reveal begins, in ms. Anything that should already be in motion
   * by the time it is uncovered (the hero's imagery) starts here.
   */
  holdMs: CUE.dissolve * 1000,
  /** How long the dissolve takes, in ms. */
  liftMs: DISSOLVE_DURATION * 1000,
  /** When the whole intro is over, in ms. */
  clearedMs: (CUE.dissolve + DISSOLVE_DURATION) * 1000,
  /**
   * When the navbar settles into place, in ms.
   *
   * Deliberately before the dissolve finishes, so the masthead is already at
   * rest behind the intro rather than fading in over a live page.
   */
  navbarMs: (CUE.dissolve - 0.3) * 1000,
} as const;

export const SITE = {
  name: "Aarnaa Design Studios",
  shortName: "Aarnaa",
  tagline: "Architecture of quiet luxury",
  description:
    "Aarnaa Design Studios is a multidisciplinary architecture and interior design practice in Gurugram, specialising in architecture, commercial interiors and bespoke spaces.",
  email: "studio@aarnaa.com",
  /** As supplied by the studio. */
  phone: "+91 99903 47716",
  /** Dial string for tel: links — digits only. */
  phoneHref: "+919990347716",
  address: "Gurugram Sec 103, India",
  url: "https://aarnaadesignstudios.com",
  /** Display form of the URL, for the contact block. */
  urlLabel: "aarnaadesignstudios.com",
  /** The year the studio was founded. Drives every "Est." line on the site. */
  founded: "2019",
} as const;
