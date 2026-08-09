import type { Metadata } from "next";

import Navbar from "@/components/layout/Navbar";
import Contact from "@/components/sections/Contact";
import FaqList from "@/components/sections/FaqList";
import { PageContainer, SectionHeading } from "@/components/ui";
import { FAQS, SITE } from "@/constants";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description: `Common questions about working with ${SITE.name} — project types, process, timelines, fees, Vastu consultation and how to start.`,
};

/**
 * /faq — the questions the studio is actually asked, added at the client's
 * request ("add new page").
 *
 * ── Two things this page does that the homepage sections do not ───────────
 *
 * It carries structured data. An FAQ is one of the few page types search
 * engines render richly, and doing that costs one JSON-LD block — so the
 * answers can appear directly in results rather than only as a link. The
 * schema is generated from the same FAQS array the page renders, so the two
 * can never drift apart.
 *
 * It reuses <Contact /> as its ending. The homepage's contact block is now the
 * site's footer in all but name (see the note in that component), so every
 * page ends with it rather than with a separate, thinner footer that would
 * have to be kept in sync.
 */
export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <Navbar />

      <main>
        {/* pt clears the fixed masthead — this page has no hero to sit under
            it, so the space has to be made explicitly. */}
        <section className="bg-cream pt-36 pb-20 text-charcoal md:pt-44 md:pb-24">
          <PageContainer>
            <SectionHeading
              eyebrow="FAQ"
              title={"Frequently asked\nquestions"}
              description="Everything we are usually asked before a first conversation. If your question is not here, write to us — we answer these ourselves."
              meta={`${FAQS.length} questions`}
              className="max-w-full"
            />

            <FaqList items={FAQS} className="mt-14 md:mt-20" />
          </PageContainer>
        </section>

        <Contact />
      </main>

      {/* Rendered as a plain script tag, not next/script: this must be in the
          server-rendered HTML for a crawler to see it at all. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
