"use client";

import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { RubiksCube } from "./RubiksCube";
import { Suspense } from "react";

interface SceneProps {
  progress: number;
}

// Simplified lighting for pencil sketch style - clear shadows for hatching
function Lights() {
  return (
    <>
      {/* Single main directional light for clear hatching shadows */}
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      {/* Weak ambient for fill (prevents pure black areas) */}
      <ambientLight intensity={0.3} />
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
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      style={{ background: "transparent" }}
      onCreated={({ gl }) => {
        const canvas = gl.domElement;
        canvas.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          console.warn("WebGL context lost - attempting recovery");
        });
        canvas.addEventListener("webglcontextrestored", () => {
          console.log("WebGL context restored");
        });
      }}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />

      <Suspense fallback={<LoadingFallback />}>
        <Lights />
        <RubiksCube progress={progress} size={2.4} />
        {/* Removed Environment preset - using simple lighting for sketch style */}
      </Suspense>

      {/* Optional: Enable orbit controls for debugging */}
      {/* <OrbitControls enableZoom={false} enablePan={false} /> */}
    </Canvas>
  );
}
