# Images — what to supply, and where it goes

Every photograph on the site is currently a **stock placeholder**. This file is
the drop-in list: put a file at the path below, and it appears in that slot.

Nothing else needs changing except the one `image:` line per entry in
`constants/content.ts` — the paths below are what those lines should point at.

---

## 1. Hero — 4 projects, in this order

The opening screen cross-dissolves through these four. Landscape, ideally
2560px wide. These are the studio's four showcase projects from the review.

| Order | Project | Path | Status |
|---|---|---|---|
| 1 | AWC | `/public/images/hero/AWC.jpg` | **supplied** |
| 2 | Cha and Co | `/public/images/hero/chaandco.jpg` | **supplied** |
| 3 | Kapali Mall | `/public/images/hero/kapalimall.jpg` | **supplied** |
| 4 | Sobha Residence | `/public/images/hero/shobharesidency.jpg` | **supplied** |

All four are in place and live on the site.

**These are the first thing anyone sees, so they carry the most weight.** Pick
the widest, best-lit frame of each. Avoid anything with legible third-party
branding in shot — the current placeholder has a red logo on a screen in it,
which is exactly the sort of thing that undercuts the opening.

---

## 2. Selected Works — 9 projects, in this order

Shown in the pinned horizontal gallery. Landscape or 4:5 portrait, 2000px on
the long edge.

| # | Project | Path | Status |
|---|---|---|---|
| 01 | AWC | reuses `/images/hero/AWC.jpg` | **supplied** |
| 02 | Cha and Co | reuses `/images/hero/chaandco.jpg` | **supplied** |
| 03 | Kapali Mall Food Court | reuses `/images/hero/kapalimall.jpg` | **supplied** |
| 04 | Hero Vadodra | `/public/images/projects/hero-vadodra.jpg` | STOCK PLACEHOLDER |
| 05 | Kyukotoh Gurugram | `/public/images/projects/kyukotoh.jpg` | STOCK PLACEHOLDER |
| 06 | Polo Elevator | `/public/images/projects/polo-elevator.jpg` | STOCK PLACEHOLDER |
| 07 | Sobha Villa Interior | reuses `/images/hero/shobharesidency.jpg` | **supplied** |
| 08 | Westerlies Residence | `/public/images/projects/westerlies-residence.jpg` | STOCK PLACEHOLDER |
| 09 | Satish Residence | `/public/images/projects/satish-residence.jpg` | STOCK PLACEHOLDER |

Four of nine now carry the studio's own photography. **The five marked STOCK
PLACEHOLDER are not the studio's work** and should be replaced before launch.
A different frame for the Projects panel than the hero one is welcome for the
four already supplied — right now each is used twice.

### Also needed per project (currently blank on the site)

Location, area and year are **deliberately left empty** rather than invented —
a wrong area on a real commission is worse than an obvious gap, so the meta row
simply does not render until there is something to put in it. Send them as:

```
AWC — Gurugram, Haryana — 12,000 sq ft — 2023
```

A one-or-two sentence description per project would also be used, in the panel
that opens on hover.

---

## 3. Services — 5 discipline cards

One representative image each. Portrait 4:5 works best in this track.

| # | Discipline | Path |
|---|---|---|
| 01 | Architecture | `/public/images/services/architecture.jpg` |
| 02 | Commercial Interiors | `/public/images/services/commercial-interiors.jpg` |
| 03 | Boutique Interiors | `/public/images/services/boutique-interiors.jpg` |
| 04 | Vastu | `/public/images/services/vastu.jpg` |
| 05 | Architectural Photography | `/public/images/services/photography.jpg` |

---

## 4. Architectural Photography page — 8–12 frames

The portfolio grid on `/photography`, with a lightbox. Mixed orientations are
wanted: the grid is deliberately irregular (portrait pairs, one full-width
panorama), which is what makes it read as a picture edit rather than a
contact sheet.

```
/public/images/photography/01.jpg … 12.jpg
```

Captions are optional; if supplied they appear under each frame.

**Still needed for this page:** a short biography for Ar. Divyank Sirohi.
There is currently none, and nothing has been invented in its place — no
awards, no client list, no years of experience.

---

## 5. Founder portrait

Already in place at `/public/images/founder/annapurna.jpg`. Replace only if
there is a newer frame.

---

## Format notes

- **JPEG** is fine; Next.js converts to AVIF/WebP automatically on request.
- Long edge **2000–2560px**. Larger is wasted; smaller goes soft on a retina
  display.
- Do not pre-crop to a square or add borders — the site crops per slot.
- Do not add watermarks or logo bugs.
- Colour: no need to grade them. Send them as shot.
