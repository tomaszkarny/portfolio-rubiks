"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import {
  InstancedMesh,
  Matrix4,
  SphereGeometry,
  MeshBasicMaterial,
  Color,
  AdditiveBlending,
} from "three";
import { seededRandom, curlNoise } from "@/utils/noise";
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
  baseSize: 0.018,
  sizeVariation: 0.012,
  spread: 11,
  baseOpacity: 0.18,
  scrollReactivity: 0.5,
  curlScale: 0.15,
  curlStrength: 0.4,
};

export function Particles({
  count: propCount,
  animationRefs,
  isMobile: propIsMobile,
}: ParticlesProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const tempMatrix = useMemo(() => new Matrix4(), []);

  const detectedMobile = useIsMobile();
  const isMobile = propIsMobile ?? detectedMobile;
  const count = propCount ?? (isMobile ? 180 : 300);

  const particleData = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      const seed = i * 10;
      data.push({
        x: (seededRandom(seed) - 0.5) * PARTICLE_CONFIG.spread,
        y: (seededRandom(seed + 1) - 0.5) * PARTICLE_CONFIG.spread,
        z: (seededRandom(seed + 2) - 0.5) * PARTICLE_CONFIG.spread * 0.5 - 2,
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

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const time = clock.elapsedTime;
    const scrollVelocity = animationRefs.scrollVelocity.current;
    const velocityBoost = Math.abs(scrollVelocity) * PARTICLE_CONFIG.scrollReactivity;
    const wrapBound = PARTICLE_CONFIG.spread * 0.6;
    const curlScale = PARTICLE_CONFIG.curlScale;
    const curlStrength = PARTICLE_CONFIG.curlStrength;

    for (let i = 0; i < particleData.length; i++) {
      const particle = particleData[i];

      // Curl noise flow field - coherent stream patterns
      const sampleX = (particle.x + time * 0.05) * curlScale;
      const sampleY = (particle.y + time * 0.03) * curlScale;
      const [cx, cy] = curlNoise(sampleX, sampleY, 2);

      const driftX = cx * curlStrength + Math.sin(time * particle.speed * 0.3 + particle.phase) * 0.15;
      const driftY = cy * curlStrength + Math.cos(time * particle.speed * 0.2 + particle.phase) * 0.15;
      const driftZ = Math.sin(time * particle.speed * 0.15 + particle.phase * 2) * 0.12;

      const turbulence = velocityBoost * (1 + Math.sin(time * 10 + particle.phase) * 0.5);

      const x = particle.x + driftX + turbulence * particle.randomOffsetX * 0.15;
      const y = particle.y + driftY + turbulence * particle.randomOffsetY * 0.15;
      const z = particle.z + driftZ;

      const wrappedX = ((x + wrapBound) % (wrapBound * 2)) - wrapBound;
      const wrappedY = ((y + wrapBound) % (wrapBound * 2)) - wrapBound;

      const scaleMultiplier = 1 + velocityBoost * 0.5 + Math.sin(time * 2 + particle.phase) * 0.1;

      // Direct matrix composition — no quaternion overhead (particles have no rotation)
      const s = particle.scale * scaleMultiplier;
      tempMatrix.makeScale(s, s, s);
      tempMatrix.setPosition(wrappedX, wrappedY, z);

      meshRef.current!.setMatrixAt(i, tempMatrix);
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
