"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import {
  InstancedMesh,
  Object3D,
  SphereGeometry,
  MeshBasicMaterial,
  Color,
  AdditiveBlending,
} from "three";
import type { AnimationRefs } from "./CubeBackground";

interface ParticlesProps {
  count?: number;
  animationRefs: AnimationRefs;
  isMobile?: boolean;
}

// Mobile detection
function useIsMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

const PARTICLE_CONFIG = {
  baseSize: 0.015,
  sizeVariation: 0.01,
  spread: 12,
  baseOpacity: 0.15,
  driftSpeed: 0.02,
  scrollReactivity: 0.5,
};

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function Particles({
  count: propCount,
  animationRefs,
  isMobile: propIsMobile,
}: ParticlesProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const tempObject = useMemo(() => new Object3D(), []);

  const detectedMobile = useIsMobile();
  const isMobile = propIsMobile ?? detectedMobile;
  const count = propCount ?? (isMobile ? 250 : 500);

  const particleData = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      const seed = i * 10;
      data.push({
        x: (seededRandom(seed) - 0.5) * PARTICLE_CONFIG.spread,
        y: (seededRandom(seed + 1) - 0.5) * PARTICLE_CONFIG.spread,
        z: (seededRandom(seed + 2) - 0.5) * PARTICLE_CONFIG.spread * 0.5 - 2,
        vx: (seededRandom(seed + 3) - 0.5) * PARTICLE_CONFIG.driftSpeed,
        vy: (seededRandom(seed + 4) - 0.5) * PARTICLE_CONFIG.driftSpeed,
        vz: (seededRandom(seed + 5) - 0.5) * PARTICLE_CONFIG.driftSpeed * 0.5,
        scale: PARTICLE_CONFIG.baseSize + seededRandom(seed + 6) * PARTICLE_CONFIG.sizeVariation,
        phase: seededRandom(seed + 7) * Math.PI * 2,
        speed: 0.5 + seededRandom(seed + 8) * 0.5,
        randomOffsetX: seededRandom(seed + 9) - 0.5,
        randomOffsetY: seededRandom(seed + 10) - 0.5,
      });
    }
    return data;
  }, [count]);

  const geometry = useMemo(() => new SphereGeometry(1, 6, 6), []);
  const material = useMemo(() => {
    return new MeshBasicMaterial({
      color: new Color("#7a756e"),
      transparent: true,
      opacity: PARTICLE_CONFIG.baseOpacity,
      blending: AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const time = clock.elapsedTime;
    // Read velocity from ref instead of prop
    const scrollVelocity = animationRefs.scrollVelocity.current;
    const velocityBoost = Math.abs(scrollVelocity) * PARTICLE_CONFIG.scrollReactivity;
    const wrapBound = PARTICLE_CONFIG.spread * 0.6;

    for (let i = 0; i < particleData.length; i++) {
      const particle = particleData[i];
      const driftX = Math.sin(time * particle.speed + particle.phase) * 0.3;
      const driftY = Math.cos(time * particle.speed * 0.7 + particle.phase) * 0.3;
      const driftZ = Math.sin(time * particle.speed * 0.5 + particle.phase * 2) * 0.2;

      const turbulence = velocityBoost * (1 + Math.sin(time * 10 + particle.phase) * 0.5);

      const x = particle.x + driftX + particle.vx * time + turbulence * particle.randomOffsetX * 0.1;
      const y = particle.y + driftY + particle.vy * time + turbulence * particle.randomOffsetY * 0.1;
      const z = particle.z + driftZ + particle.vz * time;

      const wrappedX = ((x + wrapBound) % (wrapBound * 2)) - wrapBound;
      const wrappedY = ((y + wrapBound) % (wrapBound * 2)) - wrapBound;

      const scaleMultiplier = 1 + velocityBoost * 0.5 + Math.sin(time * 2 + particle.phase) * 0.1;

      tempObject.position.set(wrappedX, wrappedY, z);
      tempObject.scale.setScalar(particle.scale * scaleMultiplier);
      tempObject.updateMatrix();

      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      frustumCulled={false}
    />
  );
}
