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
 * The heading is set in GOLD, per the client's mark-up on this specific
 * heading. Every other section title on the site stays emerald/cream — gold
 * type this size only holds up against the dark emerald ground, and this is
 * the only display heading that sits on one.
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
      /* `data-chrome="dark"`: photography under an emerald overlay, so the
         computed background colour here is transparent and only this
         declaration tells the masthead it is over a dark band. See
         components/layout/Navbar.tsx. */
      data-chrome="dark"
      className="relative overflow-hidden text-cream"
    >
      {/* Architecture background image placeholder. */}
      <div className="absolute inset-0">
        <Media
          src="https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=2000&q=80"
          alt=""
          sizes="100vw"
        />
        <div className="overlay-emerald absolute inset-0" />
      </div>

      <PageContainer className="relative z-10 pt-20 pb-10 md:pt-24 lg:pt-28">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          {/* Left: heading + details */}
          <div className="flex flex-col justify-center">
            <SectionHeading
              index="08"
              eyebrow="Contact"
              title={"Let’s design\nsomething lasting"}
              tone="dark"
              titleClassName="text-gold"
            />

            <Reveal delay={0.1}>
              <dl className="mt-12 grid gap-5 border-t border-cream/15 pt-8">
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

          {/* Right: form */}
          <Reveal delay={0.15} className="flex flex-col justify-center">
            {submitted ? (
              <div className="border-t border-gold/40 pt-8">
                <p className="m-0 font-serif text-3xl text-gold">Thank you.</p>
                <p className="mt-4 max-w-[36ch] text-cream/70">
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
          </Reveal>
        </div>

        {/* ── The colophon ─────────────────────────────────────────────────
            What survived the footer's deletion. Kept to one hairline-separated
            row so the page ends on the enquiry, not on a second block of
            navigation. */}
        <div className="mt-16 flex flex-col gap-6 border-t border-cream/15 pt-8 md:mt-20 lg:flex-row lg:items-center lg:justify-between">
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
                      className="block text-cream/60 transition-colors duration-500 hover:text-gold"
                    >
                      <Icon size={17} />
                    </a>
                  </li>
                );
              })}
            </ul>
            <p className="m-0 font-label text-cream/40">
              © {YEAR} {SITE.name}
            </p>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
