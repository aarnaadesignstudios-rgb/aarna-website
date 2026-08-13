#!/usr/bin/env node
/**
 * driver.mjs — programmatic handle on the running Aarnaa Studios site.
 *
 * This site defeats the obvious ways of driving a page. Every awkward-looking
 * thing in here is load-bearing, and each one is a bug that already bit:
 *
 *   - Lenis owns the scroll position. Its instance is module-local in
 *     lib/SmoothScrollProvider.tsx and never reaches `window`, so a driver
 *     cannot call the app's own smoothScrollTo. Lenis also re-applies its
 *     animatedScroll every RAF frame, so window.scrollTo() is undone within
 *     ~16ms. Real wheel events are the only input it honours.
 *   - Services and SelectedWorks are GSAP-PINNED, so document offsets shift
 *     while you scroll. A target computed from a rect sampled beforehand is
 *     stale on arrival. Everything here re-measures each pass.
 *   - The pinned Services track scrolls HORIZONTALLY off vertical scroll, so
 *     an element can sit at x = -938: on-page, laid out, and unreachable by
 *     mouse.
 *   - React ignores synthetic PointerEvents, so hover must use CDP mouse
 *     input. It does honour a native el.click(), which is the click fallback.
 *   - Selectors match invisible elements first: `button[aria-expanded]` hits
 *     the navbar's display:none mobile toggle before any real accordion row.
 *
 * Usage:
 *   node .claude/skills/run-aarnaa-studios/driver.mjs <command> [route] [opts]
 *
 * Commands:
 *   check   [route]                  console errors, failed requests, font tokens
 *   shot    [route]                  screenshot after the intro clears
 *   scroll  [route] --to <px|sel>    Lenis-safe scroll, then screenshot
 *   hover   [route] --sel <s>        real-mouse hover; --measure <s> for the
 *                                    element that actually changes
 *   click   [route] --sel <s>        click; reports aria-expanded transition
 *   intro                            capture the intro at 5 timestamps
 *   smoke                            all routes: check + shot. Exit 1 on error.
 *
 * Options:
 *   --port <n>    default 3000
 *   --out <file>  screenshot path (default .screenshots/<auto>.png)
 *   --vw/--vh <n> viewport, default 1440x900
 *   --nth <n>     pick the nth match instead of the first VISIBLE one
 *   --wait <ms>   extra settle time after the intro
 *   --full        full-page screenshot (breaks pinned sections — see SKILL.md)
 *   --headful     show the browser
 */

import puppeteer from "puppeteer-core";
import { mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

// ── Chrome discovery ────────────────────────────────────────────────────────
// puppeteer-core ships no browser of its own.
const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

function findChrome() {
  const hit = CHROME_CANDIDATES.find((p) => existsSync(p));
  if (!hit) {
    console.error(
      "No Chrome found. Set CHROME_PATH=/path/to/chrome.\nTried:\n  " +
        CHROME_CANDIDATES.join("\n  ")
    );
    process.exit(1);
  }
  return hit;
}

// ── Timing ──────────────────────────────────────────────────────────────────
// constants/site.ts: CUE.dissolve 2.05s + DISSOLVE_DURATION 0.9s = 2.95s
// nominal, plus INTRO.revealWaitCapMs 800 when the hero photo is still in
// flight. 4000 clears the worst case. Keep in sync if INTRO moves.
const INTRO_CLEARED_MS = 2950;
const INTRO_WORST_CASE_MS = 4000;

// ── Args ────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const cmd = argv[0];

// Flags that consume the following token. Without this list a naive
// "anything not starting with --" filter treats the VALUE as a positional:
// `check --port 3000` parsed the route as "/3000" and every request 404'd.
const VALUE_FLAGS = new Set([
  "port", "out", "vw", "vh", "wait", "nth", "to", "sel", "measure",
]);

const flags = {};
const positional = [];
for (let i = 1; i < argv.length; i++) {
  const tok = argv[i];
  if (tok.startsWith("--")) {
    const name = tok.slice(2);
    if (VALUE_FLAGS.has(name) && argv[i + 1] !== undefined && !argv[i + 1].startsWith("--")) {
      flags[name] = argv[++i];
    } else {
      flags[name] = true;
    }
  } else {
    positional.push(tok);
  }
}

function flag(name, fallback = undefined) {
  return name in flags ? flags[name] : fallback;
}

/**
 * Git Bash (MSYS) rewrites a bare `/` argument into the MSYS install root
 * before node sees it, so `driver.mjs check /` arrives as `C:/Program
 * Files/Git/` and puppeteer rejects the URL with "Cannot navigate to invalid
 * URL". Detect the mangled form and accept bare names (`faq`) too.
 */
function normalizeRoute(r) {
  if (!r) return "/";
  if (/Program Files[\\/]Git/i.test(r) || /^[A-Za-z]:[\\/]/.test(r)) return "/";
  return r.startsWith("/") ? r : `/${r}`;
}

const PORT = Number(flag("port", 3000));
const VW = Number(flag("vw", 1440));
const VH = Number(flag("vh", 900));
const EXTRA_WAIT = Number(flag("wait", 0));
const NTH = flag("nth") === undefined ? null : Number(flag("nth"));
const FULL = Boolean(flag("full", false));
const HEADFUL = Boolean(flag("headful", false));
const BASE = `http://localhost:${PORT}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function outPath(name) {
  const p = resolve(String(flag("out", `.screenshots/${name}.png`)));
  mkdirSync(dirname(p), { recursive: true });
  return p;
}
const slug = (s) => String(s).replace(/[^\w]/g, "_").slice(0, 48);

// ── Session ─────────────────────────────────────────────────────────────────
async function open(route = "/") {
  const browser = await puppeteer.launch({
    executablePath: findChrome(),
    headless: !HEADFUL,
    args: ["--no-sandbox", "--disable-dev-shm-usage", `--window-size=${VW},${VH}`],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: VW, height: VH });

  const errors = [];
  const failed = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}`));
  // This listener is what originally surfaced the stale-server 404s behind the
  // corrupted-.next bug; keep it even when you only want a screenshot.
  page.on("response", (r) => {
    if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
  });

  const res = await page.goto(`${BASE}${route}`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  if (!res || res.status() >= 400) {
    throw new Error(`${route} returned ${res ? res.status() : "no response"}`);
  }
  return { browser, page, errors, failed };
}

async function afterIntro(page, extra = EXTRA_WAIT) {
  await sleep(INTRO_WORST_CASE_MS);
  // LoadingScreen carries no data attribute, so key off the classes it renders
  // (components/sections/LoadingScreen.tsx). Best-effort — the fixed wait above
  // has already covered the worst case.
  await page
    .waitForFunction(
      () => !document.querySelector(".surface-emerald.fixed.inset-0"),
      { timeout: 2000 }
    )
    .catch(() => {});
  if (extra) await sleep(extra);
}

/**
 * Font tokens resolving to empty is the tell-tale of a corrupted .next: the
 * page renders, every asset returns 200, and only the typeface is wrong.
 */
async function fontTokens(page) {
  return page.evaluate(() => {
    const s = getComputedStyle(document.documentElement);
    return {
      serif: s.getPropertyValue("--font-serif").trim(),
      bodyFont: getComputedStyle(document.body).fontFamily,
    };
  });
}

// ── Target resolution ───────────────────────────────────────────────────────
/**
 * Index of the first VISIBLE match, because selectors hit hidden elements
 * first here: `button[aria-expanded]` matches the navbar's display:none mobile
 * toggle before any real accordion row, and that element measures 0x0 at 0,0 —
 * indistinguishable from "the interaction never ran".
 */
async function resolveTarget(page, sel, nth = NTH) {
  const idx = await page.evaluate(
    ({ s, n }) => {
      const els = [...document.querySelectorAll(s)];
      if (!els.length) return -2;
      if (n !== null) return n < els.length ? n : -3;
      const i = els.findIndex((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && getComputedStyle(el).display !== "none";
      });
      return i === -1 ? -1 : i;
    },
    { s: sel, n: nth }
  );
  if (idx === -2) throw new Error(`selector not found: ${sel}`);
  if (idx === -3) throw new Error(`--nth ${nth} out of range for ${sel}`);
  if (idx === -1) throw new Error(`${sel} matched only hidden elements (0x0 / display:none)`);
  return idx;
}

/** Rect of the nth match, plus isConnected — a detached node reports all zeros. */
const RECT_AT = ({ s, i }) => {
  const el = document.querySelectorAll(s)[i];
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    x: Math.round(r.x),
    y: Math.round(r.y),
    w: Math.round(r.width),
    h: Math.round(r.height),
    connected: el.isConnected,
  };
};
const rectAt = (page, sel, i) => page.evaluate(RECT_AT, { s: sel, i });
const fmt = (r) => (r ? `x${r.x} y${r.y} ${r.w}x${r.h}` : "(absent)");

// ── Lenis-safe scrolling ────────────────────────────────────────────────────
/**
 * Scroll with real wheel events. `window.scrollTo` does not survive: Lenis
 * writes its animatedScroll back on the next RAF tick.
 *
 * For a selector we converge on "element near viewport centre", RE-MEASURING
 * each pass. Sampling `rect.top + scrollY` once and scrolling to that number
 * put the Services rows at y=962 in a 900px viewport — just off the bottom,
 * where elementFromPoint returns null and clicks silently hit nothing —
 * because the pinned section moves the document underneath you as you travel.
 */
async function lenisScrollTo(page, target, idx = 0) {
  await page.mouse.move(VW / 2, VH / 2);

  if (typeof target === "number") {
    for (let i = 0; i < 60; i++) {
      const cur = await page.evaluate(() => window.scrollY);
      const delta = target - cur;
      if (Math.abs(delta) < 12) break;
      // Clamp to approach rather than overshoot and oscillate.
      await page.mouse.wheel({ deltaY: Math.max(-900, Math.min(900, delta)) });
      await sleep(90);
    }
  } else {
    let settled = false;
    for (let i = 0; i < 60; i++) {
      const r = await page.evaluate(
        ({ s, n }) => {
          const el = document.querySelectorAll(s)[n];
          if (!el) return null;
          const b = el.getBoundingClientRect();
          return { centre: b.top + b.height / 2, vh: window.innerHeight };
        },
        { s: target, n: idx }
      );
      if (r === null) throw new Error(`selector vanished: ${target}`);
      const delta = r.centre - r.vh / 2;
      if (Math.abs(delta) < 24) {
        settled = true;
        break;
      }
      await page.mouse.wheel({ deltaY: Math.max(-900, Math.min(900, delta)) });
      await sleep(110);
    }
    if (!settled) console.error(`  warn: ${target} did not settle near viewport centre`);
  }

  // Let Lenis's easing come to rest before measuring or capturing.
  let last = -1;
  for (let i = 0; i < 40; i++) {
    const y = await page.evaluate(() => window.scrollY);
    if (y === last) break;
    last = y;
    await sleep(80);
  }
  return last;
}

// ── Commands ────────────────────────────────────────────────────────────────
async function cmdCheck(route = "/") {
  const { browser, page, errors, failed } = await open(route);
  await afterIntro(page);
  const fonts = await fontTokens(page);
  const title = await page.title();
  // First heading of any level: the home hero is a full-bleed photograph with
  // an eyebrow + project name and no <h1>, so probing h1 alone reports
  // "(none)" on a page rendering perfectly.
  const heading = await page.evaluate(() => {
    const el = document.querySelector("h1, h2");
    return el
      ? `<${el.tagName.toLowerCase()}> ${el.textContent.trim().replace(/\s+/g, " ").slice(0, 60)}`
      : "(no h1/h2)";
  });
  await browser.close();

  const fontsOk = Boolean(fonts.serif);
  console.log(`route        ${route}`);
  console.log(`title        ${title}`);
  console.log(`heading      ${heading}`);
  console.log(`--font-serif ${fonts.serif || "(EMPTY — .next likely corrupt, see SKILL.md)"}`);
  console.log(`body font    ${fonts.bodyFont}`);
  console.log(`console errors  ${errors.length}`);
  errors.slice(0, 10).forEach((e) => console.log(`   ! ${e}`));
  console.log(`failed requests ${failed.length}`);
  failed.slice(0, 10).forEach((f) => console.log(`   ! ${f}`));

  const ok = fontsOk && errors.length === 0 && failed.length === 0;
  console.log(ok ? "PASS" : "FAIL");
  return ok;
}

async function cmdShot(route = "/") {
  const { browser, page } = await open(route);
  await afterIntro(page);
  const file = outPath(route === "/" ? "home" : slug(route.slice(1)));
  await page.screenshot({ path: file, fullPage: FULL });
  await browser.close();
  console.log(file);
}

async function cmdScroll(route = "/") {
  const to = flag("to");
  if (!to) throw new Error("scroll needs --to <px|selector>");
  const { browser, page } = await open(route);
  await afterIntro(page);
  let y;
  if (/^\d+$/.test(String(to))) {
    y = await lenisScrollTo(page, Number(to));
  } else {
    const idx = await resolveTarget(page, String(to));
    y = await lenisScrollTo(page, String(to), idx);
  }
  const file = outPath(`scroll-${slug(to)}`);
  await page.screenshot({ path: file });
  await browser.close();
  console.log(`scrollY ${y}`);
  console.log(file);
}

/**
 * Hover `--sel`, optionally measuring a DIFFERENT element via `--measure`.
 *
 * The split is necessary: the navbar's indicator is a framer `layoutId` pill
 * that translates to the hovered link rather than growing, so measuring the
 * link you hovered reports no delta and reads as a broken interaction.
 */
async function cmdHover(route = "/") {
  const sel = flag("sel");
  if (!sel) throw new Error("hover needs --sel <selector>");
  const measure = flag("measure") || sel;
  const { browser, page } = await open(route);
  await afterIntro(page);

  const idx = await resolveTarget(page, String(sel));
  // The navbar is fixed, so scrolling to it is meaningless and would drag the
  // page away from wherever the caller wanted to be.
  if (!String(sel).startsWith("nav")) await lenisScrollTo(page, String(sel), idx);

  const before = await rectAt(page, String(sel), idx);
  if (!before.connected) throw new Error(`${sel} is detached — measurements would be bogus`);
  const mIdx = measure === sel ? idx : await resolveTarget(page, String(measure)).catch(() => 0);
  const mBefore = await rectAt(page, String(measure), mIdx);

  // Read coords and move with NOTHING in between: Lenis keeps adjusting, so a
  // rect read one evaluate() earlier can be stale. Aim at the centre, not an
  // offset from the top edge.
  const { cx, cy } = await page.evaluate(
    ({ s, i }) => {
      const r = document.querySelectorAll(s)[i].getBoundingClientRect();
      return { cx: r.x + r.width / 2, cy: r.y + r.height / 2 };
    },
    { s: String(sel), i: idx }
  );
  await page.mouse.move(cx, cy);
  await sleep(800);

  const mAfter = await rectAt(page, String(measure), mIdx);
  const file = outPath(`hover-${slug(sel)}`);
  await page.screenshot({ path: file });
  await browser.close();

  console.log(`hovered  ${sel} [${idx}] @ ${Math.round(cx)},${Math.round(cy)}`);
  console.log(`measured ${measure}`);
  console.log(`  before ${fmt(mBefore)}`);
  console.log(`  after  ${fmt(mAfter)}`);
  // Appearing and disappearing both count: the nav pill is conditionally
  // rendered, so its first hover goes absent -> present. Requiring both rects
  // to exist reported a working interaction as a failure.
  const changed =
    Boolean(mBefore) !== Boolean(mAfter) ||
    (mBefore &&
      mAfter &&
      (mBefore.x !== mAfter.x || mBefore.y !== mAfter.y || mBefore.h !== mAfter.h));
  console.log(changed ? "CHANGED" : "NO CHANGE (interaction may not have fired)");
  console.log(file);
}

async function cmdClick(route = "/") {
  const sel = flag("sel");
  if (!sel) throw new Error("click needs --sel <selector>");
  const { browser, page } = await open(route);
  await afterIntro(page);

  const idx = await resolveTarget(page, String(sel));
  await lenisScrollTo(page, String(sel), idx);

  const read = () =>
    page.evaluate(
      ({ s, i }) => {
        const el = document.querySelectorAll(s)[i];
        return el ? el.getAttribute("aria-expanded") : null;
      },
      { s: String(sel), i: idx }
    );

  const before = await read();

  // ── Reachability, not just position ──────────────────────────────────────
  // Services is a pinned HORIZONTAL track: vertical scroll translates its
  // cards sideways, so centring a row vertically can carry the card off the
  // left edge (observed x = -938). A mouse click there lands outside the
  // viewport, hits nothing, and aria-expanded never changes — which reads
  // exactly like a broken handler.
  //
  // React honours a native el.click() (unlike a synthetic PointerEvent, which
  // onPointerEnter ignores), so the fallback exercises the same handler and
  // just skips the coordinates. Which path ran is always printed.
  const hit = await page.evaluate(
    ({ s, i }) => {
      const el = document.querySelectorAll(s)[i];
      const r = el.getBoundingClientRect();
      const cx = r.x + r.width / 2;
      const cy = r.y + r.height / 2;
      const inView = cx >= 0 && cy >= 0 && cx <= window.innerWidth && cy <= window.innerHeight;
      const top = inView ? document.elementFromPoint(cx, cy) : null;
      return { cx, cy, inView, reachable: Boolean(top && (el === top || el.contains(top))) };
    },
    { s: String(sel), i: idx }
  );

  if (hit.reachable) {
    await page.mouse.click(hit.cx, hit.cy);
    console.log(`clicked via mouse @ ${Math.round(hit.cx)},${Math.round(hit.cy)}`);
  } else {
    await page.evaluate(
      ({ s, i }) => document.querySelectorAll(s)[i].click(),
      { s: String(sel), i: idx }
    );
    console.log(
      `clicked via el.click() — target ${hit.inView ? "obscured" : "outside viewport"} ` +
        `(x${Math.round(hit.cx)} y${Math.round(hit.cy)})`
    );
  }
  await sleep(900);
  const after = await read();

  const file = outPath(`click-${slug(sel)}`);
  await page.screenshot({ path: file });
  await browser.close();
  console.log(`aria-expanded ${before} -> ${after}`);
  console.log(before !== after ? "TOGGLED" : "NO CHANGE");
  console.log(file);
}

async function cmdIntro() {
  const { browser, page } = await open("/");
  // The one thing you cannot screenshot "after settle" — sample it instead.
  const marks = [400, 1200, 2000, INTRO_CLEARED_MS, INTRO_WORST_CASE_MS];
  let prev = 0;
  for (const t of marks) {
    await sleep(t - prev);
    prev = t;
    const file = outPath(`intro-${String(t).padStart(4, "0")}ms`);
    await page.screenshot({ path: file });
    console.log(file);
  }
  await browser.close();
}

async function cmdSmoke() {
  const routes = ["/", "/faq", "/photography"];
  let ok = true;
  for (const r of routes) {
    console.log(`\n── ${r} ${"─".repeat(40)}`);
    ok = (await cmdCheck(r)) && ok;
    await cmdShot(r);
  }
  console.log(`\n${ok ? "SMOKE PASS" : "SMOKE FAIL"}`);
  if (!ok) process.exitCode = 1;
}

// ── Dispatch ────────────────────────────────────────────────────────────────
const route = normalizeRoute(positional[0]);
try {
  switch (cmd) {
    case "check": await cmdCheck(route); break;
    case "shot": await cmdShot(route); break;
    case "scroll": await cmdScroll(route); break;
    case "hover": await cmdHover(route); break;
    case "click": await cmdClick(route); break;
    case "intro": await cmdIntro(); break;
    case "smoke": await cmdSmoke(); break;
    default:
      console.error("commands: check | shot | scroll | hover | click | intro | smoke");
      process.exit(1);
  }
} catch (e) {
  console.error(`FAILED: ${e.message}`);
  process.exit(1);
}
