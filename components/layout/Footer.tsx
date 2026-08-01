/**
 * Footer — minimal, elegant sign-off.
 *
 * Large logo, navigation, contact and social icons on a dark ground. Server
 * component; the oversized wordmark is the anchor of the composition.
 *
 * TODO (future phases): add a large scroll-reveal on the wordmark and a
 *       "back to top" that uses the Lenis instance for a smooth glide.
 */
import { PageContainer, Logo } from "@/components/ui";
import { NAV_LINKS, SOCIAL_LINKS, SITE } from "@/constants";

export default function Footer() {
  const year = 2026; // Phase 1: static; wire to build-time date later.

  return (
    <footer className="bg-charcoal text-cream">
      <PageContainer className="py-16 md:py-20">
        {/* Top: nav + contact */}
        <div className="grid grid-cols-1 gap-12 border-b border-cream/10 pb-16 md:grid-cols-2">
          <nav aria-label="Footer">
            <ul className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="font-mono text-[11px] uppercase tracking-[0.2em] text-cream/70 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-3 md:items-end md:text-right">
            <a
              href={`mailto:${SITE.email}`}
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-cream/70 transition-colors hover:text-gold"
            >
              {SITE.email}
            </a>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-cream/70">
              {SITE.phone}
            </p>
            <p className="max-w-xs font-mono text-[11px] uppercase tracking-[0.16em] text-cream/45">
              {SITE.address}
            </p>
          </div>
        </div>

        {/* Large brand logo */}
        <div className="flex justify-center py-16 md:py-20">
          <Logo widthPx={640} className="w-[70vw] max-w-160" />
        </div>

        {/* Bottom: social + copyright */}
        <div className="flex flex-col-reverse items-start justify-between gap-6 border-t border-cream/10 pt-8 md:flex-row md:items-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cream/45">
            © {year} {SITE.name}. All rights reserved.
          </p>
          <ul className="flex items-center gap-6">
            {SOCIAL_LINKS.map((social) => {
              const Icon = social.icon;
              return (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="text-cream/70 transition-colors hover:text-gold"
                  >
                    <Icon size={18} />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </PageContainer>
    </footer>
  );
}
