"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";

export const gentleEase = [0.22, 1, 0.36, 1] as const;

export function SmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
      anchors: true,
      prevent: (node) => node.hasAttribute("data-lenis-prevent"),
      virtualScroll: () => document.body.style.overflow !== "hidden",
    });
    const toTop = () => lenis.scrollTo(0, { duration: 1.1 });
    window.addEventListener("impulsevidya:top", toTop);
    return () => {
      window.removeEventListener("impulsevidya:top", toTop);
      lenis.destroy();
    };
  }, [reduced]);

  return null;
}

export function ScrollScene({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 28 });
  const y = useTransform(progress, [0, 1], [22, -22]);
  return (
    <div ref={ref} className={`iv-scroll-scene ${className}`}>
      <motion.div style={{ y: reduced ? 0 : y }}>{children}</motion.div>
    </div>
  );
}
