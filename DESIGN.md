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
| `--color-gold-ink` | `#7c6413` | `text-gold-ink` | **Gold that is legible as TYPE on a light ground** — the same hue and saturation as `--color-gold` at 40% lightness. `--color-gold` is ~2:1 against paper: correct for hairlines, marks and glows, unreadable as small or running type. Use this for any gold *text* (the Contact heading, labels, the spine, the mobile index numerals). |
| `--color-charcoal` | `#1c1b18` | `text-charcoal` | Ink — default body text. |
| `--color-paper` | `#f5f8f3` | `bg-paper` | Brightest ground — Practice. |
| `--color-mist` | `#eaf0e6` | `bg-mist` | **The default ground** — `<body>`, Process, Services, Contact, /faq. |
| `--color-sage` | `#dbe4d5` | `bg-sage` | Plinth — Testimonials, Founder, the mobile index, the intro screen. |
| `--color-sage-deep` | `#c9d5c2` | `bg-sage-deep` | Deepest ground — the figures strip under the hero. |
| `--color-stone` | `#dcdccc` | `bg-stone` | The one warm-olive ground (Why Us), and the colour behind an image while it decodes. |
| `--color-cream` | `#f6f2e9` | `text-cream` | **Type over photography, not a ground.** The hero caption, the masthead over the hero, the Works title and index over the cyclorama's floor, the chapter card. It was the page background too; see the light-only rule below for why those two jobs split. |
| `--color-ink` | `#0a0a09` | `bg-ink` | True neutral with the faintest warm cast. **Scrims and overlays over photography only** — never a section ground. A scrim exists to darken, not to colour: every scrim on this site used to be built from `--color-emerald-deep`, which tinted the photograph underneath it green. |

**Usage rules**

- **Green and gold must always resolve to the exact hex above, everywhere on the site** — navbar, headings, buttons, borders, glows, shadows, overlays, `<meta theme-color>`. If a value needs alpha (a tint, a glow, a scrim), build it from the token with `color-mix(in srgb, var(--color-emerald-deep) 75%, transparent)` (see `.surface-sage` / `.overlay-paper` in `globals.css` for the pattern) rather than re-typing an `rgba()` triplet.
- Don't reach for Tailwind's stock `green-*` / `emerald-*` / `amber-*` / `yellow-*` numbered scales — they aren't the brand color and will drift the moment anyone eyeballs a shade.
- To change the brand green or gold in the future, edit the token in `styles/globals.css` **once** — everything using the Tailwind utilities or `var()` picks it up automatically.

**The site is LIGHT throughout. There is no dark mode and no dark section.**

This is a hard rule, and it replaced the opposite one. The page used to alternate:
cream → near-black emerald slab → cream → near-black emerald slab, four times on
the way down (the figures strip, Testimonials, Founder, and Contact under a green
wash), plus a dark green intro screen, a dark mobile index and a dark chapter
card. Each of those made a defensible local argument — "a dark plinth between two
light sections" — and together they made the green sections look imported from
another site, because they shared no ground with anything around them.

So the green stays and its VALUE changes. Five light surfaces, and the darkest is
13% below the lightest — see the table above for which is which.

### The correction to the correction

Taking the green out of the grounds fixed the jump and lost the brand. The next
note back was exactly that: *more green, and the whole site should feel like one
experience.* Both of those are the same problem as before, seen from the other
side — five warm off-whites with green type on them is a beige site with a green
logo, and eight sections that merely share a type system still read as eight
sections.

Three things answer it, and none of them brings back a dark band:

1. **The grounds are green.** Every light surface is now a desaturated cut of the
   brand hue (84–100°, 12–22% saturation) instead of a warm off-white. The green
   went from being four bands to being the paper itself, so it is continuous
   rather than intermittent — which is also most of why the sections stopped
   looking like separate documents. Gold is the only warm thing left, and now has
   a cool ground to be warm against.
2. **The plinths dissolve.** `.surface-sage` opens and closes on `mist`, the
   ground of whatever sits either side of it, and the `border-y` hairlines are
   gone. A hairline announces that a new document starts here; with the ends
   faded there is no boundary to see, the page just deepens in colour for a while
   and comes back.
3. **The spine.** A fixed rail down the left gutter carrying the current sheet's
   number and name and a gold scroll marker — the one element aware of the whole
   page at once. See its own section below.

Green now carries the site through the GROUNDS, the type, the hairlines, and two
large green fields (the Works cyclorama and the Contact room). The only dark
areas are the two full-bleed photographic heroes, which are dark because a
photograph is dark, not because a section is.

### Where large green fields are allowed

`.stage-cyclorama` and `.overlay-paper` both put brand green across a whole
frame, and both keep the MIDDLE light. That is the rule that separates them from
the dark slabs this all started with: green owns the frame, the centre of the
frame stays paper, and photographs sit **on** the green rather than under it.

The one consequence worth knowing: where a green field is dense enough
(the cyclorama's floor, the Contact room's edges) type on it has to be `cream`
and `gold-soft`, not `emerald`. Selected Works therefore carries two ink schemes
in one section — charcoal and gold at the top where the sweep is still paper,
cream below the horizon. That is not an inconsistency; it is what a lit sweep is.

Consequences to keep in mind when adding anything:

- Gold TYPE must be `--color-gold-ink`, not `--color-gold`. See the table.
- `tone="dark"` on `<SectionHeading />` and `tone="dark"` on
  `<InfiniteMovingCards />` have no callers on either page. They are kept for a
  band that sits over photography; don't reach for them for a section ground.
- `data-chrome="dark"` (the attribute the masthead reads to flip its own
  palette) now has exactly two callers, both photographic heroes. Adding a third
  means you have added a dark band — which is the thing this rule forbids.
- `<meta theme-color>` is `--color-cream`, matching `<body>`. It was the brand
  emerald, which put a near-black green bar above a light page on mobile.

### Surfaces

- `.surface-sage` — the dimensional green plinth: radial gold glow off the top edge, a tonal gradient down the band, an edge vignette. Use it for any large green block (Testimonials, Founder, the mobile index, the intro screen) rather than a flat `bg-sage` fill — a flat rectangle between two other flat rectangles is the "pasted in" problem in a lighter costume. The amplitudes inside it are far smaller than the old dark version's, because at this value a 4% shift is as visible as a 20% shift was on near-black.
- `.surface-sage-deep` — the same material one step down, for the figures strip that carries the hero's imagery.
- `.overlay-paper` — graded paper veil for setting type over a photograph on a light page (Contact), closed with a green edge and a floor. Heaviest under the heading, thinning across the frame, so the image stays legibly an image. The enquiry form gets its own glass panel rather than more veil — it is high-frequency DETAIL, not brightness, that makes 12px labels unreadable on a photograph, and thickening the veil is how this section became a white rectangle twice.
- `.stage-cyclorama` — the lit green sweep Selected Works stands its ring on: sweep, floor, key light and horizon in four layers. **It must be on the PINNED element, not the section** — the section is as tall as the whole scroll the pin consumes, so a gradient there is stretched over five screens and only its palest top is ever visible.
- `.ring-floor` / `.ring-reflect` — the ring's footprint disc and the mirrored copy under each card. See the Selected Works section below.
- `.ring-stage` / `.ring-3d` / `.ring-face` — the three properties CSS has and Tailwind does not that make the Selected Works cylinder work: `perspective` on the stage, `preserve-3d` + `rotateY` on the ring, and the per-face swing out to the radius. Read the note in `globals.css` before touching the transform order on `.ring-face`; it is not interchangeable.

Both `.surface-emerald` and `.overlay-emerald` are **gone**. They were the dark
green panel and the dark green photo wash; see the light-only rule above.

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
track both start at x=0) and 12px letterspaced type at 55% charcoal disappears
into a photograph.

## Where this lives in code

- Tokens: `styles/globals.css` (`@theme` block).
- Font loading: `app/layout.tsx`.
- Reusable color-dependent utilities: `.surface-sage`, `.surface-sage-deep`, `.overlay-paper` in `styles/globals.css`.

If you (re)supply an updated brand swatch or logo file, resample it and update
the token block above — that single edit propagates everywhere.
