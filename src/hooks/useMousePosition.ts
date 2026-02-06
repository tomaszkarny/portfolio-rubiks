"use client";

import { useEffect, useRef } from "react";

interface MousePosition {
  x: number;
  y: number;
  rawX: number;
  rawY: number;
}

// Smoothed mouse position refs for Three.js usage
// Returns refs instead of state to avoid triggering React re-renders every frame
// Lerping should be done in useFrame inside Canvas for sync with Three.js animation loop
export interface SmoothedMouseRefs {
  targetRef: React.MutableRefObject<MousePosition>;
  currentRef: React.MutableRefObject<MousePosition>;
  smoothing: number;
}

export function useSmoothedMousePosition(smoothing = 0.1): SmoothedMouseRefs {
  const targetRef = useRef<MousePosition>({ x: 0, y: 0, rawX: 0, rawY: 0 });
  const currentRef = useRef<MousePosition>({ x: 0, y: 0, rawX: 0, rawY: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Mutate existing ref object instead of replacing (avoids GC pressure)
      const target = targetRef.current;
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = -(e.clientY / window.innerHeight) * 2 + 1;
      target.rawX = e.clientX;
      target.rawY = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;

      const target = targetRef.current;
      target.x = (touch.clientX / window.innerWidth) * 2 - 1;
      target.y = -(touch.clientY / window.innerHeight) * 2 + 1;
      target.rawX = touch.clientX;
      target.rawY = touch.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return { targetRef, currentRef, smoothing };
}
