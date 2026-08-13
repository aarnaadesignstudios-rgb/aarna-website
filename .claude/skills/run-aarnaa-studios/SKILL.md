---
name: run-aarnaa-studios
description: Run, build, start, screenshot, smoke-test and drive the Aarnaa Studios Next.js site. Use when asked to launch or start the app or dev server, take a screenshot of a page or section, verify a UI change in the real app, drive scroll/hover/click interactions, capture the loading intro, or check a production build.
---

# Run Aarnaa Studios

Next.js 15 (App Router) + React 19 + Tailwind v4, with Lenis smooth scroll, GSAP
ScrollTrigger pinning and framer-motion. Routes: `/`, `/faq`, `/photography`.

The site is driven by **`.claude/skills/run-aarnaa-studios/driver.mjs`** —
puppeteer-core against the locally installed Chrome. There is no `chromium-cli`
on this Windows machine and puppeteer-core ships no browser, so the driver
locates Chrome itself.

All paths below are relative to the repo root (`D:\projects\aarnaa-studios-2`).

## Prerequisites

Node 23.10.0 / npm 10.9.2. Chrome at
`C:/Program Files/Google/Chrome/Application/chrome.exe` (override with
`CHROME_PATH`). Then:

```bash
npm install
npm i -D puppeteer-core      # already in devDependencies; the driver needs it
```

The driver **must** be invoked from the repo root so Node resolves
`puppeteer-core` from local `node_modules`.

## Run (agent path)

Start the dev server, then drive it. Screenshots land in `.screenshots/`
(gitignored).

```bash
npm run dev                  # port 3000
node .claude/skills/run-aarnaa-studios/driver.mjs smoke
```

`smoke` checks and screenshots all three routes and exits non-zero on any
console error, 4xx/5xx response, or unresolved font token. Verified output ends
`SMOKE PASS`.

Individual commands:

```bash
# diagnostics: title, first heading, font tokens, console errors, failed requests
node .claude/skills/run-aarnaa-studios/driver.mjs check /
node .claude/skills/run-aarnaa-studios/driver.mjs check faq --port 3100

# screenshot after the intro clears
node .claude/skills/run-aarnaa-studios/driver.mjs shot /
node .claude/skills/run-aarnaa-studios/driver.mjs shot photography --vw 390 --vh 844

# scroll (absolute px, or a selector — Lenis-safe, pin-aware)
node .claude/skills/run-aarnaa-studios/driver.mjs scroll / --to 2400
node .claude/skills/run-aarnaa-studios/driver.mjs scroll / --to "#services"

# hover: hover one element, measure the one that actually changes
node .claude/skills/run-aarnaa-studios/driver.mjs hover / \
  --sel 'nav a[href="#services"]' --measure 'nav span.rounded-full'

# click: reports the aria-expanded transition
node .claude/skills/run-aarnaa-studios/driver.mjs click faq --sel 'button[aria-expanded]'

# the intro, sampled at 400/1200/2000/2950/4000ms
node .claude/skills/run-aarnaa-studios/driver.mjs intro
```

Options: `--port` (3000) · `--out <file>` · `--vw`/`--vh` (1440x900) ·
`--nth <n>` (default: first *visible* match) · `--wait <ms>` · `--full` ·
`--headful`.

Section anchors for `--to`: `#hero` `#practice` `#projects` `#testimonials`
`#process` `#founder` `#why-us` `#services` `#contact`.

**Always open the PNG afterwards.** A path on disk is not evidence; every trap
below produces a plausible-looking file.

## Build and test

```bash
npm run typecheck            # tsc --noEmit — clean
npm run lint                 # clean (warns that `next lint` dies in Next 16)
npm run build                # 33s, all 7 pages static-prerendered
npm run start                # serves the build on 3000
```

There is no test suite — the driver is the only end-to-end check.

### Production build without stopping dev

`next dev` and `next build` both own `.next`, and whichever ran last wins.
`next.config.ts` exposes `distDir` for exactly this, and it works — verified
with both servers up at once:

```bash
NEXT_DIST_DIR=.next-prod npm run build
NEXT_DIST_DIR=.next-prod npx next start -p 3100
node .claude/skills/run-aarnaa-studios/driver.mjs check --port 3100
```

Prefer this over killing the dev server.

**It dirties `tsconfig.json`.** `next build` rewrites that file on every run: it
reformats every array onto separate lines and, under `NEXT_DIST_DIR`, appends
`.next-prod/types/**/*.ts` to `include`. Harmless but noisy in a diff —
`git checkout -- tsconfig.json` afterwards if you are not committing it.

## Gotchas

Each of these was hit this session, and each produces a **convincing false
negative** — the metric reads zero and looks like broken code.

- **A "completed" background task does not mean the server stopped.** Launching
  `npm run dev` backgrounded reported exit 0 while PID 10696 still held port
  3000. Trust `netstat`, never the task status:
  ```bash
  netstat -ano | grep -E ":300[0-5] " | grep LISTENING
  ```
- **Git Bash rewrites a bare `/` argument.** `driver.mjs check /` arrives as
  `C:/Program Files/Git/` and puppeteer fails with the useless "Cannot navigate
  to invalid URL". The driver detects and corrects this; if you write your own
  script, use `MSYS_NO_PATHCONV=1` or pass `faq` without the slash.
- **`window.scrollTo` does not work.** Lenis re-applies its own `animatedScroll`
  every RAF frame, undoing it within ~16ms. Its instance is module-local in
  `lib/SmoothScrollProvider.tsx` and never reaches `window`, so you cannot call
  the app's `smoothScrollTo` either. Real wheel events are the only input it
  honours.
- **Scroll targets computed in advance are stale on arrival.** Services and
  SelectedWorks are GSAP-pinned, so document offsets shift while you travel.
  Scrolling to a precomputed `rect.top + scrollY` left the Services rows at
  y=962 in a 900px viewport — just off the bottom, where `elementFromPoint`
  returns null and clicks hit nothing. Re-measure every pass (the driver does).
- **The Services track scrolls sideways off vertical scroll.** Centring a row
  vertically carried its first card to **x = -938**: laid out, visible in the
  DOM, unreachable by mouse. The driver probes reachability and falls back to a
  native `el.click()`, printing which path it used.
- **React ignores synthetic pointer events but honours a native `click()`.**
  `dispatchEvent(new PointerEvent("pointerover"))` never fires
  `onPointerEnter`, so hover *must* go through CDP mouse input with coordinates
  read in the same tick. `el.click()`, by contrast, drives the real handler —
  which is why it is a legitimate click fallback and not a cheat.
- **Selectors match invisible elements first.** `button[aria-expanded]` hits the
  navbar's `display:none` mobile toggle before any accordion row; it measures
  `0x0` at `0,0`, indistinguishable from "nothing animated". The driver picks
  the first *visible* match — use `--nth` to override.
- **Measure the element that moves, not the one you touched.** The navbar
  indicator is a framer `layoutId` pill that translates between links and is
  conditionally rendered, so it goes absent → present on first hover. A
  height-delta check on the hovered link reports zero. Hence `--measure`.
- **`--full` produces 4,248px of pure blank.** A full-page capture is
  1440x14876 and `fullPage` does not replay scroll, so the pinned sections
  render once and leave dead bands (measured: stdev 0.0 from y3186 to y7434).
  Use `scroll --to <anchor>` and viewport-sized shots instead.
- **The home page has no `<h1>`.** The hero is a full-bleed photograph with an
  eyebrow + project name; the first heading is an `<h2>`. Probing `h1` alone
  reports "(none)" on a page rendering perfectly. Only `/photography` has an
  `<h1>`.
- **The intro runs to 2.95s, not ~1.9s.** `constants/site.ts`: `CUE.dissolve`
  2.05s + `DISSOLVE_DURATION` 0.9s, plus `INTRO.revealWaitCapMs` 800ms while the
  hero photograph is still loading — 3.75s worst case. The driver waits 4000ms.
  Screenshot earlier and you photograph the loading screen.
- **If you measure screenshots with sharp, materialise the crop.**
  `.extract().stats()` silently ignores the crop and returns whole-image stats —
  it reported an identical stdev of 80.6 for 14 different bands. Chain
  `.extract(...).png().toBuffer()` and re-open the buffer.

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `Cannot navigate to invalid URL` | Git Bash mangled `/`. Drop the slash (`check faq`) or prefix `MSYS_NO_PATHCONV=1`. |
| `EADDRINUSE`, or curl hits stale content | Orphaned server. `pkill -f "next dev"` does **not** work here (Windows process names) — kill by PID: `for PID in $(netstat -ano \| grep -E ":300[0-5] " \| grep LISTENING \| awk '{print $NF}' \| sort -u); do taskkill //F //PID $PID; done` |
| `--font-serif` empty in `check` output | Corrupted `.next` (a dev server wrote to it during a build). Kill listeners, `rm -rf .next`, rebuild. The page still renders and every asset still returns 200 — only the typeface is wrong, so this check is the fastest way to spot it. *(Not reproduced this session; the check is the detector.)* |
| `ChunkLoadError` / 500s under `next start` | `next dev` overwrote `.next`. Use the `NEXT_DIST_DIR=.next-prod` path above. |
| `Could not find a production build` | Same collision, opposite order. Rebuild with `NEXT_DIST_DIR` set. |
| `NO CHANGE (interaction may not have fired)` | Usually a measurement problem, not a code one — re-read the Gotchas. Check you measured the element that actually moves, and that the driver reported a visible match. |
| `matched only hidden elements` | Selector resolved to `display:none` nodes. Scope it (`#services button[...]`) or pass `--nth`. |
| `warn: <sel> did not settle near viewport centre` | Often benign — check the PNG first. A full-height section at the end of the document cannot reach centre because the page bottoms out (`--to "#contact"` warns and still frames Contact correctly). It is only a real problem inside a pinned track, where `click` then falls back to `el.click()`. |
| `No Chrome found` | Set `CHROME_PATH=/path/to/chrome.exe`. |
| `Cannot find module 'puppeteer-core'` | Run the driver from the repo root, not from the skill directory. |
