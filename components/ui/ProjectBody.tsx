/**
 * ProjectBody — the studio's write-up, rendered.
 *
 * The `body` field on a project is Portable Text: Sanity's block format, which
 * is an ARRAY of typed blocks rather than a string of HTML. That is the whole
 * reason to use it. A `text` field would have meant the studio typing plain
 * paragraphs and this component guessing at structure; a rich-text field
 * storing HTML would have meant whatever the editor emitted landing in the
 * page, styles and all, with no say in how any of it looks.
 *
 * Here every block arrives named — "this is a heading", "this is a quote",
 * "this is a photograph" — and this file decides what each one becomes. So the
 * studio writes, and the page still looks like the site.
 *
 * ── What is deliberately NOT offered ─────────────────────────────────────
 *
 * The schema exposes four styles and two lists, and no more. H1 is absent
 * because the page already has one and a second would be a second title. Font
 * sizes, colours and alignment are absent because they are decisions this
 * stylesheet has already made — an editor who can set type in red is an editor
 * who will eventually be asked why the page looks wrong.
 *
 * `components` maps block name → element, so an unrecognised block is skipped
 * rather than crashing the page. That matters: the schema will grow, and a
 * project saved with a block type an older deploy has never heard of should
 * lose that block, not the page.
 */
import {
  PortableText,
  type PortableTextComponents,
  type PortableTextBlock,
} from "@portabletext/react";

import Media from "./Media";
import { resolvePhoto } from "@/sanity/lib/image";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      // No `max-w` here — the measure is set once on the column in the page, so
      // that a paragraph, a list and a quote all share one edge. Setting it per
      // block is how you end up with a body whose left margin moves.
      <p className="mt-5 text-charcoal/75 first:mt-0">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="mt-14 font-serif text-3xl leading-[1.15] tracking-tight text-emerald first:mt-0 md:text-4xl">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-10 font-serif text-2xl leading-[1.2] tracking-tight text-emerald first:mt-0">
        {children}
      </h3>
    ),
    /* The rule is on the LEFT and gold, which is the same mark the section
       headings and the spine use — so a pulled quote reads as part of the
       document's own furniture rather than as a widget. */
    blockquote: ({ children }) => (
      <blockquote className="mt-10 border-l border-gold/60 pl-6 font-serif text-[1.35rem] leading-[1.45] text-emerald italic md:pl-8 md:text-[1.6rem]">
        {children}
      </blockquote>
    ),
  },

  list: {
    bullet: ({ children }) => (
      <ul className="mt-5 list-none space-y-2.5 pl-0">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="mt-5 list-none space-y-2.5 pl-0 [counter-reset:item]">
        {children}
      </ol>
    ),
  },
  listItem: {
    /* A gold rule as the bullet rather than a disc: the site has no discs
       anywhere else, and a hairline is the mark it does use. */
    bullet: ({ children }) => (
      <li className="relative pl-6 text-charcoal/75 before:absolute before:top-[0.72em] before:left-0 before:h-px before:w-3 before:bg-gold">
        {children}
      </li>
    ),
    number: ({ children }) => (
      <li className="relative pl-8 text-charcoal/75 [counter-increment:item] before:absolute before:top-0 before:left-0 before:font-label before:text-gold-ink before:content-[counter(item,decimal-leading-zero)]">
        {children}
      </li>
    ),
  },

  marks: {
    strong: ({ children }) => (
      <strong className="font-medium text-charcoal">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ children, value }) => {
      const href = typeof value?.href === "string" ? value.href : "";
      const external = /^https?:/i.test(href);
      return (
        <a
          href={href}
          // Anything the studio pastes is a foreign origin as far as this page
          // is concerned, so external links get the full safe-target treatment
          // rather than being trusted because an editor typed them.
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="text-emerald underline decoration-gold/60 underline-offset-4 transition-colors duration-300 hover:decoration-gold"
        >
          {children}
        </a>
      );
    },
  },

  types: {
    /**
     * A photograph dropped into the middle of the write-up.
     *
     * It breaks the measure on purpose — the text column is narrow for reading
     * and a picture held to that width would be a postage stamp — so this is
     * pulled wider than its container at `md` and up.
     */
    image: ({ value }) => {
      const photo = resolvePhoto(value);
      if (!photo) return null;
      return (
        <figure className="mt-12 md:-mx-12 lg:-mx-20">
          <div className="relative aspect-16/10 w-full overflow-hidden rounded-xl bg-mist">
            <Media
              src={photo.src}
              alt={photo.alt}
              objectPosition={photo.objectPosition}
              sizes="(max-width: 768px) 100vw, 60vw"
            />
          </div>
          {value?.caption && (
            <figcaption className="mt-3 font-label text-charcoal/50">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },

  /* An empty body is a supported state — the studio can publish a project
     before it has been written up — so this renders nothing rather than an
     empty column with margins. */
  unknownType: () => null,
  unknownBlockStyle: ({ children }) => (
    <p className="mt-5 text-charcoal/75">{children}</p>
  ),
};

export default function ProjectBody({ value }: { value?: unknown[] }) {
  if (!Array.isArray(value) || value.length === 0) return null;
  return (
    <PortableText value={value as PortableTextBlock[]} components={components} />
  );
}
