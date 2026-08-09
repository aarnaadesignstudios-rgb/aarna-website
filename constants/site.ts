/**
 * Global site metadata and shared, section-agnostic constants.
 * Editing brand copy here propagates everywhere.
 */
/**
 * Loading-screen choreography, shared so a section can hand off from the intro
 * instead of re-hard-coding the same numbers. <LoadingScreen> owns these; the
 * hero uses them to begin its imagery exactly as the curtain starts to tear,
 * and the navbar times its entrance to the moment the bird leaves frame.
 *
 * The intro is a single beat — "the phoenix takes flight" — cut like this:
 *
 *   0.00  the mark fades up and settles on the emerald void
 *   0.85  a gold glint sweeps across it, tracing its own silhouette
 *   1.35  the bird SEPARATES: raster mark cross-dissolves to vector under a
 *         bloom, so one object appears to come loose from the letterform
 *   1.60  it crouches, then beats its wings twice
 *   2.18  it arcs up and to the right and leaves the frame
 *   2.35  the emerald curtain tears open along that same vector, carrying the
 *         wordmark away with it
 *   3.15  the page below is fully uncovered
 *
 * Seconds are the authoring unit (they match the GSAP timeline); the exported
 * values are ms because that is what the consumers want.
 */
const CUE = {
  /** Mark fades up + settles. */
  settle: 0,
  /** Gold glint sweeps the silhouette. */
  glint: 1.15,
  /** Raster mark → vector bird + letter, hidden under a bloom. */
  separate: 1.85,
  /** Anticipation crouch, then three wing-beats. */
  flap: 2.1,
  /** Arc up-right and out of frame. */
  flight: 2.95,
  /**
   * Curtain peels away along the flight vector.
   *
   * This deliberately overlaps the flight rather than following it. Starting
   * the tear once the bird had fully left leaves a beat of empty emerald, and
   * the peel then reads as a separate event instead of as something the bird
   * pulled open on its way out.
   */
  tear: 3.45,
  /**
   * The "A" lifts out of the middle of the screen and settles into the navbar's
   * emblem slot, arriving just as the curtain finishes clearing.
   */
  letter: 3.55,
} as const;

/** How long the curtain takes to clear the viewport once the tear begins. */
const TEAR_DURATION = 1.05;

/** How long the letterform takes to travel to the masthead. */
const LETTER_DURATION = 1.15;

export const INTRO = {
  /** Cue sheet, in seconds — consumed by the intro timeline. */
  cue: CUE,
  /** Duration of the curtain tear, in seconds. */
  tearDuration: TEAR_DURATION,
  /** Duration of the letterform's travel to the masthead, in seconds. */
  letterDuration: LETTER_DURATION,

  /**
   * When the reveal begins, in ms. Anything that should already be in motion
   * by the time it is uncovered (the hero's imagery) starts here.
   */
  holdMs: CUE.tear * 1000,
  /** How long the curtain takes to clear the viewport, in ms. */
  liftMs: TEAR_DURATION * 1000,
  /** When the whole intro is over, in ms. */
  clearedMs: (CUE.letter + LETTER_DURATION) * 1000,
  /**
   * When the navbar settles into place, in ms.
   *
   * Early, and deliberately so — it lands while the curtain is still up, so it
   * is already at rest behind it. Two reasons. It is then simply *there* when
   * the tear uncovers it, instead of fading in over a live page. And the intro
   * measures the navbar emblem's box to know where to fly the "A": measuring
   * mid-entrance would read a position the navbar is still animating away from,
   * and the letter would land 24px high.
   */
  navbarMs: (CUE.flight - 0.35) * 1000,
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
