"use client";

import React, { CSSProperties, useEffect, useRef, useState } from "react";

type RevealVariant = "rise" | "left" | "right" | "scale" | "glow";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  threshold?: number;
  variant?: RevealVariant;
}

export default function ScrollReveal({
  children,
  className,
  delay = 0,
  duration = 780,
  threshold = 0.18,
  variant = "rise",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const currentRef = ref.current;

    if (!currentRef || typeof window === "undefined") {
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      const reducedMotionFrame = window.requestAnimationFrame(() => {
        setIsVisible(true);
        setIsReady(true);
      });

      return () => {
        window.cancelAnimationFrame(reducedMotionFrame);
      };
    }

    const isInitiallyInView =
      currentRef.getBoundingClientRect().top <= window.innerHeight * 0.9;

    const revealFrame = window.requestAnimationFrame(() => {
      setIsVisible(isInitiallyInView);
      setIsReady(true);
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    if (!isInitiallyInView) {
      observer.observe(currentRef);
    }

    return () => {
      window.cancelAnimationFrame(revealFrame);
      observer.disconnect();
    };
  }, [threshold]);

  const style = {
    "--axis-reveal-delay": `${delay}ms`,
    "--axis-reveal-duration": `${duration}ms`,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      className={`axis-reveal ${className ?? ""}`.trim()}
      data-ready={isReady ? "true" : "false"}
      data-state={isVisible ? "visible" : "hidden"}
      data-variant={variant}
      style={style}
    >
      {children}
    </div>
  );
}
