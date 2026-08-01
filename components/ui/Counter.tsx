"use client";

/**
 * Counter — number that counts up from 0 when it scrolls into view.
 *
 * A small premium touch for stats / credibility figures.
 *
 * @example
 *   <Counter to={18} suffix="+" />
 */
import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";

interface CounterProps {
  to: number;
  suffix?: string;
  prefix?: string;
  /** Count duration in seconds. */
  duration?: number;
  className?: string;
}

export default function Counter({
  to,
  suffix = "",
  prefix = "",
  duration = 2,
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [inView, to, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {Math.round(value)}
      {suffix}
    </span>
  );
}
