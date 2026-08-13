/**
 * Marquee — infinite horizontal brand strip.
 *
 * Scrolls a sequence of brand words separated by the gold phoenix mark. Two
 * duplicated tracks translate by -50% for a seamless loop; pauses on hover.
 * A quietly premium, editorial divider between sections.
 *
 * Server component — pure CSS animation (see .animate-marquee in globals.css).
 *
 * @example
 *   <Marquee items={["Architecture", "Interiors", "Landscape"]} />
 */
import Mark from "./Mark";
import { cn } from "@/utils/cn";

type Tone = "emerald" | "mist" | "charcoal";

const TONE: Record<Tone, string> = {
  emerald: "bg-emerald text-cream",
  mist: "bg-mist text-charcoal",
  charcoal: "bg-charcoal text-cream",
};

interface MarqueeProps {
  items: string[];
  tone?: Tone;
  className?: string;
  /** Seconds for one full loop (larger = slower). */
  durationSec?: number;
}

export default function Marquee({
  items,
  tone = "emerald",
  className,
  durationSec = 34,
}: MarqueeProps) {
  return (
    <div
      className={cn(
        "marquee-group relative overflow-hidden border-y border-current/10 py-6",
        TONE[tone],
        className
      )}
      style={{ ["--marquee-duration" as string]: `${durationSec}s` }}
    >
      <div className="flex w-max animate-marquee">
        {[0, 1].map((track) => (
          <ul
            key={track}
            aria-hidden={track === 1}
            className="flex shrink-0 items-center"
          >
            {items.map((item, i) => (
              <li key={i} className="flex shrink-0 items-center">
                <span className="px-8 font-serif text-2xl tracking-tight md:text-3xl">
                  {item}
                </span>
                {/* Gold phoenix mark as the separator. */}
                <Mark size={32} className="opacity-90" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
