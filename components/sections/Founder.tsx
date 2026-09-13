/**
 * Founder — Ar. Annpurna Kinha.
 *
 * The founder is the still point of the page: one section where the layout
 * stops alternating and holds on a portrait and a voice.
 *
 * ── The layout moved to <Profile /> ──────────────────────────────────────
 *
 * Everything about the SHAPE of this — the 4:5 portrait with its counter-
 * parallax and its lower veil, the credential line under it, the standfirst,
 * the signed quote — is now in components/sections/Profile.tsx, because there
 * are two people on this site who get introduced this way and they should be
 * introduced identically. The notes on the tuned values live there, with the
 * values.
 *
 * What is left here is what is about HER: the credentials, the philosophy, the
 * quote in her own words. That is the right split — this file should read as
 * the studio's copy about its founder, not as a layout.
 *
 * ── Changed in the client review ──────────────────────────────────────────
 *
 *  - The biography is the studio's own copy, replacing placeholder text. It is
 *    longer and more factual — credentials, philosophy — so it is set at body
 *    size in a held measure rather than as display type.
 *  - The pull quote is hers: "For me, luxury is not about more…"
 *  - The three principles that closed the section (Light before plan /
 *    Material before finish / Silence before statement) are removed. They were
 *    placeholder copy, and the note was simply "remove".
 *  - "Est. 2008" corrected to `SITE.founded`.
 */
import Profile from "@/components/sections/Profile";
import { SITE, SITE_IMAGES } from "@/constants";
import type { Photograph } from "@/types";

/**
 * `portrait` comes from the CMS, and defaults to the committed photograph.
 *
 * Same contract as every other section that takes content: the page reading
 * Sanity passes it down (app/(site)/about/page.tsx), and the component still
 * renders on its own. The default is SITE_IMAGES rather than a path written
 * here, because a fallback inside the component that consumes it is a second
 * source of truth for the same picture — see constants/content.ts.
 */
interface FounderProps {
  portrait?: Photograph;
}

export default function Founder({
  portrait = SITE_IMAGES.founderPortrait,
}: FounderProps) {
  return (
    <Profile
      id="founder"
      eyebrow="The Founder"
      name="Ar. Annpurna Kinha"
      role={<>Founder &amp; Principal Architect, {SITE.name}</>}
      standfirst="Designing spaces with intention, meaning and a sense of belonging."
      portrait={portrait}
      caption={{ left: `${SITE.name}, Gurugram`, right: `Est. ${SITE.founded}` }}
      quote={{
        text: "For me, luxury is not about more. It is about knowing what matters, and giving it the space to matter.",
        attribution: "Ar. Annpurna Kinha",
      }}
    >
      <p>
        An architect and design entrepreneur, Annpurna Kinha is the Founder
        &amp; Principal Architect of{" "}
        <strong className="font-normal text-emerald">{SITE.name}</strong>, a
        multidisciplinary design practice specialising in architecture,
        commercial interiors and bespoke spaces.
      </p>
      <p>
        She holds a{" "}
        <strong className="font-normal text-emerald">
          Bachelor of Architecture
        </strong>{" "}
        from the University School of Architecture &amp; Planning, an{" "}
        <strong className="font-normal text-emerald">MBA</strong> from Symbiosis
        Institute of Business Management, Pune, and advanced certification in{" "}
        <strong className="font-normal text-emerald">
          Design &amp; Innovation
        </strong>{" "}
        from the Indian Institute of Technology Delhi.
      </p>
      <p>
        Her approach brings together design thinking, business understanding and
        a human-centric perspective, with a focus on creating spaces that are not
        only visually refined but also functional, sustainable and meaningful.
      </p>
      <p>
        Her philosophy,{" "}
        <strong className="font-normal text-gold-ink">
          &ldquo;Designing Conscious Luxury,&rdquo;
        </strong>{" "}
        is rooted in the belief that every element should have a purpose — and
        that the best spaces are those that feel naturally connected to the
        people who inhabit them.
      </p>
    </Profile>
  );
}
