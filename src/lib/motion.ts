"use client";

import { useReducedMotion } from "framer-motion";

export function useMotionConfig() {
  const reduce = useReducedMotion();
  return {
    transition: reduce ? { duration: 0 } : undefined,
    stagger: reduce ? 0 : 0.08,
  };
}

export const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const containerVariants = (stagger = 0.08) => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: 0.1 } },
});
