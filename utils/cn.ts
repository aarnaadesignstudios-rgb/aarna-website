/**
 * cn — tiny className joiner.
 *
 * Filters out falsy values so conditional classes read cleanly:
 *   cn("base", isActive && "active", error ? "text-red" : undefined)
 *
 * Intentionally dependency-free. If class-conflict resolution becomes necessary
 * later, swap this for `clsx` + `tailwind-merge` without changing call sites.
 */
export type ClassValue = string | number | false | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
