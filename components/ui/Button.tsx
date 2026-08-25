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
  "group/btn relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full px-9 py-4 font-label transition-colors duration-500 ease-editorial focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS: Record<Variant, string> = {
  solid: "bg-emerald text-cream hover:bg-gold hover:text-emerald",
  /**
   * ── `outline` was invisible on hover, and it was arithmetic ─────────────
   *
   * It read `border border-current text-current hover:bg-current
   * hover:text-emerald`, and those last two cannot both be true. `bg-current`
   * resolves `currentColor` against the element's OWN `color`, and the rule
   * beside it sets that colour to emerald — so on hover the background became
   * emerald at the same instant the label did. The only place this variant is
   * used is the enquiry form, which sits on an emerald section: an emerald pill
   * with emerald type on an emerald ground, i.e. the control vanished mid-
   * transition and came back when the pointer left. That is the glitch.
   *
   * ── What it is now: the masthead's pill ─────────────────────────────────
   *
   * Rather than patch the colours, the variant takes the shape the site already
   * uses for exactly this job — the "Enquire" control in the bar (see
   * components/layout/Navbar.tsx). There is one CTA in the masthead and one at
   * the foot of the form, and they are the same instruction; they should be the
   * same object.
   *
   * The fill is a child element that scales up from the bottom edge (`::sweep`
   * below) instead of a `background-color` transition, so the button RESOLVES
   * into a solid rather than blinking into one — and because the fill is its
   * own element, its colour is set independently of the label's and the two
   * cannot collapse onto each other the way `currentColor` let them.
   *
   * `text-gold-soft` at rest and emerald on hover: the champagne cut reads on a
   * deep ground where plain gold does not, and once the gold fill has swept up
   * behind it the label has to go dark to stay legible.
   */
  outline:
    "border border-gold/50 text-gold-soft hover:text-emerald",
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

/**
 * The fill that sweeps up behind an `outline` button's label.
 *
 * `-z-10` with `overflow-hidden` on the button: it is clipped to the pill and
 * sits under the text without either of them needing a stacking context of
 * their own. `origin-bottom scale-y-0` → `scale-y-100` is a transform, so it
 * composites — nothing here invalidates layout or paints the label again.
 */
function Sweep() {
  return (
    <span
      aria-hidden
      className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-gold transition-transform duration-500 ease-editorial group-hover/btn:scale-y-100"
    />
  );
}

export default function Button(props: ButtonProps) {
  const variant = props.variant ?? "solid";
  const classes = cn(BASE, VARIANTS[variant], props.className);
  const sweep = variant === "outline" ? <Sweep /> : null;

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
        {sweep}
        {props.children}
      </SmoothLink>
    );
  }

  // Strip the presentational props so only valid <button> attributes spread on.
  // Renamed on the way out because `variant` is already resolved above; both
  // are `void`-ed rather than left unused, which is what this file already did.
  const {
    children,
    className: classNameProp,
    variant: variantProp,
    ...buttonProps
  } = props as ButtonAsButton;
  void classNameProp;
  void variantProp;
  return (
    <button className={classes} {...buttonProps}>
      {sweep}
      {children}
    </button>
  );
}
