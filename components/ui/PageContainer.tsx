/**
 * PageContainer — horizontal layout guardrails.
 *
 * Centres content and applies the max content width + responsive gutters used
 * across the entire site. Every section pours its content through this so the
 * left/right rhythm stays perfectly consistent.
 */
import type { ElementType, ReactNode } from "react";
import { cn } from "@/utils/cn";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  /** Render as a different element (e.g. "header", "footer"). Defaults to div. */
  as?: ElementType;
}

export default function PageContainer({
  children,
  className,
  as: Tag = "div",
}: PageContainerProps) {
  return (
    <Tag className={cn("mx-auto w-full max-w-[1440px] px-6 md:px-10 lg:px-16", className)}>
      {children}
    </Tag>
  );
}
