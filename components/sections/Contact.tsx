"use client";

/**
 * Contact — luxury enquiry form over an architectural backdrop.
 *
 * Large heading, calm background image, minimal underlined inputs. The form is
 * non-functional in Phase 1 (submit is prevented); it exists to establish the
 * layout and interaction surface.
 *
 * TODO (future phases):
 *  - Wire submission to a route handler / form service with validation + toast.
 *  - Add focus/label float micro-interactions and a success state.
 *  - Parallax the background image behind the form on scroll.
 */
import { useState, type FormEvent } from "react";

import { Media, PageContainer, Reveal, Button, SectionHeading } from "@/components/ui";
import { SITE } from "@/constants";

// Field definitions kept declarative so the form stays DRY.
const FIELDS = [
  { name: "name", label: "Your name", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "project", label: "Project type", type: "text" },
] as const;

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: replace with real submission handler.
    setSubmitted(true);
  };

  return (
    <section id="contact" className="relative overflow-hidden text-cream">
      {/* Architecture background image placeholder. */}
      <div className="absolute inset-0">
        <Media
          src="https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=2000&q=80"
          alt="Serene minimal architectural facade at dusk"
          sizes="100vw"
        />
        <div className="overlay-emerald absolute inset-0" />
      </div>

      <PageContainer className="relative z-10 py-24 md:py-32 lg:py-40">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          {/* Left: heading + details */}
          <div className="flex flex-col justify-center">
            <SectionHeading
              index="08"
              eyebrow="Contact"
              title={"Let’s design\nsomething lasting"}
              tone="dark"
            />

            <Reveal delay={0.1}>
              <dl className="mt-12 space-y-4 border-t border-cream/15 pt-8 font-mono text-[11px] uppercase tracking-[0.16em] text-cream/70">
                <div>
                  <dt className="sr-only">Email</dt>
                  <dd>
                    <a href={`mailto:${SITE.email}`} className="hover:text-gold">
                      {SITE.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">Phone</dt>
                  <dd>{SITE.phone}</dd>
                </div>
                <div>
                  <dt className="sr-only">Address</dt>
                  <dd>{SITE.address}</dd>
                </div>
              </dl>
            </Reveal>
          </div>

          {/* Right: form */}
          <Reveal delay={0.15} className="flex flex-col justify-center">
            {submitted ? (
              <p className="font-serif text-3xl">
                Thank you — we&rsquo;ll be in touch shortly.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                {FIELDS.map((field) => (
                  <label key={field.name} className="flex flex-col gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream/55">
                      {field.label}
                    </span>
                    <input
                      type={field.type}
                      name={field.name}
                      required
                      // Form-filler / temp-mail browser extensions inject style
                      // + data-* attributes onto inputs (esp. email) before
                      // React hydrates. Suppress the resulting benign attribute
                      // mismatch on the field itself (does not affect our code).
                      suppressHydrationWarning
                      className="border-b border-cream/30 bg-transparent pb-3 text-lg text-cream outline-none transition-colors focus:border-gold"
                    />
                  </label>
                ))}

                <label className="flex flex-col gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream/55">
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
      </PageContainer>
    </section>
  );
}
