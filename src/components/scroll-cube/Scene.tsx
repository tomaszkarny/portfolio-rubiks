"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { SRGBColorSpace } from "three";
import { RubiksCube } from "./RubiksCube";
import { Suspense } from "react";

interface SceneProps {
  progress: number;
}

function Lights() {
  return (
    <>
      {/* Ambient light for base illumination */}
      <ambientLight intensity={0.4} />

      {/* Main directional lights for better cube visibility */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
      />
      <directionalLight
        position={[-5, 3, -5]}
        intensity={0.5}
      />

      {/* Soft fill light from below */}
      <pointLight
        position={[0, -5, 0]}
        color="#ffffff"
        intensity={0.3}
        distance={20}
      />

      {/* Accent lights for depth */}
      <pointLight
        position={[-4, 2, 4]}
        color="#ffffff"
        intensity={0.5}
        distance={15}
      />
      <pointLight
        position={[4, 2, 4]}
        color="#ffffff"
        intensity={0.5}
        distance={15}
      />
    </>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#333" wireframe />
    </mesh>
  );
}

export function Scene({ progress }: SceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]} // PERFORMANCE: Limit DPR to max 2x on Retina displays
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        outputColorSpace: SRGBColorSpace, // PERFORMANCE: Explicit color space
      }}
      style={{ background: "transparent" }}
    >
      {/* PERFORMANCE: Tighter frustum for better Z-buffer precision */}
      <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} near={0.5} far={50} />

      <Suspense fallback={<LoadingFallback />}>
        <Lights />
        <RubiksCube progress={progress} size={2.4} />
        <Environment preset="studio" />
      </Suspense>

      {/* Optional: Enable orbit controls for debugging */}
      {/* <OrbitControls enableZoom={false} enablePan={false} /> */}
    </Canvas>
  );
}
