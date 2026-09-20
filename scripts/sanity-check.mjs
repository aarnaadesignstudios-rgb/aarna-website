#!/usr/bin/env node
/**
 * `npm run sanity:check` — is the CMS actually wired up?
 *
 * ── Why this exists ───────────────────────────────────────────────────────
 *
 * The whole integration is built to fail SOFT: with no project ID, an empty
 * dataset, or an unreachable API, the site quietly serves the photographs in
 * `constants/content.ts` and looks completely normal. That is the right
 * behaviour for visitors and a miserable one for whoever is setting it up,
 * because "the site looks fine" is also what a broken configuration looks like.
 *
 * So this reports what the site is ACTUALLY doing, and why.
 *
 * It reads `.env.local` itself rather than relying on Next to have loaded it —
 * the point is to check that file, so taking it on trust would defeat the
 * exercise. No dependencies: it runs before anything is installed or built.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = process.cwd();
const g = (s) => `\x1b[32m${s}\x1b[0m`;
const r = (s) => `\x1b[31m${s}\x1b[0m`;
const y = (s) => `\x1b[33m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

const PASS = g("PASS");
const FAIL = r("FAIL");
const WARN = y("WARN");

/** Minimal .env parser — enough for KEY=value, comments and blanks. */
function readEnv(file) {
  if (!existsSync(file)) return null;
  const out = {};
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

console.log(bold("\n  Sanity configuration\n"));

/**
 * ── 1. The files Next actually reads ───────────────────────
 *
 * Two of them, in Next's own order of precedence: `.env` is committed and
 * carries the public Sanity settings, `.env.local` is git-ignored, optional,
 * and carries only the secrets. `.env.local` wins where they overlap, which is
 * the rule this merge reproduces.
 *
 * A missing `.env.local` is NOT a failure any more. It used to be the only env
 * file in the project, so its absence meant nothing was configured at all; now
 * it means nobody has set the revalidate secret yet, which costs instant
 * publishing and nothing else. Exiting 1 on that would fail CI over an
 * optimisation.
 */
const base = readEnv(resolve(ROOT, ".env"));
const local = readEnv(resolve(ROOT, ".env.local"));

if (!base && !local) {
  console.log(`  ${FAIL}  no .env file found`);
  console.log(
    dim(
      "\n        Next loads .env, .env.local, .env.development and\n" +
        "        .env.production — from the PROJECT ROOT, and nothing else.\n" +
        "        `.env` is committed, so this should not happen in a clean\n" +
        "        checkout: `git checkout .env` will bring it back.\n"
    )
  );
  process.exit(1);
}

const env = { ...(base ?? {}), ...(local ?? {}) };

console.log(
  base
    ? `  ${PASS}  .env found ${dim("(committed — public settings)")}`
    : `  ${WARN}  .env missing ${dim("(it is committed; git checkout .env)")}`
);
console.log(
  local
    ? `  ${PASS}  .env.local found ${dim("(git-ignored — secrets)")}`
    : `  ${WARN}  .env.local missing ${dim("(no secrets set locally)")}`
);

// ── 2. What is in it ─────────────────────────────────────────────────────
const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
const dataset = env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-10-01";
const secret = env.SANITY_REVALIDATE_SECRET || "";
const token = env.SANITY_API_READ_TOKEN || "";

if (!projectId) {
  console.log(`  ${FAIL}  NEXT_PUBLIC_SANITY_PROJECT_ID is empty`);
  console.log(
    dim(
      "\n        The site will serve constants/content.ts. Find the ID at\n" +
        "        sanity.io -> your project -> Settings -> API.\n"
    )
  );
  process.exit(1);
}

console.log(`  ${PASS}  project ${bold(projectId)}  dataset ${bold(dataset)}  api ${apiVersion}`);
console.log(
  secret
    ? `  ${PASS}  SANITY_REVALIDATE_SECRET set ${dim("(publishing updates the live site)")}`
    : `  ${WARN}  SANITY_REVALIDATE_SECRET empty ${dim("(edits appear within the hour, not instantly)")}`
);
// Local only. The deployed site reads its own copy from Vercel and this script
// cannot see that — see the note in `.env`.
if (!secret) {
  console.log(
    dim(
      "\n        Set it in .env.local AND in Vercel -> Settings -> Environment\n" +
        "        Variables, with the same string in the Sanity webhook's Secret\n" +
        "        field. Generate one with:\n" +
        "          node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"\n"
    )
  );
}
if (token) console.log(`  ${PASS}  read token set ${dim("(draft previews available)")}`);

// ── 3. Can we actually reach it? ─────────────────────────────────────────
const TYPES = [
  "work",
  "heroSlide",
  "testimonial",
  "client",
  "accolade",
  "siteImages",
];
const query = `{${TYPES.map((t) => `"${t}": count(*[_type == "${t}"])`).join(",")}}`;
const url =
  `https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}` +
  `?query=${encodeURIComponent(query)}`;

console.log(bold("\n  Content\n"));

try {
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    const body = await res.text();
    console.log(`  ${FAIL}  API returned ${res.status}`);
    if (res.status === 404) {
      console.log(
        dim(
          `\n        No project "${projectId}" or no dataset "${dataset}".\n` +
            "        Check the ID, and that the dataset name matches exactly.\n"
        )
      );
    } else if (res.status === 401 || res.status === 403) {
      console.log(
        dim(
          "\n        The dataset is private. Free-plan datasets are public; if\n" +
            "        yours was made private you need SANITY_API_READ_TOKEN set.\n"
        )
      );
    } else {
      console.log(dim(`\n        ${body.slice(0, 300)}\n`));
    }
    process.exit(1);
  }

  const { result } = await res.json();
  console.log(`  ${PASS}  API reachable\n`);

  // ── What each type is, and whether the SITE actually reads it ──────────
  //
  // This second column is the whole point of the table. Every one of these
  // types has a schema, so every one of them is editable in the Studio and
  // looks equally "connected" from in there. Only some are wired to a getter
  // in sanity/lib/content.ts and a consumer in the page.
  //
  // Publishing into an unwired type is completely silent: the document saves,
  // the Studio shows it, the count below goes up, and the site does not change
  // by a single pixel. That is indistinguishable from a broken configuration
  // unless something says so out loud, which is what `wired` is for.
  //
  // Every type is wired as of the testimonials pass — the three that were not
  // (service, photoFrame, siteImages) had a schema and no reader, which is the
  // exact failure this column exists to name. It stays because the next type
  // added will start out unwired, and this is what will say so.
  //
  // `service` is no longer in this list at all: the disciplines went back to
  // constants/content.ts at the studio's request, so there is no schema to
  // publish into and nothing for this to report. See sanity/schemas/index.ts.
  const TYPES_INFO = {
    work: { label: "Projects", wired: true, where: "Selected Works" },
    heroSlide: { label: "Hero images", wired: true, where: "Hero + intro" },
    testimonial: { label: "Testimonials", wired: true, where: "Testimonials" },
    client: { label: "Clients", wired: true, where: "Clients band" },
    accolade: { label: "Awards & press", wired: true, where: "Awards band" },
    siteImages: {
      label: "Site photographs",
      wired: true,
      where: "Founder portrait, Contact backdrop",
    },
  };

  let total = 0;
  const unwiredWithContent = [];
  for (const t of TYPES) {
    const n = result?.[t] ?? 0;
    const { label, wired } = TYPES_INFO[t];
    total += n;
    if (n > 0 && !wired) unwiredWithContent.push(t);
    const state = wired
      ? n > 0
        ? g("live")
        : dim("live")
      : n > 0
        ? y("NOT WIRED")
        : dim("not wired");
    console.log(`      ${String(n).padStart(3)}  ${label.padEnd(18)} ${state}`);
  }

  console.log(bold("\n  What the site is rendering\n"));

  for (const t of TYPES) {
    const { label, wired, where } = TYPES_INFO[t];
    const n = result?.[t] ?? 0;
    if (!wired) continue;
    console.log(
      n > 0
        ? `  ${PASS}  ${where} is reading from Sanity ${dim(`(${n} × ${label.toLowerCase()})`)}`
        : `  ${WARN}  ${where} is using constants/content.ts ${dim("(nothing published yet)")}`
    );
  }

  // ── The failure this script exists to catch ────────────────────────────
  if (unwiredWithContent.length) {
    console.log(`\n  ${y("!")}  ${bold("Published content the site does not read")}\n`);
    for (const t of unwiredWithContent) {
      const { label, where } = TYPES_INFO[t];
      console.log(
        `      ${result[t]} × ${label} ${dim(`— ${where} still renders constants/content.ts`)}`
      );
    }
    console.log(
      dim(
        "\n        These types have a schema, so the Studio accepts and stores\n" +
          "        them, but nothing on the site queries them yet. Editing them\n" +
          "        changes nothing on screen. Wiring one takes a getter in\n" +
          "        sanity/lib/content.ts and a prop from app/page.tsx — the same\n" +
          "        shape as getWorks/getHeroSlides, plus a row in this table.\n"
      )
    );
  }

  if (total === 0) {
    console.log(
      dim(
        "\n        Nothing published yet anywhere. That is a normal state, and it\n" +
          "        is why the site still looks complete.\n"
      )
    );
  }
  console.log("");
} catch (err) {
  console.log(`  ${FAIL}  could not reach Sanity`);
  console.log(dim(`\n        ${err instanceof Error ? err.message : err}\n`));
  process.exit(1);
}
