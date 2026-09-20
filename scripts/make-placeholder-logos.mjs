#!/usr/bin/env node
/**
 * Draw the eight PLACEHOLDER client logos in `public/images/clients/`.
 *
 * ── Why these are generated and committed rather than hand-drawn ─────────
 *
 * The client band is a logo wall and it cannot be judged without logos in it.
 * There are none — the studio has not supplied any — so these stand in until
 * they do, and every one of them is thrown away the moment a real `client`
 * document is published with a lockup on it. See the note on CLIENTS in
 * constants/content.ts.
 *
 * They are DELIBERATELY uneven. Eight marks at one aspect ratio would tell you
 * the band looks tidy when the real thing will be a 3:1 banner lockup next to
 * a square monogram — which is the case the fixed 120x32 slot in
 * <CreditBand /> exists to handle, and the only case worth previewing. So the
 * widths here run 104–224 and the compositions vary: wordmark, monogram in a
 * rule, mark-plus-text, stacked.
 *
 * Single-colour charcoal on transparent, because that is what the band's
 * treatment assumes (see the note on `logo` in <CreditBand />) and what a
 * studio should be asking its clients for.
 *
 * Run: node scripts/make-placeholder-logos.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const OUT = resolve(process.cwd(), "public/images/clients");
mkdirSync(OUT, { recursive: true });

const INK = "#17201c";
/* A generic stack on purpose. These are placeholders, and asking them to load
   a webfont would mean embedding one in eight files to preview a layout. */
const SANS = "Helvetica,Arial,sans-serif";
const SERIF = "Georgia,'Times New Roman',serif";

const wrap = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" fill="none" role="img">${body}</svg>\n`;

const logos = {
  /* Wordmark between two rules — the plainest kind of corporate lockup. */
  "meridian-group": wrap(
    196,
    48,
    `<path d="M2 9h192M2 39h192" stroke="${INK}" stroke-width="1"/>
     <text x="98" y="27" text-anchor="middle" font-family="${SANS}" font-size="15" letter-spacing="5.5" fill="${INK}">MERIDIAN</text>
     <text x="98" y="36" text-anchor="middle" font-family="${SANS}" font-size="6" letter-spacing="3.4" fill="${INK}">GROUP</text>`
  ),

  /* Diamond mark + serif caps. */
  "verdance-hotels": wrap(
    208,
    48,
    `<path d="M20 10 30 24 20 38 10 24Z" stroke="${INK}" stroke-width="1.4"/>
     <path d="M20 18 24 24 20 30 16 24Z" fill="${INK}"/>
     <text x="44" y="23" font-family="${SERIF}" font-size="17" letter-spacing="2.6" fill="${INK}">VERDANCE</text>
     <text x="45" y="36" font-family="${SANS}" font-size="7" letter-spacing="4.6" fill="${INK}">HOTELS</text>`
  ),

  /* Monogram in a square + a long name. The widest of the set. */
  "northbridge-developers": wrap(
    224,
    48,
    `<rect x="2" y="10" width="28" height="28" stroke="${INK}" stroke-width="1.4"/>
     <text x="16" y="30" text-anchor="middle" font-family="${SERIF}" font-size="14" fill="${INK}">NB</text>
     <text x="40" y="23" font-family="${SANS}" font-size="13" letter-spacing="1.7" fill="${INK}">NORTHBRIDGE</text>
     <text x="41" y="36" font-family="${SANS}" font-size="7" letter-spacing="3.6" fill="${INK}">DEVELOPERS</text>`
  ),

  /* Circle-and-dot mark over a serif wordmark — a foundation's shape. */
  "saanjh-foundation": wrap(
    168,
    48,
    `<circle cx="20" cy="24" r="13" stroke="${INK}" stroke-width="1.3"/>
     <circle cx="20" cy="24" r="4.5" fill="${INK}"/>
     <text x="42" y="23" font-family="${SERIF}" font-size="17" letter-spacing="1.6" fill="${INK}">SAANJH</text>
     <text x="43" y="36" font-family="${SANS}" font-size="7" letter-spacing="3.2" fill="${INK}">FOUNDATION</text>`
  ),

  /* Pure italic serif, no mark at all. */
  "casa-lumina": wrap(
    172,
    48,
    `<text x="86" y="27" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="24" fill="${INK}">Casa Lumina</text>
     <path d="M52 36h68" stroke="${INK}" stroke-width="0.9"/>`
  ),

  /* Heavy over light, stacked — a retail group's mark. */
  "indus-retail": wrap(
    148,
    48,
    `<text x="74" y="26" text-anchor="middle" font-family="${SANS}" font-weight="700" font-size="22" letter-spacing="1.2" fill="${INK}">INDUS</text>
     <text x="74" y="38" text-anchor="middle" font-family="${SANS}" font-size="7.5" letter-spacing="6" fill="${INK}">RETAIL</text>`
  ),

  /* Cross mark + name. Narrow, to sit next to the 224 one. */
  "tanvi-healthcare": wrap(
    180,
    48,
    `<path d="M16 14v20M6 24h20" stroke="${INK}" stroke-width="3" stroke-linecap="square"/>
     <text x="36" y="23" font-family="${SANS}" font-size="15" letter-spacing="1.8" fill="${INK}">TANVI</text>
     <text x="37" y="36" font-family="${SANS}" font-size="7" letter-spacing="3.1" fill="${INK}">HEALTHCARE</text>`
  ),

  /* A roofline over a monogram — the squarest lockup in the set, and the one
     that proves the fixed slot is doing something. */
  "ashwin-realty": wrap(
    104,
    48,
    `<path d="M52 8 78 28H26Z" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>
     <text x="52" y="43" text-anchor="middle" font-family="${SERIF}" font-size="11" letter-spacing="3.4" fill="${INK}">ASHWIN</text>`
  ),
};

for (const [name, svg] of Object.entries(logos)) {
  writeFileSync(resolve(OUT, `${name}.svg`), svg, "utf8");
  console.log("  wrote", `public/images/clients/${name}.svg`);
}
console.log(`\n  ${Object.keys(logos).length} placeholder logos.\n`);
