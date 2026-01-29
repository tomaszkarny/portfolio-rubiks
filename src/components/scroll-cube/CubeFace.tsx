"use client";

import { useRef } from "react";
import { Mesh, Group } from "three";
import { MeshStandardMaterial } from "three";

interface CubeFaceProps {
  position: [number, number, number];
  rotation: [number, number, number];
  pivotPosition: [number, number, number];
  pivotRotation: [number, number, number];
  color: string;
  emissiveColor?: string;
  metalness?: number;
  roughness?: number;
  size?: number;
}

export function CubeFace({
  position,
  rotation,
  pivotPosition,
  pivotRotation,
  color,
  emissiveColor,
  metalness = 0.9,
  roughness = 0.2,
  size = 2,
}: CubeFaceProps) {
  const meshRef = useRef<Mesh>(null);
  const pivotRef = useRef<Group>(null);

  return (
    <group position={pivotPosition} rotation={pivotRotation} ref={pivotRef}>
      <mesh position={position} rotation={rotation} ref={meshRef}>
        <boxGeometry args={[size, size, 0.05]} />
        <meshStandardMaterial
          color={color}
          metalness={metalness}
          roughness={roughness}
          emissive={emissiveColor || color}
          emissiveIntensity={0.15}
        />
      </mesh>
    </group>
  );
}

// Face configurations for each side of the cube
export const FACE_CONFIG = {
  front: {
    color: "#FFD700", // Gold
    emissive: "#FFD700",
  },
  back: {
    color: "#1a1a2e", // Dark metal
    emissive: "#2a2a4e",
  },
  left: {
    color: "#C0C0C0", // Silver
    emissive: "#808080",
  },
  right: {
    color: "#C0C0C0", // Silver
    emissive: "#808080",
  },
  top: {
    color: "#2d2d44", // Dark gradient
    emissive: "#1a1a2e",
  },
  bottom: {
    color: "#2d2d44", // Dark gradient
    emissive: "#1a1a2e",
  },
};
