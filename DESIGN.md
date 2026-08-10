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
| `--color-emerald-light` | `#13573e` | `bg-emerald-light` | Lifted emerald for the top of gradients / highlights on dark surfaces. |
| `--color-emerald-deep` | `#06291c` | `bg-emerald-deep` | Near-black pine. Tonal depth in gradients, dark overlays/scrims, deep shadow tints. |
| `--color-gold` | `#c9a932` | `bg-gold` / `text-gold` / `border-gold` | Primary brand gold — sampled pixel-exact from the logo mark/wordmark (`hsl(47.3 60.2% 49.2%)`, the most common gold pixel in the PNG). Accents, CTAs, hover states, dividers. |
| `--color-gold-soft` | `#dac36c` | `text-gold-soft` | Champagne gold — the same hue/saturation lifted to 64% lightness. Subtle glows, secondary accent text on dark. |
| `--color-cream` | `#f6f2e9` | `bg-cream` / `text-cream` | Light surface — page background, text on dark surfaces. |
| `--color-charcoal` | `#1c1b18` | `bg-charcoal` / `text-charcoal` | Ink — default body text, dark surfaces (e.g. footer). |
| `--color-stone` | `#e4ddd0` | `bg-stone` | Alternate light surface, for subtle section-to-section contrast. |

**Usage rules**

- **Green and gold must always resolve to the exact hex above, everywhere on the site** — navbar, headings, buttons, borders, glows, shadows, overlays, `<meta theme-color>`. If a value needs alpha (a tint, a glow, a scrim), build it from the token with `color-mix(in srgb, var(--color-emerald-deep) 75%, transparent)` (see `.surface-emerald` / `.overlay-emerald` in `globals.css` for the pattern) rather than re-typing an `rgba()` triplet.
- Don't reach for Tailwind's stock `green-*` / `emerald-*` / `amber-*` / `yellow-*` numbered scales — they aren't the brand color and will drift the moment anyone eyeballs a shade.
- To change the brand green or gold in the future, edit the token in `styles/globals.css` **once** — everything using the Tailwind utilities or `var()` picks it up automatically.

### Surfaces

- `.surface-emerald` — the rich, dimensional emerald panel treatment (radial gold glow + tonal gradient + edge vignette). Use for any large opaque green block (hero panels, section backgrounds), never a flat `bg-emerald` fill on its own for large areas.
- `.overlay-emerald` — translucent emerald tint for scrimming imagery.

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
| A section > 0.6 viewport heights away | **Chapter card** — an emerald panel wipes in from the direction of travel, names the destination (`02 · Why Us`) in the site's own section grammar, and lifts away with it already in place. The scroll happens instantly, unseen. |
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
- `html`/`body` use `overflow-x: clip`, **not** `hidden`. `hidden` on one axis
  makes the other compute to `auto`, which turned `<body>` into a scroll
  container nested inside Lenis's own — the source of scroll judder, and of
  `position: sticky` resolving against the wrong box.

Arriving hash navigations (`/#contact`, back/forward, an edited URL) are
completed by [`lib/SmoothScrollProvider.tsx`](lib/SmoothScrollProvider.tsx).

## Where this lives in code

- Tokens: `styles/globals.css` (`@theme` block).
- Font loading: `app/layout.tsx`.
- Reusable color-dependent utilities: `.surface-emerald`, `.overlay-emerald` in `styles/globals.css`.

If you (re)supply an updated brand swatch or logo file, resample it and update
the token block above — that single edit propagates everywhere.
