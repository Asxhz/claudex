"use client";

import { useEffect, useRef, useState } from "react";

type Stat = {
  label: string;
  value: number;
  suffix: string;
};

const stats: Stat[] = [
  { label: "Benchmarks Run", value: 12000, suffix: "+" },
  { label: "Agents Compared", value: 3, suffix: "" },
  { label: "Developers", value: 847, suffix: "" },
  { label: "Uptime", value: 98, suffix: "%" },
];

function animateCount(
  start: number,
  end: number,
  duration: number,
  onUpdate: (v: number) => void,
) {
  const startTime = performance.now();

  function tick(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (end - start) * eased);
    onUpdate(current);
    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

function StatItem({ stat }: { stat: Stat }) {
  const [display, setDisplay] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = stat.value <= 10 ? 600 : 1400;
          animateCount(0, stat.value, duration, setDisplay);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated, stat.value]);

  const formatted =
    display >= 1000 ? display.toLocaleString() : display.toString();

  return (
    <div ref={ref} className="text-center px-6 py-4">
      <p className="text-[32px] md:text-[40px] font-bold text-[#e7e9ea] tabular-nums tracking-tight leading-none">
        {formatted}
        {stat.suffix}
      </p>
      <p className="text-[12px] text-[#536471] mt-2 uppercase tracking-[0.12em]">
        {stat.label}
      </p>
    </div>
  );
}

export default function CounterSection() {
  return (
    <section className="border-y border-white/[0.06]">
      <div className="max-w-4xl mx-auto px-4 py-10 flex items-center justify-center">
        <div className="flex items-center divide-x divide-white/[0.06]">
          {stats.map((stat) => (
            <StatItem key={stat.label} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
