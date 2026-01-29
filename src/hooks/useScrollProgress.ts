"use client";

import { useScroll, useTransform, MotionValue } from "framer-motion";

export function useScrollProgress(): MotionValue<number> {
  const { scrollYProgress } = useScroll();
  // Map first 85% of scroll to full animation (0 → 1) for extended, dramatic pacing
  return useTransform(scrollYProgress, [0, 0.85], [0, 1]);
}

export function useScrollProgressValue(): {
  progress: MotionValue<number>;
  scrollYProgress: MotionValue<number>;
} {
  const { scrollYProgress } = useScroll();
  const progress = useTransform(scrollYProgress, [0, 0.85], [0, 1]);
  return { progress, scrollYProgress };
}
