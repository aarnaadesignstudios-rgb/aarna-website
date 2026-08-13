# Aarnaa Design Studios — Visual Design System

Single source of truth for color and typography. Every value below is implemented
as a design token in [`styles/globals.css`](styles/globals.css) — never hardcode
a hex/rgba/hsla color in a component; reference the token (Tailwind utility,
`var(--color-*)`, or `color-mix()` against a token) instead. That's the only way
the site stays visually consistent as it grows.

## Colors

The brand green and gold are sampled directly from the logo
(`public/images/aarnaa-logo-transparent.png`), not chosen freehand — so the
website ink always matches the mark exactly.

| Token | Hex | Tailwind utility | Role |
|---|---|---|---|
| `--color-emerald` | `#0c402d` | `bg-emerald` / `text-emerald` / `border-emerald` | Primary brand green — the logo background green. Headings, primary surfaces, primary text on light. |
| `--color-emerald-light` | `#13573e` | `bg-emerald-light` | Lifted emerald. Kept as part of the ramp; no current caller now that the dark panels are gone. |
| `--color-emerald-deep` | `#06291c` | `bg-emerald-deep` | Near-black pine. Kept as part of the ramp; no current caller. **Not a scrim colour** — that is what it used to be, and it is why photography on this site once looked green. Use `--color-ink`. |
| `--color-gold` | `#c9a932` | `bg-gold` / `text-gold` / `border-gold` | Primary brand gold — sampled pixel-exact from the logo mark/wordmark (`hsl(47.3 60.2% 49.2%)`, the most common gold pixel in the PNG). Accents, CTAs, hover states, dividers. |
| `--color-gold-soft` | `#dac36c` | `text-gold-soft` | Champagne gold — the same hue/saturation lifted to 64% lightness. Subtle glows, secondary accent text on dark. |
| `--color-gold-ink` | `#8b6609` | `text-gold-ink` | **Gold that is legible as TYPE on a light ground** — the same hue and saturation as `--color-gold` at 40% lightness. `--color-gold` is ~2:1 against paper: correct for hairlines, marks and glows, unreadable as small or running type. Use this for any gold *text* (the Contact heading, labels, the spine, the mobile index numerals). |
| `--color-charcoal` | `#17201c` | `text-charcoal` | Ink — default body text. Cooled onto the grounds' hue; a *warm* near-black on a cool ground reads faintly brown on every paragraph. |
| `--color-paper` | `#f8fbf9` | `bg-paper` | Brightest ground — chapter 01. |
| `--color-mist` | `#f1f6f3` | `bg-mist` | **The default ground** — `<body>`, /faq, /photography. |
| `--color-sage` | `#e4ece8` | `bg-sage` | Plinth — chapter 03, the mobile index, the intro screen. |
| `--color-sage-deep` | `#d2e0da` | `bg-sage-deep` | Chapter 04. |
| `--color-moss` | `#235c47` | `bg-moss` | **Mid brand green** — chapter 05. Carries cream type at 6.8:1. Where the green stops being a tint. |
| `--color-stone` | `#dde5e1` | `bg-stone` | The colour behind an image while it decodes. |
| `--color-cream` | `#f6f2e9` | `text-cream` | **Type on emerald, and over photography.** Every green chapter's body ink, the hero caption, the masthead over the hero, the chapter card. |
| `--color-ink` | `#0a0a09` | `bg-ink` | True neutral with the faintest warm cast. **Scrims and overlays over photography only** — never a section ground. A scrim exists to darken, not to colour: every scrim on this site used to be built from `--color-emerald-deep`, which tinted the photograph underneath it green. |

**Usage rules**

- **Green and gold must always resolve to the exact hex above, everywhere on the site** — navbar, headings, buttons, borders, glows, shadows, overlays, `<meta theme-color>`. If a value needs alpha (a tint, a glow, a scrim), build it from the token with `color-mix(in srgb, var(--color-emerald-deep) 75%, transparent)` (see `.vine` in `globals.css` for the pattern) rather than re-typing an `rgba()` triplet.
- Don't reach for Tailwind's stock `green-*` / `emerald-*` / `amber-*` / `yellow-*` numbered scales — they aren't the brand color and will drift the moment anyone eyeballs a shade.
- To change the brand green or gold in the future, edit the token in `styles/globals.css` **once** — everything using the Tailwind utilities or `var()` picks it up automatically.

### Grounds are near-achromatic. The brand lives in the deep tones and the accent.

This is the rule the palette failed twice before arriving at, and it is checkable
rather than a matter of taste. Two faults, compounding:

1. **Wrong hue.** `emerald` is hsl(158 …), a cool blue-leaning green. The grounds
   were built at hue **84–100°** — olive. Sixty degrees of mismatch between the
   brand colour and every surface it sits on is not a family of greens; it is two
   greens arguing, and the eye resolves that as mud.
2. **Too much of it.** They carried **13–22% saturation**. Checked against the
   reference palettes for architecture, luxury and premium-brand products, every
   one puts its background at effectively zero chroma (`#FAFAF9`, `#FFFFFF`) and
   spends all of its colour on the primary and the accent. A saturated background
   does not read as branded, it reads as *stained*.

So every ground is now hue 154–158, matching emerald, with chroma cut to a
whisper — cool near-whites with green in them rather than green surfaces. The
widest channel spread in any of them is 14/255, and in all of them **blue sits
above red**, which is what makes them lean cool. The old `sage-deep` was
`#c9d5c2`: spread 19, with blue the *lowest* channel. That single relationship is
the difference between clean and dirty.

The brand went the other way at the same time. `moss` moved onto emerald's own
hue and up from 30% to 45% saturation; `gold-ink` moved from 73% to 88%, because
at 73% a dark gold on a cool ground turns olive and at 88% it stays brass (the
reference palettes land their gold accent near `#A16207`). **Quiet grounds,
saturated brand** — that contrast is the thing that reads as expensive.

### Two grounds, both flat. No gradient on any surface.

Every ground is either `paper` or `emerald`, painted as a **flat colour**, and
they alternate:

| | Chapter | Ground |
|---|---|---|
| | the title plate | `emerald` |
| 01 | The Practice | `paper` |
| 02 | Selected Works | `emerald` |
| 03 | Testimonials | `paper` |
| 04 | Process | `emerald` |
| 05 | Services | `emerald` |
| 06 | Contact | `emerald` + photograph under a flat 94% veil |

What this replaced: a sage plinth that faded at both ends, a "cyclorama" that
swept from paper at its centre to emerald in its corners, a moss band that opened
on one neighbour and closed on the other, and an emerald room built from three
stacked `linear-gradient`s. Every one of them was solving the same problem — how
to get from one section's colour to the next without a seam — and the studio's
note was that the result read as **green smears rather than as green**.

The honest fix is not a better gradient. It is to stop needing one: with two
grounds and a hard edge between them there is no transition to hide. A flat brand
green meeting a flat near-white is a decision; a gradient between them is an
apology for the decision.

Consequences:

- **`sage`, `sage-deep`, `mist`, `moss` and `stone` have no callers.** They are
  left in the token block as the ramp they belong to, but reaching for one puts a
  third ground on the page and breaks the alternation.
- Type on a green chapter is `cream` / `gold` / `gold-soft`; on paper it is
  `emerald` / `charcoal` / `gold-ink`. `tone="dark"` on `<SectionHeading />` and
  `<InfiniteMovingCards />` selects the first set.
- `data-chrome="dark"` now has six callers (both photographic heroes, the title
  plate, and chapters 02/04/05/06). The masthead **and** `<Spine />` read it.
- Anything mixed from `--color-emerald` will be *lighter* than a `bg-emerald`
  ground, not darker. The spine's label fog hit this and had to be rebuilt from
  `--color-emerald-deep`; a fog has to move away from its ground, and on a dark
  ground that means down.

### The figures strip

"7+ YEARS IN PRACTICE" under the hero is flat `bg-emerald` with champagne figures
over gold labels, as the studio asked. `.surface-emerald` — the layered gradient
panel it used to be — is gone with every other gradient.

### Surfaces

There are almost none left, and that is the point. What survives:

- `.ring-stage` / `.ring-3d` / `.ring-face` — the three properties CSS has and
  Tailwind does not that make the Selected Works cylinder work: `perspective` on
  the stage, `preserve-3d` + `rotateY` on the ring, and the per-face swing out to
  the radius. Read the note in `globals.css` before touching the transform order
  on `.ring-face`; it is not interchangeable.
- `.ring-floor` / `.ring-reflect` — the ring's footprint disc and the mirrored
  copy under each card.
- `.vine` — the draw-on for the gold ornament. See **The ornament** below.
- `.glass-bar` / `.glass-bar-dark` / `.glass-bar-light` — the chrome's material.

Deleted, and not to be reintroduced: `.surface-emerald`, `.surface-sage`,
`.surface-sage-deep`, `.surface-moss`, `.stage-cyclorama`, `.overlay-paper`,
`.overlay-emerald-room`, `.overlay-emerald`, `.sheet-grid`, `.bloom*`. Every one
was a gradient on a ground.

## The ornament

[`components/ui/Ornament.tsx`](components/ui/Ornament.tsx), placed by
[`components/ui/SheetTexture.tsx`](components/ui/SheetTexture.tsx) — a gold vine
with leaves and a five-petalled blossom, drawn on when a chapter enters view.

It replaced a drawing grid, and the reason is worth keeping: **a grid is a
filler.** It is what you reach for when a space needs something and you have not
decided what — it belongs to the wireframe the design came out of, not to the
brand it is for. The mark is a phoenix drawn in a single gold line, so the
ornament is drawn in a single gold line. Same weight, same colour, same hand.

It is the only decorative element on the site and it is used identically in every
chapter. That is what makes it a system rather than a garnish.

Four things that are load-bearing:

- **`pathLength="1"` on every path.** It normalises the dash arithmetic so one
  keyframe draws every path 0→1 regardless of its real length; without it each
  path needs its own measured length in JS, on every resize. The stagger is
  `animation-delay` per element, so the stem draws first and the leaves open
  behind it.
- **It draws once**, on an `IntersectionObserver` that disconnects immediately. A
  vine that keeps animating is a loading spinner.
- **It hangs ~44% off the page edge.** Placed fully inside its box the large one
  runs straight through the Contact heading and the contact details. Bleeding it
  also makes it read correctly — what stays on screen is the outer edge of
  something larger growing in from the margin, which is how a marginal flourish
  behaves in print. Contained, it reads as a sticker.
- **Desktop only.** It works because it hangs into a gutter, and a phone has no
  gutter. Same rule `<Spine />` follows.

`<SheetTexture />` is `absolute`, so every caller must put its content in a
positioned wrapper — positioned elements paint above static ones regardless of
DOM order. That requirement is why it is a component rather than a `::before` on
each section: it fails loudly in review instead of quietly at a breakpoint nobody
screenshotted.

## Chapter 01 is a centred statement with a 3D plate

`<Practice />`. The heading is centred, set one weight up (`font-medium` — the
one place on the site that departs from the single 400 weight, because this is
the page's masthead statement and the step is doing work), and owns the full
width. The pull quote and the standfirst sit under it on the same axis; nothing
was cut, they moved from a right-hand column.

Under it, a wide photograph laid back in 3D that stands up as you scroll to it:
`rotateX` 14°→0 while it rises, with the image drifting the other way inside its
frame. Perspective on the wrapper, transform on the child — perspective applies
to an element's *children*, so both on one element gives a skew rather than a
rotation.

That is deliberately the same language as `<SelectedWorks />`. A site whose only
3D moment is one section reads as a section with a gimmick in it; two, built from
the same parts, read as how this site handles pictures.

## Typography

THREE roles, and nothing outside them. Families are loaded via `next/font/google`
in [`app/layout.tsx`](app/layout.tsx) and exposed as CSS variables consumed in
`styles/globals.css`.

| Token | Family | Weights | Role |
|---|---|---|---|
| `--font-serif` | Cormorant Garamond | 400, 500, 600, 700 | **Everything that is not body copy**: every heading, every label, every figure. The studio's voice. 700 exists for one element — the masthead's nav labels (see below). |
| `--font-sans` | Inter | variable | **Running body copy, and only that.** Modern, quiet, gets out of the way. |
| `--font-display` | Bodoni Moda | 500, 600, 700 (+ italic) | **The wordmark, and only that** — the name in the masthead and on the intro screen. Two places. Not a general-purpose display serif. |
| `--font-label` | (= Cormorant) | 600 | Alias consumed by the `.font-label` recipe. |

**The scale.** Two named sizes carry almost the whole page, and both live in the
`@theme` block so a new one has to be added where it is visible next to the
others rather than inline at one call site:

| Token | Value | Used by |
|---|---|---|
| `--text-label` | 12px / 1.35 / `0.16em` / uppercase | Every small label on the site, via `.font-label` |
| `--text-body` | 16px / 1.8 | `body` and every `<p>` |

**Usage rules**

- Headings are **one weight, 400**, set globally on `h1`–`h6` in `globals.css`. Don't add `font-light` / `font-normal` / `font-medium` per component — 300 isn't even loaded, so those were silently rendering at 400 anyway.
- A label is the single class `font-label`. It carries family, weight, size, leading, tracking, case and lining figures. Don't re-declare `text-[12px] uppercase tracking-[…]` alongside it.
- Body copy inherits its size and leading from `p`. A paragraph should only carry colour and measure (`max-w-*`).
- Figures (the statistics strip) use `.type-figure` — the serif at 500 with lining numerals.
- Buttons and CTAs are labels: `Button` uses `font-label`, not a sans weight of its own.
- The masthead is the one licensed exception: its labels go to `font-bold` (700) at full ink, because 12px Cormorant over live photography through glass was not legible at 600. See the note at the top of `components/layout/Navbar.tsx`.

## Navigation

Every link on the site goes through [`components/ui/SmoothLink.tsx`](components/ui/SmoothLink.tsx),
which is the one place that knows the difference between an in-page anchor, that
same anchor requested from another page, an internal route and an external URL.
Don't reach for a bare `<a href="#…">` — on /faq and /photography it points at
ids that do not exist there.

**How the site travels between sections.** Not by scrolling there. The decision
lives in [`lib/sectionNavigation.ts`](lib/sectionNavigation.ts):

| Destination | Behaviour |
|---|---|
| A section > 0.6 viewport heights away | **Chapter card** — a sage panel wipes in from the direction of travel, names the destination (`02 · Why Us`) in the site's own section grammar, and lifts away with it already in place. The scroll happens instantly, unseen. |
| A section ≤ 0.6 viewport heights away | Smoothed Lenis scroll — it is already on screen, so there is no journey to hide. |
| Another PAGE (`/faq`, `/photography`, or a home section from either) | The same chapter card, with the route change happening while covered. FAQ sits in the masthead between Process and Contact and nothing marks it as a page rather than a section; it should not be the one link that behaves differently. |
| The hero's scroll cue | Always the glide. It says "scroll", so it scrolls. |
| Arriving deep link, or `prefers-reduced-motion` | Instant, undressed. |

The reason is not decoration. A tween across this page crosses two GSAP-pinned
galleries whose tracks translate sideways, so every scrubbed animation between
here and there plays at ~20× speed — measured at four dropped frames of 50–83ms
per jump, which is what "jittery, like the page scrolls sideways" was. Nothing
animates through the intermediate sections any more; the only moving thing during
a transition is one transform on one panel. See the file header for the full
argument, and [`components/ui/SectionTransition.tsx`](components/ui/SectionTransition.tsx)
for the choreography.

Three supporting rules:

- Scroll targets stop `SCROLL_OFFSET` (96px) short, so the fixed masthead never
  covers a section heading.
- The intro screen plays **once per page load**, on a cold arrival at `/` — not
  every time someone returns to the home page. It is an introduction, and a
  mid-session navigation is not one. Everything timed to it (the masthead's
  entrance, the hero's cue and image cycle) reads its delay from
  [`lib/intro.ts`](lib/intro.ts), so skipping the screen also skips the waiting.

## The loader

[`components/sections/LoadingScreen.tsx`](components/sections/LoadingScreen.tsx)
holds the **hero's own first photograph** in a portrait window, with the mark
above, the wordmark and gold rule below, and a counter in the corner. At the end
the window opens to full-bleed rather than the panel dissolving away — and
because what is inside it is the hero's opening frame at the same source, `sizes`,
portrait zoom and pose, the loader does not get out of the page's way, it becomes
the page. The three shared values are published from
[`ImageCycle`](components/ui/ImageCycle.tsx) (`FRAME_SIZES`,
`FRAME_ZOOM_CLASS`, `FRAME_OPENING_POSE`) so the two copies cannot drift apart.

Two consequences worth knowing before changing anything here:

- The hero **holds its opening frame still** until the loader signals it is done
  (`onIntroCleared`), not until a timer expires — because the reveal waits for
  the photograph (`INTRO.revealWaitCapMs`) and a clock cannot know that. A hero
  timed off the clock starts its slow zoom while the loader is still waiting, and
  the two copies of the same picture drift apart visibly.
- The window's position is **measured** from an empty laid-out slot rather than
  computed from viewport percentages, and re-measured when the web font swaps or
  the window resizes. A percentage inset cannot hold an aspect ratio: the two
  axes resolve against different lengths.
- `html`/`body` use `overflow-x: clip`, **not** `hidden`. `hidden` on one axis
  makes the other compute to `auto`, which turned `<body>` into a scroll
  container nested inside Lenis's own — the source of scroll judder, and of
  `position: sticky` resolving against the wrong box.

Arriving hash navigations (`/#contact`, back/forward, an edited URL) are
completed by [`lib/SmoothScrollProvider.tsx`](lib/SmoothScrollProvider.tsx).

## The hero cuts, it does not fade

[`ImageCycle`](components/ui/ImageCycle.tsx) takes a `transition` of `"dissolve"`
or `"wipe"`. The hero uses `wipe`, at a 1.4s hold + 0.62s cut — a project every
two seconds.

The reasoning is worth keeping, because "make it dynamic" is usually answered
with a headline and this section is deliberately wordless: **an eye tracks an
edge, and does not track a change in opacity.** The old cross-dissolve meant
something was always happening on the opening screen and none of it was
*visible*. The wipe uncovers the incoming project from the right edge leftward
while its own content slides the other way, with a champagne hairline riding the
moving edge, so the frame arrives already in motion instead of sitting still
behind a travelling mask. Direction matters: it comes in from the right, the same
direction the projects rotate in from in Selected Works, so the page agrees with
itself about which way "next" is.

Three mechanics that are load-bearing:

- The wipe is a `clip-path` on one element and a `transform` on the element
  *inside* it. They cannot share an element — a transform on the clipping layer
  drags the clip with it, and the edge then travels with the picture rather than
  across it.
- It **does not run on the opening frame** (`outgoing < 0`). The loader hands over
  by matching that frame pixel for pixel, so anything animating it at that moment
  tears the handover.
- The outgoing frame holds at `inset(0)` underneath until the cut finishes and
  only then resets — the same deferred reset the dissolve uses, for the same
  reason: reset it early and the composite dips toward the background mid-cut.

The caption under it is on a mask and rises through it on every cut, over the
same 0.62s, and the tick row beneath fills across exactly one frame's life
(`HOLD_MS + WIPE_MS`, named once in the hero and shared by both consumers).

## Selected Works is a ring

[`components/sections/SelectedWorks.tsx`](components/sections/SelectedWorks.tsx).
The nine commissions sit on the faces of an invisible cylinder and scrolling
rotates it; only the front hemisphere is drawn, so what you see is a shallow arc
of photographs curving away into the page — the front project square-on, its
neighbours turned and foreshortened, the ones past them edge-on slivers. Modelled
on the projects section of kartalucia.com, measured off the live page.

Two departures from that reference, both because this page is paper and that one
is black:

- Depth is **aerial perspective**, not shadow. The further round the ring a face
  is, the more of the page's own cream is washed over it, until it disappears
  into the paper. One opacity on a child element — no filters, no blur.
- The project's name is **flat type on the page**, not on the card. Type inside a
  3D transform is rasterised at one scale and resampled, so a title on the front
  face is visibly soft next to that face's own photograph, and turns to mush the
  moment it rotates.

And two things that are specific to this codebase:

- **The ring snaps visually; the scroll never snaps.** ScrollTrigger's `snap`
  tweens the scroll position, and Lenis re-applies its own `animatedScroll` every
  frame — the same reason a test driver cannot use `window.scrollTo` here. So
  scroll progress is mapped through a `smootherstep`, which is flat at both ends:
  the ring dwells with one project square-on through most of that project's share
  of the scroll and then swings decisively to the next. Nothing fights the
  scroller and the travel stays reversible. The progress rail is driven by the raw
  scroll, *not* by the ring, or it inherits the dwell and reads as a stuck page.
- Everything per-frame is a direct style write (custom properties on the ring and
  its faces), never React state. The only state is the active index, guarded on a
  change of integer — so the section re-renders nine times across the whole
  scroll rather than sixty times a second.

Below `lg` the section releases into a plain vertical stack. The ring and the
stack keep **separate ref arrays**: they shared one, and because the geometry pass
runs before the desktop `matchMedia` is consulted, on a phone it wrote ring
opacities onto the stack's cards and the whole section rendered as an empty box.

### Giving it character

The first build of the ring rotated correctly and still read as flat, with the
note back being "too much white space" and "missing character". Those were one
fault: an arc of photographs floating on an empty rectangle. Nothing told the eye
it was looking at an object in a space, so the space around it was not
composition, it was unused page.

Reference for the fix came from the Awwwards architecture and green collections —
Heights Agency, Eladio Dieste, Kononenko, Pelizzari. The consistent lesson across
all of them is blunt: **award sites fill the frame, and the brand colour is a
ground rather than a garnish.** Images bleed to the edges, type overlaps them,
grids are dense, and whole screens are owned by one colour.

Six changes, all in service of giving the ring a room:

| | What | Why it earns its place |
|---|---|---|
| 1 | **The floor** (`.ring-floor`) | A disc laid flat at the foot of the cards, drawn as an ellipse by perspective. The cheapest large gain here — depth becomes something you SEE rather than infer from foreshortening. One element. |
| 2 | **Reflections** (`.ring-reflect`) | A mirrored, masked copy of each photograph hanging under its card, turning with it. Same `src`, so no extra network. |
| 3 | **The cyclorama** | The ground is a lit green sweep, not a flat fill. Fills the frame and answers "more green" at once. |
| 4 | **Pointer tilt** | The turntable leans ±3° toward the pointer, eased over 0.7s. Small, and it is the difference between a diagram and a thing with mass. |
| 5 | **A ghost numeral** | The active index, outlined, at 30vw, bleeding off the right edge. |
| 6 | **A denser arc** | Bigger cards, tighter radius, shorter perspective — the arc reaches both screen edges and the cards overlap slightly. |

Four traps in there, each of which produced something that looked like working
code and did nothing:

- **Perspective is the character dial.** At 1500px the arc was almost
  orthographic — technically rotating, reading as flat. 1250 foreshortens the
  flanks hard enough that the cylinder is legible as a solid. Below ~1000 the
  front card keystones and it reads as a fisheye.
- **A plane at `rotateX(90deg)` is invisible** to a camera on the same axis: it
  draws as a line. The floor only exists because the ring carries a fixed +7°
  downward bias on top of the pointer's contribution. At the original 4° the
  ellipse was still a hairline.
- **The tilt vars are unitless numbers, multiplied by `1deg` in CSS.** GSAP
  interpolates a custom property by parsing its computed value, and a property
  only ever referenced through a `var(…, 0deg)` fallback has no computed value —
  `getPropertyValue` returns `""` and the tween has no start point. They are also
  declared inline on the element for the same reason.
- **Composition elements have to go where the composition is empty.** The ghost
  numeral was centred first. Measured, its box landed at x 576–864 — exactly
  where the front card and its left neighbour are — so all of it was occluded
  except one stroke showing through a gap, where it read as a stray arc across
  the ground. On a ring that fills the middle, the free space is the outer
  corners.

And two smaller ones: the reflection must mirror the card's **bottom** (an inner
wrapper at the card's full height, anchored to the box's bottom, clipped) and be
flipped about the box's **own centre** — flipping about its top edge moves the box
back on top of the card, because a transform moves the element and not just what
is drawn in it.

## The paper

[`components/ui/SheetTexture.tsx`](components/ui/SheetTexture.tsx) — one
component, in every chapter, carrying two layers.

Editorial layouts leave large areas of ground uncovered by design; that is what
the white space IS. The failure is when uncovered reads as **unused**, which
happens easily on near-achromatic grounds because a flat pale rectangle has
nothing for the eye to rest on. The answer is not more content — it is to give
the paper a texture, the way a heavy stock has one: something you notice when you
look at it and not before.

- **The ruling** — a drawing grid at 88px, 5.5% of the brand green. It is the
  site's own language: sections are numbered sheets, `<Spine />` is the sheet's
  margin, `<SectionHeading />` is its title block. Radially masked, because an
  unmasked grid to the edges reads as a wireframe someone forgot to remove.
- **The blooms** — two soft lights, one brand green and one gold, drifting slowly
  in opposite corners. This is what stops a near-achromatic ground from being
  flat: it gives the paper a direction the light comes from, so empty areas have
  a gradient across them instead of one value.

They are deliberately the same two layers in every chapter. A texture that
changes between sections is decoration; a texture that does not is a **material**
— which is the difference between the site feeling assembled and feeling made of
something.

Two implementation notes that are load-bearing:

- **Radial gradients, not `filter: blur()`.** A blur over half a viewport makes
  the compositor allocate and blur a buffer on every repaint; a gradient is drawn
  once and then only transformed. Same picture, and one of them runs on a phone.
- **It is `absolute`, so every caller must put its content in a positioned
  wrapper.** Positioned elements paint above static ones regardless of DOM order,
  so a static sibling after it disappears underneath. That requirement is why it
  is a component rather than a `::before` on each section — it fails loudly in
  review instead of quietly at a breakpoint nobody screenshotted.

Blurring a busy warm photograph and tinting it neutral is the other reliable way
to manufacture mud, and the Contact form panel hit it: `.glass-bar-dark` over a
restaurant full of pendant lights averaged to a brown-olive smear. That panel is
a **surface** now — near the emerald ground it sits on, with a champagne rim —
so its colour is decided by the palette rather than by whatever was in the shot.

## The spine

[`components/layout/Spine.tsx`](components/layout/Spine.tsx) — a fixed hairline
down the left gutter carrying the current sheet's number and name set vertically,
plus a gold marker riding the document's scroll.

It exists because unifying how sections LOOK is not the same as giving them
something continuous to belong to. Grounds and type were already one system and
the page still read as eight sections in a row; this is the only element aware of
the whole page at once, it is on screen in every section, and it never restarts —
so a section reads as a page of one document.

Deliberately **not** a nav (`pointer-events-none`, no links — the masthead already
navigates), **not** over the hero (it fades in past 55vh, so it never needs the
`data-chrome` dance), and **not** below `lg`, where there is no gutter for it.

Three things it has to get right:

- **Sections are measured in document space and re-measured**, not read per frame.
  Two sections are GSAP-pinned, so the document keeps growing as ScrollTrigger
  installs pin spacers — a table built once on mount is thousands of pixels wrong
  by the time the images have loaded. Reading eight rects inside the scroll
  handler instead would force layout every frame.
- **The active sheet is the one covering the viewport's middle**, not the topmost
  on screen: while a pin is active its spacer and the next section overlap in
  document space, and the topmost test flickers between them at the boundary.
- **A percentage `translateY` resolves against the element's own height.** The
  marker is 12% of the rail, so `translateY(100%)` moves it 12% of the rail and it
  crawls a tenth of the way down the page. Its travel is `(100 − 12) / 12` — about
  733%.

It also carries a soft radial plate behind the label, because two sections run
their content full-bleed through the gutter (the testimonial row and the services
track both start at x=0) and 12px letterspaced type disappears into a photograph.
**That plate has to size against the label, not against its centring parent** —
it was `h-[130%]` on a flex box with `inset-y-0`, which resolved to 130% of the
VIEWPORT and painted a pale column down the left edge of every page.

### It is a thread, not a progress bar

A progress bar answers "how far through am I". A thread with a NODE for every
chapter answers "how far through *what*" — it shows the whole story at once: six
chapters, their relative lengths, which are behind you, which is current, how
much is left. That is the difference between a scroll indicator and a narrative
device, and it is the shape the reference sites use: Eladio Dieste's page hangs
its entire timeline off one unbroken vertical line with a node at each date and
content alternating either side of it.

The node positions are the sections' real document offsets, so the thread is a
true map rather than six evenly spaced dots — chapter 02 is the longest thing on
the page and its gap on the thread is visibly the longest gap.

Mechanics worth keeping: the drawn line is a `scaleY` from the top (a transform,
not a height, so it composites instead of forcing layout), and the reading head
is a separate element because scaling the line would squash it.

### The rule that reaches

`<SectionHeading />`'s gold hairline used to be a 40px stub inside the container's
gutter. From `lg` it runs from the page edge instead (`-ml-16` cancels
`<PageContainer />`'s padding), so it **crosses the thread**. Every chapter's
heading is physically joined to the line running down the page, and the relation
between "this section" and "the document" is something you can see rather than
something you infer from a matching number.

Before changing a section's overflow: `overflow-hidden` clips this at x=0, which
is where it wants to stop, so it is safe. Horizontal padding on a section
*wrapper* rather than on `<PageContainer />` would clip it short.

## Chapters, and why they are renumbered

`<Founder />` and `<WhyUs />` are commented out of `app/page.tsx` at the studio's
request. Both components are intact — nothing was deleted, so restoring either is
a one-line change.

The renumbering that came with it is not bookkeeping. With those two gone the
remaining sheets ran 01, 02, 03, 04, 07, 08, and a document that skips two
numbers is visibly a document with pages torn out. Every `index` on a
`<SectionHeading />`, the list in `<Spine />`, and `NAV_LINKS` (which lost the
"Why Us" entry, or it would scroll nowhere) now agree on 01–06.

**If a section is added or removed, three things have to move together:** the
section's own `index`, the `SHEETS` list in `<Spine />`, and its step on the arc
— including the two neighbours' gradients, which are what hide the seams.

## Where this lives in code

- Tokens: `styles/globals.css` (`@theme` block).
- Font loading: `app/layout.tsx`.
- Reusable color-dependent utilities: `.surface-sage`, `.surface-sage-deep`, `.overlay-paper` in `styles/globals.css`.

If you (re)supply an updated brand swatch or logo file, resample it and update
the token block above — that single edit propagates everywhere.
