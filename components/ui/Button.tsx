/**
 * Button — minimal luxury button / link.
 *
 * Renders as an <a> when `href` is provided, otherwise a <button>. Two quiet
 * variants; no heavy shadows, minimal rounding, generous letter-spacing.
 *
 * TODO (future phases): add a magnetic-hover / underline-sweep micro-interaction.
 */
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

type Variant = "solid" | "outline";

const BASE =
  "group/btn inline-flex items-center justify-center gap-3 rounded-full px-9 py-4 text-xs font-medium uppercase tracking-[0.2em] transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-50";

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
    return (
      <a
        href={props.href}
        target={props.target}
        rel={props.rel}
        className={classes}
      >
        {props.children}
      </a>
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
