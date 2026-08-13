"use client";

/**
 * Contact — the enquiry, and the end of the page.
 *
 * ── This is now the last thing on the site ────────────────────────────────
 *
 * There used to be a footer below this: a nav column, a repeat of the contact
 * details, an oversized raster logo and a copyright line. The client's note
 * was "remove this last slide and have important data in above slide", with a
 * neater reference site attached — so the footer is deleted and everything
 * from it that earned its place has moved in here:
 *
 *   · the studio's navigation, as a compact index
 *   · the social links
 *   · the copyright line
 *
 * What did not move is the giant logo. It was a 640px raster of the full
 * lockup, visibly soft at that size, and it ended the page on a picture of a
 * logo rather than on an invitation to write.
 *
 * The contact details themselves were all wrong and are corrected here:
 * the website, the phone number and the address now come from `SITE`.
 *
 * ── The green wash is gone; the gold heading is not ───────────────────
 *
 * This section used to be a photograph under `.overlay-emerald` — a near-opaque
 * dark green wash with cream type on it — which made the page END on the
 * largest dark area on the site after the hero. The site is light throughout
 * now, so the photograph stays and the wash inverts: `.overlay-paper` is a
 * graded paper veil, heaviest under the type on the left and thinning toward
 * the right, so the room is still visibly a room and charcoal and emerald type
 * sit on it at full contrast.
 *
 * The heading is still GOLD, per the client's mark-up on this specific heading
 * — but in `gold-ink`, the deep 40%-lightness cut of the same hue. The logo
 * gold is ~2:1 against paper; it only ever held up because it was sitting on
 * near-black. This is the one change of ink the light page forces, and it is
 * the smallest one that keeps the client's decision intact instead of quietly
 * dropping it: it still reads as gold at display size, and it is legible.
 *
 * The form is non-functional (submit is prevented); it establishes the layout
 * and the interaction surface.
 *
 * TODO (future phases): wire submission to a route handler / form service.
 */
import { useState, type FormEvent } from "react";

import {
  Media,
  PageContainer,
  Reveal,
  Button,
  SectionHeading,
  SheetTexture,
  SmoothLink,
} from "@/components/ui";
import { NAV_LINKS, SITE, SOCIAL_LINKS } from "@/constants";

// Field definitions kept declarative so the form stays DRY.
const FIELDS = [
  { name: "name", label: "Your name", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "project", label: "Project type", type: "text" },
] as const;

const YEAR = 2026; // Phase 1: static; wire to build-time date later.

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: replace with real submission handler.
    setSubmitted(true);
  };

  return (
    <section
      id="contact"
      /* ── The last chapter, on the brand's own colour ────────────────────
         The story arc ends here — see the note on `.surface-moss` in
         styles/globals.css. Six chapters carry the page from paper to brand
         emerald in one direction, and the invitation to work with the studio
         sits on the colour of the logo. That is the argument of a brand site
         made as a gradient instead of as a sentence.

         `data-chrome="dark"` because the masthead floats over it. */
      data-chrome="dark"
      className="relative overflow-hidden bg-emerald text-cream"
    >
      {/* ── The studio's own room, under a paper veil ─────────────────
          This was a stock Unsplash kitchen — and a near-WHITE one, which is why
          the veil could not save this section: a paper wash over an already
          white photograph composites to a white rectangle no matter how the
          gradient is tuned. Two passes were spent pushing green into the edges
          of it, and the honest fix was the picture.

          It is Kapali Mall now, from the studio's own photography and one of
          the nine projects in <SelectedWorks /> above. Warm, saturated and
          dense, so the veil has something to hold back; and the page now ends
          by inviting you into a room the studio actually built, which is a
          better closing argument than a rented one. */}
      <div className="absolute inset-0">
        <Media
          src="/images/hero/kapalimall.jpg"
          alt=""
          sizes="100vw"
        />
        {/* A FLAT veil, not a graded one. Three stacked linear-gradients used
            to do this job and they are what the studio meant by green smears.
            At 94% the room reads as a texture inside the green rather than as a
            photograph being washed out, the type has one predictable ground
            everywhere on it, and there is no gradient anywhere in the section. */}
        <div className="absolute inset-0 bg-emerald/94" />
      </div>

      {/* Sits above the photograph and its veil, below the content — the
          <PageContainer /> below is `relative z-10`. */}
      <SheetTexture tone="dark" />

      <PageContainer className="relative z-10 pt-20 pb-10 md:pt-24 lg:pt-28">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          {/* Left: heading + details */}
          <div className="flex flex-col justify-center">
            <SectionHeading
              index="06"
              eyebrow="Contact"
              title={"Let’s design\nsomething lasting"}
              tone="dark"
              titleClassName="text-gold"
            />

            <Reveal delay={0.1}>
              <dl className="mt-12 grid gap-5 border-t border-cream/20 pt-8">
                <div>
                  <dt className="font-label text-cream/50">
                    Website
                  </dt>
                  <dd className="mt-1.5 ml-0">
                    {/* The studio's own address, so it links HOME rather than
                        out to the absolute URL. Pointing it at `SITE.url` sent
                        a visitor on a full round trip to the production domain
                        to arrive back where they already were — and off-site
                        entirely from a preview or a local build. */}
                    <SmoothLink
                      href="/"
                      className="font-serif text-xl text-cream transition-colors duration-500 hover:text-gold md:text-2xl"
                    >
                      {SITE.urlLabel}
                    </SmoothLink>
                  </dd>
                </div>
                <div>
                  <dt className="font-label text-cream/50">
                    Telephone
                  </dt>
                  <dd className="mt-1.5 ml-0">
                    <a
                      href={`tel:${SITE.phoneHref}`}
                      className="font-serif text-xl text-cream transition-colors duration-500 hover:text-gold md:text-2xl"
                    >
                      {SITE.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="font-label text-cream/50">
                    Email
                  </dt>
                  <dd className="mt-1.5 ml-0">
                    <a
                      href={`mailto:${SITE.email}`}
                      className="font-serif text-xl text-cream transition-colors duration-500 hover:text-gold md:text-2xl"
                    >
                      {SITE.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="font-label text-cream/50">
                    Studio
                  </dt>
                  <dd className="mt-1.5 ml-0 font-serif text-xl text-cream md:text-2xl">
                    {SITE.address}
                  </dd>
                </div>
              </dl>
            </Reveal>
          </div>

          {/* ── Right: the form, on its own panel ─────────────────────────
              The panel is not decoration, it is legibility.

              With a stock white kitchen behind this section a flat veil was
              enough for both columns. The backdrop is one of the studio's own
              rooms now — warm, detailed, high-contrast — and it is
              HIGH-FREQUENCY DETAIL rather than brightness that makes type on a
              photograph unreadable: the 12px field labels and the hairline
              inputs were sitting directly over a lit bar and a ceiling grid.

              The alternative was to thicken the veil again, which is how this
              section ended up as a white rectangle in the first place. A panel
              instead keeps the photograph at full strength everywhere it is not
              needed, and gives the enquiry the one thing it should have as the
              last element on the site: an edge, so it reads as a thing to fill
              in rather than as text lying on a picture.

              Same material as the masthead — heavy blur, a bright rim along the
              top, a soft float shadow (see `.glass-bar` / `.glass-bar-light` in
              styles/globals.css) — so the site's one piece of glass is used
              consistently rather than reinvented here. */}
          <Reveal delay={0.15} className="flex flex-col justify-center">
            {/* ── A card, not a smoked pane ─────────────────────────────
                This was `.glass-bar-dark` — a neutral ink veil at 38% over
                whatever was behind it. Over the near-white kitchen it replaced
                that was fine; over THIS photograph, which is a warm restaurant
                full of pendant lights, a heavy blur averages all of that into a
                brown-olive smear sitting in the middle of the section. Blurring
                a busy warm image and tinting it neutral is a reliable way to
                manufacture mud.

                So the panel stops being transparent and becomes a surface: near
                the emerald ground it sits on, with a champagne rim and a float
                shadow. The blur stays, so the room still shows faintly at the
                edges and it still reads as glass rather than as a box — but the
                colour underneath it is now decided by the palette rather than
                by whatever happened to be in the photograph. */}
            <div className="glass-bar rounded-2xl border border-gold/25 bg-[color-mix(in_srgb,var(--color-emerald-deep)_80%,transparent)] p-7 shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-gold-soft)_20%,transparent),0_34px_72px_-32px_color-mix(in_srgb,var(--color-emerald-deep)_85%,transparent)] md:p-9">
            {submitted ? (
              <div className="border-t border-gold/50 pt-8">
                <p className="m-0 font-serif text-3xl text-gold">Thank you.</p>
                <p className="mt-4 max-w-[36ch] text-cream/75">
                  We read every enquiry ourselves and will be in touch shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                {FIELDS.map((field) => (
                  <label key={field.name} className="flex flex-col gap-2">
                    <span className="font-label text-cream/60">
                      {field.label}
                    </span>
                    <input
                      type={field.type}
                      name={field.name}
                      required
                      // Form-filler / temp-mail browser extensions inject style
                      // + data-* attributes onto inputs (esp. email) before
                      // React hydrates. Suppress the resulting benign attribute
                      // mismatch on the field itself.
                      suppressHydrationWarning
                      className="border-b border-cream/30 bg-transparent pb-3 text-lg text-cream outline-none transition-colors focus:border-gold"
                    />
                  </label>
                ))}

                <label className="flex flex-col gap-2">
                  <span className="font-label text-cream/60">
                    Tell us about your project
                  </span>
                  <textarea
                    name="message"
                    rows={3}
                    suppressHydrationWarning
                    className="resize-none border-b border-cream/30 bg-transparent pb-3 text-lg text-cream outline-none transition-colors focus:border-gold"
                  />
                </label>

                <div className="mt-2">
                  <Button type="submit" variant="outline">
                    Send Enquiry
                  </Button>
                </div>
              </form>
            )}
            </div>
          </Reveal>
        </div>

        {/* ── The colophon ─────────────────────────────────────────────────
            What survived the footer's deletion. Kept to one hairline-separated
            row so the page ends on the enquiry, not on a second block of
            navigation. */}
        <div className="mt-16 flex flex-col gap-6 border-t border-cream/20 pt-8 md:mt-20 lg:flex-row lg:items-center lg:justify-between">
          <nav aria-label="Site">
            <ul className="flex list-none flex-wrap items-center gap-x-7 gap-y-2 p-0">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  {/* This block is the site's footer in all but name, and it
                      renders on /faq and /photography too — so these are the
                      same route-aware links the masthead uses, not bare
                      anchors that would have pointed at ids those pages do not
                      contain. */}
                  <SmoothLink
                    href={link.href}
                    className="font-label text-cream/60 transition-colors duration-500 hover:text-gold"
                  >
                    {link.label}
                  </SmoothLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-7">
            <ul className="flex list-none items-center gap-5 p-0">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                return (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="block text-cream/55 transition-colors duration-500 hover:text-gold"
                    >
                      <Icon size={17} />
                    </a>
                  </li>
                );
              })}
            </ul>
            <p className="m-0 font-label text-cream/45">
              © {YEAR} {SITE.name}
            </p>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
