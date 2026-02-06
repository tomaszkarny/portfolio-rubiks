"use client";

import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { AnimationRefs } from "./CubeBackground";

interface PerspectiveGridProps {
  animationRefs: AnimationRefs;
  isMobile?: boolean;
}

function useIsMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

// Seeded random number generator
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// ==========================================
// OPTIMIZATION: Single merged component with one useFrame
// All sub-components (RadialLines, DepthRings, HorizonLines, DepthParticles)
// merged into parent to eliminate 4 separate useFrame subscribers
// ==========================================

export function PerspectiveGrid({ animationRefs, isMobile: propIsMobile }: PerspectiveGridProps) {
  const detectedMobile = useIsMobile();
  const isMobile = propIsMobile ?? detectedMobile;

  // Refs for all animated elements
  const radialLinesRef = useRef<THREE.LineSegments>(null);
  const ringsGroupRef = useRef<THREE.Group>(null);
  const horizonGroupRef = useRef<THREE.Group>(null);
  const depthPointsRef = useRef<THREE.Points>(null);

  // Radial lines geometry
  const radialGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const points: number[] = [];
    const vanishZ = -30;
    const vanishY = -2;
    const numLines = isMobile ? 16 : 32;
    const spreadNear = 30;
    const nearZ = 10;

    for (let i = 0; i < numLines; i++) {
      const angle = (i / numLines) * Math.PI * 2;
      const startX = Math.cos(angle) * spreadNear;
      const startY = Math.sin(angle) * spreadNear * 0.4 + vanishY;
      points.push(startX, startY, nearZ);
      points.push(0, vanishY, vanishZ);
    }

    geo.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    return geo;
  }, [isMobile]);

  // Ring data
  const rings = useMemo(() => {
    const allRings = [
      { z: 4, radius: 14, opacity: 0.12, speed: 1.0 },
      { z: 1, radius: 11, opacity: 0.10, speed: 0.8 },
      { z: -2, radius: 9, opacity: 0.09, speed: 0.6 },
      { z: -5, radius: 7, opacity: 0.07, speed: 0.5 },
      { z: -8, radius: 5.5, opacity: 0.06, speed: 0.4 },
      { z: -12, radius: 4, opacity: 0.05, speed: 0.3 },
      { z: -16, radius: 3, opacity: 0.04, speed: 0.2 },
      { z: -20, radius: 2, opacity: 0.03, speed: 0.15 },
      { z: -25, radius: 1.2, opacity: 0.02, speed: 0.1 },
    ];
    return isMobile ? allRings.filter((_, i) => i % 2 === 0) : allRings;
  }, [isMobile]);

  // Horizon line data
  const horizonLines = useMemo(() => {
    const positions: { y: number; z: number; width: number; opacity: number; speed: number }[] = [];
    const depths = isMobile ? [-20, -10, -3, 3, 8] : [-25, -20, -15, -10, -6, -3, 0, 3, 6, 8];
    for (const z of depths) {
      const distanceFactor = (z + 25) / 33;
      positions.push({
        y: -2 + distanceFactor * 0.6,
        z,
        width: 4 + distanceFactor * 25,
        opacity: 0.04 + distanceFactor * 0.08,
        speed: 0.1 + distanceFactor * 0.6,
      });
    }
    return positions;
  }, [isMobile]);

  // Depth particles
  const { depthGeometry, depthSpeeds } = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const sizes: number[] = [];
    const particleSpeeds: number[] = [];
    const numParticles = isMobile ? 75 : 150;

    for (let i = 0; i < numParticles; i++) {
      const seed = i * 10;
      const x = (seededRandom(seed) - 0.5) * 50;
      const y = (seededRandom(seed + 1) - 0.5) * 25;
      const z = seededRandom(seed + 2) * 40 - 20;
      positions.push(x, y, z);

      const colorVariation = 0.1 + seededRandom(seed + 3) * 0.15;
      colors.push(0.6 + colorVariation, 0.55 + colorVariation * 0.8, 0.48 + colorVariation * 0.6);

      const depthFactor = (z + 20) / 40;
      sizes.push(0.06 + depthFactor * 0.1);
      particleSpeeds.push(0.1 + depthFactor * 0.7);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));

    return { depthGeometry: geo, depthSpeeds: particleSpeeds };
  }, [isMobile]);

  // Dispose geometries on unmount
  useEffect(() => {
    return () => {
      radialGeometry.dispose();
      depthGeometry.dispose();
    };
  }, [radialGeometry, depthGeometry]);

  // ==========================================
  // SINGLE useFrame for all grid animations
  // ==========================================
  useFrame(() => {
    const progress = animationRefs.progress.current;

    // Radial lines
    if (radialLinesRef.current) {
      radialLinesRef.current.position.z = progress * 4;
      radialLinesRef.current.rotation.z = progress * 0.08;
    }

    // Depth rings
    if (ringsGroupRef.current) {
      const children = ringsGroupRef.current.children;
      for (let i = 0; i < children.length; i++) {
        const ring = rings[i];
        if (ring) {
          children[i].position.z = ring.z + progress * ring.speed * 6;
        }
      }
    }

    // Horizon lines
    if (horizonGroupRef.current) {
      const children = horizonGroupRef.current.children;
      for (let i = 0; i < children.length; i++) {
        const line = horizonLines[i];
        if (line) {
          children[i].position.z = line.z + progress * line.speed * 5;
        }
      }
    }

    // Depth particles
    if (depthPointsRef.current) {
      const positions = depthPointsRef.current.geometry.attributes.position;
      const array = positions.array as Float32Array;

      for (let i = 0; i < depthSpeeds.length; i++) {
        array[i * 3 + 2] += depthSpeeds[i] * 0.012;
        if (array[i * 3 + 2] > 20) {
          array[i * 3 + 2] = -20;
        }
      }

      positions.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Radial lines */}
      <lineSegments ref={radialLinesRef} geometry={radialGeometry}>
        <lineBasicMaterial color="#a89f8f" transparent opacity={0.18} linewidth={1} />
      </lineSegments>

      {/* Depth rings */}
      <group ref={ringsGroupRef}>
        {rings.map((ring, i) => (
          <mesh key={i} position={[0, -1, ring.z]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[ring.radius - 0.04, ring.radius, 72]} />
            <meshBasicMaterial color="#8b7765" transparent opacity={ring.opacity} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>

      {/* Horizon lines */}
      <group ref={horizonGroupRef}>
        {horizonLines.map((line, i) => (
          <mesh key={i} position={[0, line.y, line.z]}>
            <planeGeometry args={[line.width, 0.025]} />
            <meshBasicMaterial color="#7a6b5a" transparent opacity={line.opacity} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>

      {/* Depth particles */}
      <points ref={depthPointsRef} geometry={depthGeometry}>
        <pointsMaterial vertexColors size={0.12} transparent opacity={0.35} sizeAttenuation />
      </points>
    </group>
  );
}
