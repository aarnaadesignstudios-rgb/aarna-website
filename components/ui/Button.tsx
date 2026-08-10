/**
 * Button — minimal luxury button / link.
 *
 * Renders as a <SmoothLink /> when `href` is provided, otherwise a <button>. Two quiet
 * variants; no heavy shadows, minimal rounding, generous letter-spacing.
 *
 * TODO (future phases): add a magnetic-hover / underline-sweep micro-interaction.
 */
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";
import SmoothLink from "./SmoothLink";

type Variant = "solid" | "outline";

/**
 * `font-label` — the same recipe every other small uppercase label on the site
 * uses. This was the one control on the page still set in the SANS at 12px/500
 * with 0.2em of tracking, which is why a button never quite matched the "Start
 * a conversation" link sitting a section above it. A button is a label with a
 * border around it; it should not be its own typeface.
 */
const BASE =
  "group/btn inline-flex items-center justify-center gap-3 rounded-full px-9 py-4 font-label transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS: Record<Variant, string> = {
  solid: "bg-emerald text-cream hover:bg-gold hover:text-emerald",
  outline: "border border-current text-current hover:bg-current hover:text-emerald",
};

interface CommonProps {
  children: ReactNode;
  className?: string;
  variant?: Variant;
}

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps & {
  href: string;
  target?: string;
  rel?: string;
};

type ButtonProps = ButtonAsButton | ButtonAsLink;

export default function Button(props: ButtonProps) {
  const classes = cn(BASE, VARIANTS[props.variant ?? "solid"], props.className);

  if ("href" in props && props.href) {
    // <SmoothLink />, not a bare <a>: every button on this site that points
    // somewhere points at a SECTION ("Enquire about a project" → #contact), and
    // a bare anchor answers that with a jump that fights Lenis — and does
    // nothing at all when the button is rendered on a page that has no such
    // section. That component knows the difference; see it for the four cases.
    return (
      <SmoothLink
        href={props.href}
        target={props.target}
        rel={props.rel}
        className={classes}
      >
        {props.children}
      </SmoothLink>
    );
  }

  // Strip the presentational props so only valid <button> attributes spread on.
  const { children, className, variant, ...buttonProps } =
    props as ButtonAsButton;
  void className;
  void variant;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
