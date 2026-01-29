"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, DoubleSide } from "three";
import { FACE_CONFIG } from "./CubeFace";

interface UnfoldingCubeProps {
  progress: number; // 0 = folded cube, 1 = unfolded cross
  size?: number;
}

export function UnfoldingCube({ progress, size = 2 }: UnfoldingCubeProps) {
  const groupRef = useRef<Group>(null);

  // Refs for each pivot point
  const topPivotRef = useRef<Group>(null);
  const bottomPivotRef = useRef<Group>(null);
  const leftPivotRef = useRef<Group>(null);
  const rightPivotRef = useRef<Group>(null);
  const backPivotRef = useRef<Group>(null);

  const half = size / 2;
  const thickness = 0.06;

  useFrame(() => {
    if (!groupRef.current) return;

    const easedProgress = easeInOutCubic(Math.max(0, Math.min(1, progress)));

    // foldAngle: 0 at progress=0 (cube closed), PI/2 at progress=1 (unfolded flat)
    const unfoldAngle = easedProgress * (Math.PI / 2);

    // Top face unfolds backward
    if (topPivotRef.current) {
      topPivotRef.current.rotation.x = unfoldAngle;
    }

    // Bottom face unfolds forward
    if (bottomPivotRef.current) {
      bottomPivotRef.current.rotation.x = -unfoldAngle;
    }

    // Left face unfolds to the left
    if (leftPivotRef.current) {
      leftPivotRef.current.rotation.y = -unfoldAngle;
    }

    // Right face unfolds to the right
    if (rightPivotRef.current) {
      rightPivotRef.current.rotation.y = unfoldAngle;
    }

    // Back face unfolds from the top (cascaded)
    if (backPivotRef.current) {
      backPivotRef.current.rotation.x = unfoldAngle;
    }

    // Gentle rotation of the whole assembly
    groupRef.current.rotation.y = Math.PI * 0.2 + easedProgress * 0.15;
    groupRef.current.rotation.x = Math.PI * 0.08;
  });

  return (
    <group ref={groupRef}>
      {/* FRONT FACE - Base, static */}
      <mesh position={[0, 0, half]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial
          color={FACE_CONFIG.front.color}
          metalness={0.85}
          roughness={0.25}
          emissive={FACE_CONFIG.front.emissive}
          emissiveIntensity={0.2}
          side={DoubleSide}
        />
      </mesh>

      {/* TOP FACE - Pivot at top edge of front face */}
      {/* When closed: horizontal on top of cube */}
      {/* When open: vertical, extending upward from front face */}
      <group position={[0, half, half]} ref={topPivotRef}>
        <mesh position={[0, 0, -half]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[size, size]} />
          <meshStandardMaterial
            color={FACE_CONFIG.top.color}
            metalness={0.85}
            roughness={0.25}
            emissive={FACE_CONFIG.top.emissive}
            emissiveIntensity={0.15}
            side={DoubleSide}
          />
        </mesh>

        {/* BACK FACE - Cascaded from top face, pivots at far edge of top */}
        <group position={[0, 0, -size]} ref={backPivotRef}>
          <mesh position={[0, 0, -half]}>
            <planeGeometry args={[size, size]} />
            <meshStandardMaterial
              color={FACE_CONFIG.back.color}
              metalness={0.85}
              roughness={0.25}
              emissive={FACE_CONFIG.back.emissive}
              emissiveIntensity={0.15}
              side={DoubleSide}
            />
          </mesh>
        </group>
      </group>

      {/* BOTTOM FACE - Pivot at bottom edge of front face */}
      <group position={[0, -half, half]} ref={bottomPivotRef}>
        <mesh position={[0, 0, -half]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[size, size]} />
          <meshStandardMaterial
            color={FACE_CONFIG.bottom.color}
            metalness={0.85}
            roughness={0.25}
            emissive={FACE_CONFIG.bottom.emissive}
            emissiveIntensity={0.15}
            side={DoubleSide}
          />
        </mesh>
      </group>

      {/* LEFT FACE - Pivot at left edge of front face */}
      <group position={[-half, 0, half]} ref={leftPivotRef}>
        <mesh position={[0, 0, -half]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[size, size]} />
          <meshStandardMaterial
            color={FACE_CONFIG.left.color}
            metalness={0.85}
            roughness={0.25}
            emissive={FACE_CONFIG.left.emissive}
            emissiveIntensity={0.15}
            side={DoubleSide}
          />
        </mesh>
      </group>

      {/* RIGHT FACE - Pivot at right edge of front face */}
      <group position={[half, 0, half]} ref={rightPivotRef}>
        <mesh position={[0, 0, -half]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[size, size]} />
          <meshStandardMaterial
            color={FACE_CONFIG.right.color}
            metalness={0.85}
            roughness={0.25}
            emissive={FACE_CONFIG.right.emissive}
            emissiveIntensity={0.15}
            side={DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
}

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
