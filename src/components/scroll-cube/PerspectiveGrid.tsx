"use client";

import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { seededRandom, curlNoise } from "@/utils/noise";
import type { AnimationRefs } from "./CubeBackground";
import type { SmoothedMouseRefs } from "@/hooks";

interface PerspectiveGridProps {
  animationRefs: AnimationRefs;
  mouseRefs: SmoothedMouseRefs;
  isMobile?: boolean;
}

function useIsMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

// Generate a single flow curve by following curl noise
function generateFlowCurve(
  startX: number,
  startY: number,
  startZ: number,
  steps: number,
  stepSize: number,
  noiseScale: number,
  seed: number
): Float32Array {
  const positions = new Float32Array(steps * 3);
  let x = startX;
  let y = startY;
  const z = startZ;

  for (let i = 0; i < steps; i++) {
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const [cx, cy] = curlNoise(
      x * noiseScale + seed * 10,
      y * noiseScale + seed * 7
    );

    const wobbleX = Math.sin(i * 0.3 + seed * 5) * 0.02;
    const wobbleY = Math.cos(i * 0.25 + seed * 3) * 0.02;

    x += (cx * stepSize + wobbleX);
    y += (cy * stepSize + wobbleY);
  }

  return positions;
}

// Flow line colors
const FLOW_COLORS = [
  new THREE.Color("#8b7765"),
  new THREE.Color("#7a6b5a"),
  new THREE.Color("#a89f8f"),
  new THREE.Color("#6e5f50"),
  new THREE.Color("#9b8e7e"),
];

// Static metadata for flow lines (not mutated in useFrame)
interface FlowLineMeta {
  baseOpacity: number;
  revealOffset: number;
  z: number;
  baseX: number;
  baseY: number;
}

// Click ripple state
interface ClickRipple {
  time: number;
  x: number;
  y: number;
}

export function PerspectiveGrid({ animationRefs, mouseRefs, isMobile: propIsMobile }: PerspectiveGridProps) {
  const detectedMobile = useIsMobile();
  const isMobile = propIsMobile ?? detectedMobile;

  const flowGroupRef = useRef<THREE.Group>(null);
  const depthPointsRef = useRef<THREE.Points>(null);
  const clickRippleRef = useRef<ClickRipple>({ time: 0, x: 0, y: 0 });

  const numLines = isMobile ? 15 : 30;
  const stepsPerLine = isMobile ? 40 : 60;

  // Listen for clicks to trigger ripple effect
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      clickRippleRef.current = { time: performance.now() / 1000, x, y };
    };

    window.addEventListener("click", handleClick, { passive: true });
    return () => window.removeEventListener("click", handleClick);
  }, []);

  // Flow line geometries + materials (immutable identities for rendering)
  const flowLineObjects = useMemo(() => {
    const objects: THREE.Line[] = [];

    for (let i = 0; i < numLines; i++) {
      const seed = i * 7.3;
      const angle = seededRandom(seed) * Math.PI * 2;
      const dist = 2 + seededRandom(seed + 1) * 10;
      const startX = Math.cos(angle) * dist;
      const startY = Math.sin(angle) * dist * 0.6 - 1;
      const z = -2 + seededRandom(seed + 2) * -18;

      const positions = generateFlowCurve(
        startX, startY, z,
        stepsPerLine,
        0.15 + seededRandom(seed + 3) * 0.1,
        0.2 + seededRandom(seed + 4) * 0.15,
        seed
      );

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));

      const color = FLOW_COLORS[i % FLOW_COLORS.length];

      const mat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        linewidth: 1,
      });

      objects.push(new THREE.Line(geo, mat));
    }

    return objects;
  }, [numLines, stepsPerLine]);

  // Static metadata about each flow line (read-only in useFrame)
  const flowLineMeta = useMemo(() => {
    const meta: FlowLineMeta[] = [];
    for (let i = 0; i < numLines; i++) {
      const seed = i * 7.3;
      const angle = seededRandom(seed) * Math.PI * 2;
      const dist = 2 + seededRandom(seed + 1) * 10;
      meta.push({
        baseOpacity: 0.12 + seededRandom(seed + 5) * 0.18,
        revealOffset: seededRandom(seed + 6),
        z: -2 + seededRandom(seed + 2) * -18,
        baseX: Math.cos(angle) * dist,
        baseY: Math.sin(angle) * dist * 0.6 - 1,
      });
    }
    return meta;
  }, [numLines]);

  // Depth particles geometry
  const depthGeometry = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const sizes: number[] = [];
    const numParticles = isMobile ? 60 : 120;

    for (let i = 0; i < numParticles; i++) {
      const seed = i * 13 + 500;
      const x = (seededRandom(seed) - 0.5) * 40;
      const y = (seededRandom(seed + 1) - 0.5) * 20;
      const z = seededRandom(seed + 2) * 35 - 18;
      positions.push(x, y, z);

      const colorVar = 0.08 + seededRandom(seed + 3) * 0.12;
      colors.push(
        0.55 + colorVar,
        0.48 + colorVar * 0.8,
        0.40 + colorVar * 0.6
      );

      const depthFactor = (z + 18) / 35;
      sizes.push(0.08 + depthFactor * 0.12);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));

    return geo;
  }, [isMobile]);

  // Depth particle velocities (read-only in useFrame)
  const depthVelocities = useMemo(() => {
    const velocities: { vx: number; vy: number; vz: number }[] = [];
    const numParticles = isMobile ? 60 : 120;

    for (let i = 0; i < numParticles; i++) {
      const seed = i * 13 + 500;
      const x = (seededRandom(seed) - 0.5) * 40;
      const y = (seededRandom(seed + 1) - 0.5) * 20;
      const z = seededRandom(seed + 2) * 35 - 18;
      const depthFactor = (z + 18) / 35;

      const [cx, cy] = curlNoise(x * 0.1, y * 0.1);
      velocities.push({
        vx: cx * 0.003,
        vy: cy * 0.003,
        vz: 0.005 + depthFactor * 0.015,
      });
    }

    return velocities;
  }, [isMobile]);

  // Dispose on unmount
  useEffect(() => {
    return () => {
      for (const obj of flowLineObjects) {
        obj.geometry.dispose();
        (obj.material as THREE.LineBasicMaterial).dispose();
      }
      depthGeometry.dispose();
    };
  }, [flowLineObjects, depthGeometry]);

  // Single useFrame for all animations
  useFrame(({ clock }) => {
    const progress = animationRefs.progress.current;
    const mouseX = mouseRefs.currentRef.current.x;
    const mouseY = mouseRefs.currentRef.current.y;
    const now = clock.elapsedTime;

    // Click ripple - decays over 1 second
    const ripple = clickRippleRef.current;
    const rippleAge = now - ripple.time;
    const rippleActive = rippleAge < 1.0 && ripple.time > 0;
    const rippleRadius = rippleActive ? rippleAge * 8.0 : 0;
    const rippleStrength = rippleActive ? (1.0 - rippleAge) * 2.0 : 0;

    // Flow lines: access via group ref children (avoids mutating useMemo result)
    if (flowGroupRef.current) {
      const children = flowGroupRef.current.children;
      for (let i = 0; i < children.length; i++) {
        const meta = flowLineMeta[i];
        if (!meta) continue;

        const child = children[i] as THREE.Line;
        const mat = child.material as THREE.LineBasicMaterial;

        // Some lines visible from start, others reveal with scroll
        const revealPoint = meta.revealOffset * 0.3;
        const reveal = Math.min(1, Math.max(0, (progress - revealPoint) / 0.25));
        // Base visibility of 0.3 even before scroll reveal
        const visibility = 0.3 + reveal * 0.7;
        mat.opacity = meta.baseOpacity * visibility;

        // Base Z position with scroll
        const baseZ = meta.z + progress * 2;
        child.position.z = baseZ;

        // Depth-based parallax: deeper lines shift more from mouse movement
        const parallaxFactor = Math.abs(meta.z) / 20; // 0 to 1 based on depth
        const parallaxX = mouseX * parallaxFactor * 0.5;
        const parallaxY = mouseY * parallaxFactor * 0.3;

        // Mouse repulsion: push lines away from cursor
        const repelRadius = 3.0;
        const repelForce = 1.5;
        // Approximate mouse world position at this line's depth
        // NDC (-1,1) maps roughly to world coords at this depth
        const mouseWorldX = mouseX * 6;
        const mouseWorldY = mouseY * 4;
        const dx = meta.baseX - mouseWorldX;
        const dy = meta.baseY - mouseWorldY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let repelX = 0;
        let repelY = 0;
        if (dist < repelRadius && dist > 0.01) {
          const strength = (1 - dist / repelRadius) * repelForce;
          repelX = (dx / dist) * strength;
          repelY = (dy / dist) * strength;
        }

        // Click ripple: expanding ring pushes lines outward
        let rippleX = 0;
        let rippleY = 0;
        if (rippleActive) {
          const rippleWorldX = ripple.x * 6;
          const rippleWorldY = ripple.y * 4;
          const rdx = meta.baseX - rippleWorldX;
          const rdy = meta.baseY - rippleWorldY;
          const rDist = Math.sqrt(rdx * rdx + rdy * rdy);
          // Ring effect: strongest at the expanding edge
          const ringDist = Math.abs(rDist - rippleRadius);
          if (ringDist < 2.0 && rDist > 0.01) {
            const ringStrength = (1.0 - ringDist / 2.0) * rippleStrength;
            rippleX = (rdx / rDist) * ringStrength;
            rippleY = (rdy / rDist) * ringStrength;
          }
        }

        child.position.x = parallaxX + repelX + rippleX;
        child.position.y = parallaxY + repelY + rippleY;
      }
    }

    // Depth particles: curl noise drift
    if (depthPointsRef.current) {
      const positions = depthPointsRef.current.geometry.attributes.position;
      const array = positions.array as Float32Array;

      for (let i = 0; i < depthVelocities.length; i++) {
        const vel = depthVelocities[i];
        array[i * 3] += vel.vx;
        array[i * 3 + 1] += vel.vy;
        array[i * 3 + 2] += vel.vz;

        if (array[i * 3 + 2] > 18) {
          array[i * 3 + 2] = -18;
        }
        if (Math.abs(array[i * 3]) > 22) {
          array[i * 3] *= -0.5;
        }
        if (Math.abs(array[i * 3 + 1]) > 12) {
          array[i * 3 + 1] *= -0.5;
        }
      }

      positions.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Organic flow lines */}
      <group ref={flowGroupRef}>
        {flowLineObjects.map((obj, i) => (
          <primitive key={i} object={obj} />
        ))}
      </group>

      {/* Depth particles following curl noise paths */}
      <points ref={depthPointsRef} geometry={depthGeometry}>
        <pointsMaterial
          vertexColors
          size={0.14}
          transparent
          opacity={0.30}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
