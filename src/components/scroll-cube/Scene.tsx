"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { RubiksCube } from "./RubiksCube";
import { PerspectiveGrid } from "./PerspectiveGrid";
import { Particles } from "./Particles";
import { Suspense, useRef } from "react";
import { Group } from "three";
import {
  EffectComposer,
  Bloom,
  Vignette,
  ToneMapping,
  SMAA,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useSmoothedMousePosition, SmoothedMouseRefs } from "@/hooks";
import type { AnimationRefs } from "./CubeBackground";

interface SceneProps {
  animationRefs: AnimationRefs;
}

// Cursor parallax settings
const PARALLAX_INTENSITY = 0.15;

// Detect mobile for conditional post-processing
const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

function Lights() {
  return (
    <>
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <ambientLight intensity={0.3} />
    </>
  );
}

function PostProcessing() {
  return (
    <EffectComposer>
      <SMAA />
      <Bloom
        luminanceThreshold={0.7}
        luminanceSmoothing={0.9}
        intensity={0.25}
        mipmapBlur
      />
      <Vignette darkness={0.25} offset={0.5} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
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

// Cube group reads refs inside useFrame - zero React re-renders from scroll
interface CubeGroupProps {
  animationRefs: AnimationRefs;
  mouseRefs: SmoothedMouseRefs;
}

function CubeGroup({ animationRefs, mouseRefs }: CubeGroupProps) {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;

    const { currentRef, targetRef, smoothing } = mouseRefs;

    // Lerp toward target
    currentRef.current.x += (targetRef.current.x - currentRef.current.x) * smoothing;
    currentRef.current.y += (targetRef.current.y - currentRef.current.y) * smoothing;

    // Apply parallax rotation
    groupRef.current.rotation.y = currentRef.current.x * PARALLAX_INTENSITY;
    groupRef.current.rotation.x = -currentRef.current.y * PARALLAX_INTENSITY * 0.5;

    // Read cube position from ref (updated by Framer Motion springs, no React re-render)
    const pos = animationRefs.cubePosition.current;
    groupRef.current.position.set(pos.x, pos.y, pos.z);
    groupRef.current.scale.setScalar(pos.scale);
  });

  return (
    <group ref={groupRef}>
      <RubiksCube
        animationRefs={animationRefs}
        size={2.4}
        mousePosition={mouseRefs.currentRef.current}
      />
    </group>
  );
}

export function Scene({ animationRefs }: SceneProps) {
  // Mouse position refs - no RAF loop, no setState, lerping in useFrame
  const mouseRefs = useSmoothedMousePosition(0.08);

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{
        antialias: false,
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

        <Particles count={400} animationRefs={animationRefs} />

        <PerspectiveGrid animationRefs={animationRefs} />

        <CubeGroup
          animationRefs={animationRefs}
          mouseRefs={mouseRefs}
        />
      </Suspense>

      {!isMobile && <PostProcessing />}
    </Canvas>
  );
}
