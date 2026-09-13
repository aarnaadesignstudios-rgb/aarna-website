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
 * ── The form sends, and it only says so when it did ──────────────────────
 *
 * It did not, for the whole of phase 1. `handleSubmit` was
 * `e.preventDefault(); setSubmitted(true)` with a TODO over it, which is the
 * worst shape this bug can take: the visitor read "We read every enquiry
 * ourselves and will be in touch shortly", closed the tab, and waited. Nothing
 * had been sent and nobody could tell how many had been lost.
 *
 * It posts to Web3Forms now — no server of our own, no domain to verify, and
 * the enquiry arrives in the studio's Gmail inbox. See `ACCESS_KEY` below.
 *
 * The part worth keeping straight is the STATE MACHINE, not the endpoint.
 * "Thank you" is now reachable from exactly one place: a response that came
 * back `ok` with `success: true` in its body. A network failure, a rejected
 * key, a 500 at the other end, or no key configured at all each land on the
 * error panel, which keeps the form intact and gives the studio's email and
 * phone so the enquiry has somewhere else to go. Nothing on this page will
 * claim delivery it cannot see.
 */
import { useState, type FormEvent } from "react";
import { FiArrowUpRight } from "react-icons/fi";

import {
  Media,
  PageContainer,
  Reveal,
  Button,
  SectionHeading,
  SheetTexture,
  SmoothLink,
} from "@/components/ui";
import { NAV_LINKS, SITE, SITE_IMAGES, SOCIAL_LINKS } from "@/constants";
import type { Photograph } from "@/types";

// Field definitions kept declarative so the form stays DRY.
const FIELDS = [
  { name: "name", label: "Your name", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "project", label: "Project type", type: "text" },
] as const;

/**
 * Web3Forms' access key, which identifies the inbox to deliver to.
 *
 * ── `NEXT_PUBLIC_`, and that is correct rather than a compromise ─────────
 *
 * The browser makes this request, so the key is in the bundle whichever prefix
 * it carries — and Web3Forms designs it that way: the key is an ADDRESS, not a
 * credential. It grants one thing, posting a message to the studio's inbox,
 * which is what the form in front of every visitor already does. There is
 * nothing to read with it and nothing to change.
 *
 * It is read at module scope, not inside the handler, because
 * `process.env.NEXT_PUBLIC_*` is substituted at BUILD time — it is not an
 * object to look things up in at runtime, and `process.env[name]` with a
 * computed name silently yields undefined in a client bundle.
 *
 * Empty when nobody has set it. That is a real state and it is handled: the
 * submit goes straight to the error panel rather than to a fetch that would
 * 400, and — crucially — never to "Thank you".
 */
const ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ?? "";

/** idle → sending → sent, or → error, from which the form can be retried. */
type Status = "idle" | "sending" | "sent" | "error";

const YEAR = 2026; // Phase 1: static; wire to build-time date later.

/**
 * `backdrop` comes from the CMS, and defaults to the committed photograph.
 *
 * Whatever replaces it in the Studio inherits this section's one hard
 * constraint: the veil below sits at 94%, so the room has to be warm and dense
 * or it disappears into the green entirely rather than reading as a texture
 * inside it. The field's description in sanity/schemas/siteImages.ts says so
 * where the person choosing it will actually read it.
 */
interface ContactProps {
  backdrop?: Photograph;
}

export default function Contact({
  backdrop = SITE_IMAGES.contactBackdrop,
}: ContactProps) {
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // A second click while the first request is in flight would send the
    // enquiry twice. The button is disabled too; this is the guard that holds
    // when the form is submitted with the keyboard.
    if (status === "sending") return;

    const data = new FormData(e.currentTarget);

    /* ── The honeypot ─────────────────────────────────────────────────
       `botcheck` is hidden from people and left empty by them; a bot that
       fills every field it finds fills this one too. Dropped SILENTLY and
       shown the thank-you — telling a scraper which of its submissions were
       rejected is how it learns to stop filling the field. A person cannot
       reach this line: the input is `hidden`, so there is no way to type in
       it and no way to focus it by tab. */
    if (data.get("botcheck")) {
      setStatus("sent");
      return;
    }

    if (!ACCESS_KEY) {
      setStatus("error");
      return;
    }

    /* The subject line the studio sees in Gmail. The project type is in it
       because these arrive in a personal inbox alongside everything else —
       "New enquiry — Restaurant" is scannable in a list where "New Submission"
       is not. It falls back rather than rendering an empty tail: the field is
       `required`, but a browser that submits anyway should not produce a
       subject ending in a dash. */
    data.append("subject", `New enquiry — ${data.get("project") || SITE.name}`);
    data.append("from_name", SITE.name);
    data.append("access_key", ACCESS_KEY);

    setStatus("sending");

    try {
      /* ── The FormData goes as-is, and NO headers are set ─────────────────
         This is the difference between a form that works and one that cannot
         send at all, and it is not a style choice.

         A cross-origin `fetch` only skips the CORS PREFLIGHT when it qualifies
         as a "simple request", and the test that matters here is the
         Content-Type: `multipart/form-data`, `application/x-www-form-urlencoded`
         and `text/plain` are safelisted, and everything else — including
         `application/json` — makes the browser send an OPTIONS first and wait
         for permission.

         This was written the JSON way, the way Web3Forms' AJAX example shows,
         and every submission failed: their API answers that preflight
         `403` with no `Access-Control-Allow-Origin` on it, so Chrome blocked
         the POST before it was ever sent (`net::ERR_FAILED`). The endpoint is
         fine; the preflight is what it will not serve.

         Passing the FormData object straight through means the browser sets
         `multipart/form-data` with its own boundary, the request is simple, no
         OPTIONS is sent, and the POST goes. Setting ANY `Content-Type` here —
         even the correct one — breaks it again, because a hand-written value
         has no boundary parameter. That is why there is no `headers` key at
         all rather than an empty one: there is nothing safe to put in it. */
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: data,
      });

      /* Both halves are checked. Web3Forms answers a rejected key or a
         malformed payload with a NON-2xx and a `success: false` body, but it
         is a third party: a 200 whose body says the submission failed is the
         case that would otherwise print "Thank you" over a lost enquiry, which
         is the exact bug this replaced. `.catch` because a proxy or an offline
         captive portal can return 200 with a body that is not JSON. */
      const json = (await res.json().catch(() => null)) as {
        success?: boolean;
      } | null;

      setStatus(res.ok && json?.success ? "sent" : "error");
    } catch {
      // Offline, DNS, CORS, a blocked request — the enquiry did not arrive.
      setStatus("error");
    }
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
          src={backdrop.src}
          alt={backdrop.alt}
          sizes="100vw"
          objectPosition={backdrop.objectPosition}
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
                  <dt className="font-label text-cream/50">Telephone</dt>
                  {/* ── The pair sits on one line, at every width ──────────
                      Two numbers under one label, separated by a hairline,
                      because they are one entry: "Telephone" is plural here
                      and a second <dt>/<dd> row would say the studio has two
                      different kinds of telephone.

                      ── It genuinely fits, and that was measured ───────────
                      The first draft hid the divider below `lg` on the
                      assumption that the pair would wrap on a phone. It does
                      not. Measured across the real column at ten widths from
                      320 to 1920: the two numbers need 236px at `text-xl` and
                      283px at `md:text-2xl`, against a column that is never
                      narrower than 272px — one line, zero overflow, all the
                      way down. So the divider is shown always; gating it by
                      breakpoint removed the separator at exactly the sizes
                      where the two numbers sit closest together, which is
                      where it was doing the most work.

                      `flex-wrap` stays as a floor, not a plan: it costs
                      nothing and means a longer number, or a large
                      text-zoom setting, degrades to two lines instead of
                      overflowing the column.

                      `items-baseline`, so the rule sits on the numerals'
                      baseline rather than in the middle of the line box. */}
                  <dd className="mt-1.5 ml-0 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                    {[
                      { label: SITE.phone, href: SITE.phoneHref },
                      { label: SITE.phoneAlt, href: SITE.phoneAltHref },
                    ].map((line, i) => (
                      <span
                        key={line.href}
                        className="inline-flex items-baseline gap-x-3"
                      >
                        {i > 0 && (
                          <span
                            aria-hidden
                            className="inline-block h-[0.85em] w-px bg-cream/25"
                          />
                        )}
                        <a
                          href={`tel:${line.href}`}
                          className="font-serif text-xl text-cream transition-colors duration-500 hover:text-gold md:text-2xl"
                        >
                          {line.label}
                        </a>
                      </span>
                    ))}
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
            {status === "sent" ? (
              <div className="border-t border-gold/50 pt-8">
                <p className="m-0 font-serif text-3xl text-gold">Thank you.</p>
                <p className="mt-4 max-w-[36ch] text-cream/75">
                  We read every enquiry ourselves and will be in touch shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                {/* ── The honeypot ────────────────────────────────────────
                    `type="hidden"` rather than a visually-hidden text input:
                    a hidden input is out of the tab order and cannot be typed
                    into, so no person — sighted, screen-reader, or keyboard —
                    can trip it, which is the failure mode that makes the usual
                    off-screen version an accessibility problem. `tabIndex` and
                    `autoComplete` are belt-and-braces against a password
                    manager filling it. See the check in `handleSubmit`. */}
                <input
                  type="hidden"
                  name="botcheck"
                  tabIndex={-1}
                  autoComplete="off"
                />

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

                {/* ── When it did not send ────────────────────────────────
                    The form stays up, so nothing the visitor typed is thrown
                    away and the button can simply be pressed again. What this
                    adds is the two channels that do not depend on the studio's
                    form working — the same address and number printed on the
                    left of this section, repeated here because this is where
                    someone is standing when they find out.

                    `role="alert"` so a screen reader is told: the button they
                    pressed is above this, the focus has not moved, and without
                    a live region the failure is silent.

                    It reads "did not send" rather than "something went wrong".
                    The visitor's question at this moment is whether the studio
                    has their enquiry, and the answer is no. */}
                {status === "error" && (
                  <div
                    role="alert"
                    className="border-l-2 border-gold/60 pl-4"
                  >
                    <p className="m-0 font-serif text-xl text-gold">
                      That didn’t send.
                    </p>
                    <p className="mt-2 text-cream/75">
                      Nothing has reached us — please try again, or write to us
                      directly at{" "}
                      <a
                        href={`mailto:${SITE.email}`}
                        className="border-b border-gold/50 text-cream transition-colors duration-500 hover:text-gold"
                      >
                        {SITE.email}
                      </a>{" "}
                      or call{" "}
                      <a
                        href={`tel:${SITE.phoneHref}`}
                        className="border-b border-gold/50 text-cream transition-colors duration-500 hover:text-gold"
                      >
                        {SITE.phone}
                      </a>
                      .
                    </p>
                  </div>
                )}

                <div className="mt-2">
                  {/* The same control as the masthead's, down to the arrow:
                      one instruction, one object. See the note on the
                      `outline` variant in components/ui/Button.tsx.

                      `aria-busy` alongside the label change: the word is what a
                      sighted visitor reads, and the attribute is what tells
                      assistive tech the control is working rather than that a
                      second, different button has appeared. `disabled` carries
                      the dimming — see `disabled:opacity-50` in the base. */}
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={status === "sending"}
                    aria-busy={status === "sending"}
                  >
                    {status === "sending" ? "Sending…" : "Send Enquiry"}
                    <FiArrowUpRight
                      size={14}
                      aria-hidden
                      className="shrink-0 transition-transform duration-500 ease-editorial group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5"
                    />
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
          {/* ── The colophon's targets are thumb-sized ────────────────────
              Everything in this row is 12px label type, and a 12px label with
              no padding is a 14px-tall tap target — measured at 50×14 for these
              links and 17×17 for the social marks. WCAG 2.2 asks for 24×24, and
              this row is the last thing on every page on the site, which on a
              phone means it is the row a thumb reaches for most.

              The padding is added rather than the type enlarged: the label size
              is a system decision (see `--text-label` in styles/globals.css) and
              the row is meant to read quietly. `gap-y` comes down to match, so
              the block's overall height barely moves. */}
          <nav aria-label="Site">
            <ul className="-my-1.5 flex list-none flex-wrap items-center gap-x-7 gap-y-0 p-0">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  {/* This block is the site's footer in all but name, and it
                      renders on /faq and /about too — so these are the
                      same route-aware links the masthead uses, not bare
                      anchors that would have pointed at ids those pages do not
                      contain. */}
                  <SmoothLink
                    href={link.href}
                    className="inline-block py-1.5 font-label text-cream/60 transition-colors duration-500 hover:text-gold"
                  >
                    {link.label}
                  </SmoothLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-7">
            {/* `-m-1.5` cancels the padding at the group's edges, so the marks
                stay optically where they were and only their targets grow. */}
            <ul className="-m-1.5 flex list-none items-center gap-2 p-0">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                /* ── A new tab for a profile, none for the mail client ────
                   The row is Instagram, LinkedIn and the studio's Gmail
                   address, and the last one is a `mailto:`. `target="_blank"`
                   on a mailto is not harmless: a browser that hands the URL to
                   a desktop mail client leaves the tab it opened for it sitting
                   there empty, and one with no handler registered at all leaves
                   a blank tab and no explanation. The two profiles genuinely do
                   want a new tab — this row is the last thing on every page,
                   and a visitor who taps Instagram at the end of the enquiry
                   form should still have the enquiry form to come back to.

                   `rel` follows `target`, not the scheme: `noopener` exists to
                   deny the opened page a handle on `window.opener`, which a
                   mail client never has. */
                const external = social.href.startsWith("http");
                return (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      {...(external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      aria-label={social.label}
                      className="block p-1.5 text-cream/55 transition-colors duration-500 hover:text-gold"
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
