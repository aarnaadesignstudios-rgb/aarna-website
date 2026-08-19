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

// ── 1. The file Next actually reads ──────────────────────────────────────
const localPath = resolve(ROOT, ".env.local");
const env = readEnv(localPath);

if (!env) {
  console.log(`  ${FAIL}  .env.local not found`);
  console.log(
    dim(
      "\n        Next only loads .env.local, .env, .env.development and\n" +
        "        .env.production — from the PROJECT ROOT. `.env.example` is a\n" +
        "        committed template and is never read.\n\n" +
        "          cp .env.example .env.local\n"
    )
  );
  process.exit(1);
}
console.log(`  ${PASS}  .env.local found`);

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
if (token) console.log(`  ${PASS}  read token set ${dim("(draft previews available)")}`);

// ── 3. Can we actually reach it? ─────────────────────────────────────────
const TYPES = ["work", "heroSlide", "service", "photoFrame", "siteImages"];
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

  const LABEL = {
    work: "Projects",
    heroSlide: "Hero images",
    service: "Services",
    photoFrame: "Photography page",
    siteImages: "Site photographs",
  };
  let total = 0;
  for (const t of TYPES) {
    const n = result?.[t] ?? 0;
    total += n;
    console.log(`      ${String(n).padStart(3)}  ${LABEL[t]}`);
  }

  console.log(bold("\n  What the site is rendering\n"));
  if (result?.work > 0) {
    console.log(
      `  ${PASS}  Selected Works is reading from Sanity ${dim(`(${result.work} projects)`)}`
    );
  } else {
    console.log(`  ${WARN}  Selected Works is still using constants/content.ts`);
    console.log(
      dim(
        "\n        The connection works — there are just no `work` documents yet.\n" +
          "        Open /studio, add a Project, press Publish, and run this again.\n"
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
