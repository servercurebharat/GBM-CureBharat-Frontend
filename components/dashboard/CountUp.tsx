'use client';

import { useEffect, useState } from 'react';

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  formatter?: (val: number) => string;
}

export default function CountUp({ end, duration = 2000, prefix = '', suffix = '', formatter }: CountUpProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function (easeOutExpo)
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      const currentCount = Math.floor(easeProgress * end);
      setCount(currentCount);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  const displayValue = formatter ? formatter(count) : count.toLocaleString();

  return (
    <span>{prefix}{displayValue}{suffix}</span>
  );
}
