/**
 * Global site metadata and shared, section-agnostic constants.
 * Editing brand copy here propagates everywhere.
 */

/**
 * Loading-screen choreography, shared so a section can hand off from the intro
 * instead of re-hard-coding the same numbers.
 *
 * ── The loader shows the work, and then opens onto it ────────────────────
 *
 * The previous intro was a full set-piece: the phoenix separated from the
 * letterform, beat its wings, flew out of frame, tore the emerald curtain away
 * along its flight path, and the "A" then flew back to land in the masthead.
 * The client's verdict was blunt — "this animation is very bad" — so it is
 * gone, along with the machinery that supported it (the vector silhouette, the
 * FLIP landing, the masked curtain tear).
 *
 * What replaces it is still under three seconds and still has nothing flying
 * across the screen. Five beats, each of them one gesture:
 *
 *   0.00  a WINDOW opens from a hairline into a portrait      (ends 0.90)
 *         frame holding the studio's FIRST HERO PHOTOGRAPH,
 *         and the mark fades up above it
 *   0.28  a gold RULE draws outward from the centre — the     (ends 0.93)
 *         same hairline that opens every section on this site
 *   0.42  the NAME is drawn up out of that rule, letter by    (ends 1.34)
 *         letter, from behind a clipped edge. Bodoni's
 *         thin/thick strokes arrive as if printed. A COUNTER
 *         starts running in the corner
 *   1.34  a HELD BEAT — the finished lockup simply sits there
 *   1.90  the LOCKUP lifts away, clearing the frame           (ends 2.45)
 *   2.05  the WINDOW OPENS to full-bleed and the counter      (ends 2.95)
 *         reads 100. What is inside it is the hero's own
 *         opening frame — same source, same `sizes`, same
 *         portrait zoom, same pose — so the loader does not
 *         get out of the page's way, it BECOMES the page
 *
 * ── The one part that is not on a clock ──────────────────────────────────
 *
 * The reveal waits for the photograph it is about to open onto, up to a capped
 * extra 0.8s, and the counter holds at 99 until then. That is what makes the
 * counter honest rather than decorative: it reports on the one asset whose
 * absence anybody would actually notice.
 *
 * ── One beat that was cut ────────────────────────────────────────────────
 *
 * A light sweep across the gold — a specular pass, the way light catches
 * foil-stamped type — sat in the held beat for a while. It is gone. It needed a
 * second copy of the wordmark with a gradient clipped to the glyphs, and after
 * two attempts at tuning it (soft and wide reads as nothing; narrow and bright
 * reads as almost nothing) it still could not be seen reliably in a screenshot.
 * A gesture nobody can see is not restraint, it is a duplicated DOM layer whose
 * alignment depends on both copies loading the same font — cost with no benefit.
 *
 * The end times are written down because they are the constraint. The beats have
 * to CHAIN, not overlap: an earlier cut of this had a light sweeping across
 * letters that were still arriving, and the panel leaving 90ms after the last
 * one landed — four good gestures reading as one muddle. Every beat here starts
 * after the previous one has finished, and the whole thing still lands inside
 * the 2.9s the two-fade version took.
 *
 * The reason it stays this restrained is on the record: the client's verdict on
 * the previous set-piece was "this animation is very bad". So nothing here
 * separates, flies, bounces or tears.
 *
 * Seconds are the authoring unit (they match the GSAP timeline); the exported
 * values are ms because that is what the consumers want.
 */
const CUE = {
  /** The window opens from a hairline, and the mark fades up beside it. */
  settle: 0,
  /** The gold rule draws out from the centre. */
  rule: 0.28,
  /** The wordmark's letters rise out of the rule, and the counter starts. */
  name: 0.42,
  /** The lockup begins to lift, clearing the frame before it opens. */
  lift: 1.9,
  /**
   * The window opens to full-bleed — the reveal.
   *
   * Still called `dissolve` because `holdMs`, `navbarMs` and `clearedMs` below
   * are all derived from it and are consumed across the site.
   */
  dissolve: 2.05,
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
   * The longest the reveal will wait for the hero photograph before opening
   * anyway, in ms — see the gate note above.
   *
   * Shared because <Hero /> needs it: its fallback for "the loader must be
   * finished by now" is `clearedMs + this`, since the gate is the one thing that
   * can push the reveal past its nominal time.
   */
  revealWaitCapMs: 800,

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
