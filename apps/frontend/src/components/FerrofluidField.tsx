"use client";

import React, { useEffect, useRef } from "react";

// Structure: base coordinates in percent, sizes in pixels, and colors.
// rx & ry determine the organic float path radius.
// speed controls the rate of float oscillation.
const NODES = [
  { baseLeft: 10, baseTop: 16, size: 125, color: "rgba(20, 50, 240, 0.85)", speed: 0.0006, rx: 38, ry: 45 },
  { baseLeft: 29, baseTop: 20, size: 90, color: "rgba(30, 60, 230, 0.8)", speed: 0.0008, rx: 28, ry: 35 },
  { baseLeft: 16, baseTop: 40, size: 150, color: "rgba(10, 30, 200, 0.74)", speed: 0.0004, rx: 48, ry: 55 },
  { baseLeft: 42, baseTop: 45, size: 105, color: "rgba(40, 70, 245, 0.82)", speed: 0.0007, rx: 32, ry: 40 },
  { baseLeft: 12, baseTop: 68, size: 135, color: "rgba(15, 35, 180, 0.78)", speed: 0.0005, rx: 42, ry: 50 },
  { baseLeft: 34, baseTop: 72, size: 95, color: "rgba(30, 55, 220, 0.76)", speed: 0.0009, rx: 24, ry: 32 },
  { baseLeft: 46, baseTop: 26, size: 80, color: "rgba(20, 40, 210, 0.84)", speed: 0.0007, rx: 28, ry: 28 },
];

export default function FerrofluidField() {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Listen to mouse coordinates on the parent element to avoid pointer-events blockages
    const parent = container.parentElement;
    if (!parent) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseEnter = () => {
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    parent.addEventListener("mousemove", handleMouseMove);
    parent.addEventListener("mouseenter", handleMouseEnter);
    parent.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      parent.removeEventListener("mousemove", handleMouseMove);
      parent.removeEventListener("mouseenter", handleMouseEnter);
      parent.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    // Keep track of smooth interpolated values for each node to simulate liquid inertias
    const dynamics = NODES.map(() => ({
      x: 0,
      y: 0,
      scale: 1,
    }));

    const update = () => {
      const container = containerRef.current;
      if (!container) return;

      const width = container.clientWidth;
      const height = container.clientHeight;
      const time = Date.now();

      NODES.forEach((node, index) => {
        const domNode = nodeRefs.current[index];
        if (!domNode) return;

        // Convert base percentage coordinate to absolute pixels
        const basePxX = (node.baseLeft / 100) * width;
        const basePxY = (node.baseTop / 100) * height;

        // Time-based organic hover waves
        const floatX = Math.sin(time * node.speed + index * 1.5) * node.rx;
        const floatY = Math.cos(time * node.speed * 0.85 + index * 2.2) * node.ry;

        let targetX = basePxX + floatX;
        let targetY = basePxY + floatY;
        let targetScale = 1;

        // If mouse is within the parent container area, calculate magnetic pulls
        if (mouseRef.current.active) {
          const mouseX = mouseRef.current.x;
          const mouseY = mouseRef.current.y;

          const diffX = mouseX - targetX;
          const diffY = mouseY - targetY;
          const dist = Math.sqrt(diffX * diffX + diffY * diffY);

          // E.g., attract nodes within a 340px radius
          const maxPullDist = 340;
          if (dist < maxPullDist) {
            const pullForce = (1 - dist / maxPullDist) * 0.62; // Stronger near center
            targetX += diffX * pullForce;
            targetY += diffY * pullForce;

            // Liquid deformation/bulge when magnetically pulled
            targetScale = 1 + pullForce * 0.42;
          }
        }

        // Apply smooth spring-like easing to positions and scale
        const lerpFactor = 0.07;
        dynamics[index].x += (targetX - basePxX - dynamics[index].x) * lerpFactor;
        dynamics[index].y += (targetY - basePxY - dynamics[index].y) * lerpFactor;
        dynamics[index].scale += (targetScale - dynamics[index].scale) * lerpFactor;

        // Apply direct style updates for maximum render performance (60fps+)
        const posX = dynamics[index].x;
        const posY = dynamics[index].y;
        const scale = dynamics[index].scale;

        domNode.style.transform = `translate3d(${posX}px, ${posY}px, 0) scale(${scale})`;
      });

      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Background theme-coordinated gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(20,50,240,0.12),transparent_22%),radial-gradient(circle_at_40%_65%,rgba(10,30,200,0.06),transparent_28%),linear-gradient(180deg,rgba(10,12,15,0.2),rgba(8,9,10,0.85))]" />

      {/* Contrast/Blur metaball container */}
      <div className="absolute inset-0 opacity-92 [filter:contrast(160)_blur(18px)]">
        {NODES.map((node, index) => (
          <span
            ref={(el) => {
              nodeRefs.current[index] = el;
            }}
            key={index}
            className="axis-ferrofluid-node absolute rounded-full"
            style={{
              left: `${node.baseLeft}%`,
              top: `${node.baseTop}%`,
              width: `${node.size}px`,
              height: `${node.size}px`,
              backgroundColor: node.color,
              animation: "none", // Disable static CSS keyframe animation
            }}
          />
        ))}
      </div>

      {/* Shimmer/Highlights */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(40,70,245,0.18),transparent_12%),radial-gradient(circle_at_42%_45%,rgba(30,60,230,0.14),transparent_14%)] opacity-70 mix-blend-screen" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,12,15,0.1),rgba(10,12,15,0.5)_70%,rgba(10,12,15,0.92))]" />
    </div>
  );
}
