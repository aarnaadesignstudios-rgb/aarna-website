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

Four typefaces, each with one job. Families are loaded via `next/font/google` in
[`app/layout.tsx`](app/layout.tsx) and exposed as CSS variables consumed in
`styles/globals.css`.

| Token | Family | Weights | Role |
|---|---|---|---|
| `--font-serif` | Cormorant Garamond | 400, 500, 600 | Section headings (`h1`–`h4`). Elegant editorial serif — the studio's primary display voice. |
| `--font-display` | Bodoni Moda | 500, 600, 700 (+ italic) | Reserved for the hero statement only. High-contrast thin/thick strokes read as couture/editorial luxury; the italic is used for the single flipping/emphasis word. |
| `--font-sans` | Inter | default | Body copy, UI text, navigation. Modern, quiet, gets out of the way. |
| `--font-mono` | JetBrains Mono | 400 | "Spec-sheet" labels only — areas, years, index numbers, meta text (e.g. "Est. 2008", "01 — The Practice"). An architectural-drawing cue; never used for prose. |

**Usage rules**

- `h1`–`h4` default to `--font-serif` at weight 400 with tight tracking (`-0.01em`) — set globally in `globals.css`, don't override per-component unless it's the hero statement (`--font-display`).
- Body text stays on `--font-sans`; don't mix serif into paragraphs.
- `--font-mono` is for short, uppercase, letter-spaced technical labels — not general emphasis.

## Where this lives in code

- Tokens: `styles/globals.css` (`@theme` block).
- Font loading: `app/layout.tsx`.
- Reusable color-dependent utilities: `.surface-emerald`, `.overlay-emerald` in `styles/globals.css`.

If you (re)supply an updated brand swatch or logo file, resample it and update
the token block above — that single edit propagates everywhere.
