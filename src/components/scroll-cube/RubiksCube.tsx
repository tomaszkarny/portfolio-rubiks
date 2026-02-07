"use client";

import React, { useRef, useMemo, useEffect, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Group,
  Vector3,
  PlaneGeometry,
  ShaderMaterial,
  BufferGeometry,
} from "three";
import { RoundedBoxGeometry } from "three-stdlib";
import { SketchMaterial } from "@/shaders/SketchMaterial";
import { seededRandom } from "@/utils/noise";
import type { AnimationRefs } from "./CubeBackground";

interface RubiksCubeProps {
  animationRefs: AnimationRefs;
  size?: number;
  mousePosition?: { x: number; y: number };
}

// Animation phase constants - 6 layer rotations + dramatic explosion
const QUIET_ZONE_END = 0.05;
const ROTATION_1_END = 0.12;
const ROTATION_2_END = 0.19;
const ROTATION_3_END = 0.26;
const ROTATION_4_END = 0.33;
const ROTATION_5_END = 0.40;
const ROTATION_6_END = 0.47;
const ANTICIPATION_PAUSE = 0.55;
const MINI_EXPLODE_END = 0.75;

// Classic Rubik's cube face colors
const RUBIKS_COLORS = {
  front: "#009b48",
  back: "#0046ad",
  left: "#ff5800",
  right: "#b71234",
  top: "#ffffff",
  bottom: "#ffd500",
  inner: "#1a1a1a",
};

// Phase definitions for 6 rotations
interface RotationPhase {
  start: number;
  end: number;
  axis: "x" | "y" | "z";
  layerValue: number;
  angle: number;
}

const PHASES: RotationPhase[] = [
  { start: QUIET_ZONE_END, end: ROTATION_1_END, axis: "y", layerValue: 1, angle: Math.PI / 2 },
  { start: ROTATION_1_END, end: ROTATION_2_END, axis: "x", layerValue: 1, angle: Math.PI / 2 },
  { start: ROTATION_2_END, end: ROTATION_3_END, axis: "z", layerValue: 1, angle: Math.PI / 2 },
  { start: ROTATION_3_END, end: ROTATION_4_END, axis: "y", layerValue: -1, angle: -Math.PI / 2 },
  { start: ROTATION_4_END, end: ROTATION_5_END, axis: "x", layerValue: -1, angle: -Math.PI / 2 },
  { start: ROTATION_5_END, end: ROTATION_6_END, axis: "z", layerValue: -1, angle: -Math.PI / 2 },
];

interface CubeletData {
  key: string;
  index: number;
  originalPosition: [number, number, number];
  colors: {
    front?: string;
    back?: string;
    left?: string;
    right?: string;
    top?: string;
    bottom?: string;
  };
  originalLayer: { x: number; y: number; z: number };
  tremor: { x: number; y: number; z: number };
  distanceFromCenter: number;
  isCorner: boolean;
  isEdge: boolean;
  velocityMultiplier: number;
}

interface CubeletState {
  currentLayer: { x: number; y: number; z: number };
  cumulativeRotation: { x: number; y: number; z: number };
  worldPosition: { x: number; y: number; z: number };
}

// Helper: Update layer coordinates after a rotation
function updateLayerAfterRotation(
  currentLayer: { x: number; y: number; z: number },
  axis: "x" | "y" | "z",
  angle: number
): { x: number; y: number; z: number } {
  const cos = Math.round(Math.cos(angle));
  const sin = Math.round(Math.sin(angle));

  if (axis === "y") {
    return {
      x: currentLayer.x * cos + currentLayer.z * sin,
      y: currentLayer.y,
      z: -currentLayer.x * sin + currentLayer.z * cos,
    };
  }
  if (axis === "x") {
    return {
      x: currentLayer.x,
      y: currentLayer.y * cos - currentLayer.z * sin,
      z: currentLayer.y * sin + currentLayer.z * cos,
    };
  }
  return {
    x: currentLayer.x * cos - currentLayer.y * sin,
    y: currentLayer.x * sin + currentLayer.y * cos,
    z: currentLayer.z,
  };
}

// Helper: Update world position after a rotation
function updateWorldPositionAfterRotation(
  worldPos: { x: number; y: number; z: number },
  axis: "x" | "y" | "z",
  angle: number
): { x: number; y: number; z: number } {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  if (axis === "y") {
    return {
      x: worldPos.x * cos + worldPos.z * sin,
      y: worldPos.y,
      z: -worldPos.x * sin + worldPos.z * cos,
    };
  }
  if (axis === "x") {
    return {
      x: worldPos.x,
      y: worldPos.y * cos - worldPos.z * sin,
      z: worldPos.y * sin + worldPos.z * cos,
    };
  }
  return {
    x: worldPos.x * cos - worldPos.y * sin,
    y: worldPos.x * sin + worldPos.y * cos,
    z: worldPos.z,
  };
}

// Easing functions
function easeOutQuart(x: number): number {
  return 1 - Math.pow(1 - x, 4);
}

function easeOutExpo(x: number): number {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

function easeInOutQuad(x: number): number {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

function easeOutBack(x: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

function easeOutQuad(x: number): number {
  return 1 - (1 - x) * (1 - x);
}

// Helper: get phase progress (inlined in useFrame for perf)
function getPhaseProgress(progress: number, start: number, end: number): number {
  if (progress < start) return 0;
  if (progress > end) return 1;
  return (progress - start) / (end - start);
}

// Helper: compute cubelet states for a given number of completed phases
function computeCubeletStates(phasesComplete: number, cubeletSize: number): Map<string, CubeletState> {
  const states = new Map<string, CubeletState>();

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const key = `${x}-${y}-${z}`;
        states.set(key, {
          currentLayer: { x, y, z },
          cumulativeRotation: { x: 0, y: 0, z: 0 },
          worldPosition: { x: x * cubeletSize, y: y * cubeletSize, z: z * cubeletSize },
        });
      }
    }
  }

  for (let phaseIdx = 0; phaseIdx < phasesComplete; phaseIdx++) {
    const phase = PHASES[phaseIdx];
    states.forEach((state, key) => {
      const layerCoord = state.currentLayer[phase.axis];
      if (layerCoord === phase.layerValue) {
        const newLayer = updateLayerAfterRotation(state.currentLayer, phase.axis, phase.angle);
        const newWorldPos = updateWorldPositionAfterRotation(state.worldPosition, phase.axis, phase.angle);
        const newRotation = { ...state.cumulativeRotation };
        if (phase.axis === "x") newRotation.x += phase.angle;
        else if (phase.axis === "y") newRotation.y += phase.angle;
        else if (phase.axis === "z") newRotation.z += phase.angle;
        states.set(key, { currentLayer: newLayer, cumulativeRotation: newRotation, worldPosition: newWorldPos });
      }
    });
  }

  return states;
}

// ============================================
// OPTIMIZED CUBELET - uses shared material
// ============================================
interface OptimizedCubeletProps {
  data: CubeletData;
  boxGeometry: BufferGeometry;
  material: ShaderMaterial;
  stickerGeometry: PlaneGeometry;
  halfSize: number;
}

const OptimizedCubelet = React.memo(function OptimizedCubelet({
  data,
  boxGeometry,
  material,
  stickerGeometry,
  halfSize,
}: OptimizedCubeletProps) {
  return (
    <group>
      <mesh geometry={boxGeometry} material={material} />
      {data.colors.front && (
        <mesh position={[0, 0, halfSize]} geometry={stickerGeometry} material={material} />
      )}
      {data.colors.back && (
        <mesh position={[0, 0, -halfSize]} rotation={[0, Math.PI, 0]} geometry={stickerGeometry} material={material} />
      )}
      {data.colors.left && (
        <mesh position={[-halfSize, 0, 0]} rotation={[0, -Math.PI / 2, 0]} geometry={stickerGeometry} material={material} />
      )}
      {data.colors.right && (
        <mesh position={[halfSize, 0, 0]} rotation={[0, Math.PI / 2, 0]} geometry={stickerGeometry} material={material} />
      )}
      {data.colors.top && (
        <mesh position={[0, halfSize, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={stickerGeometry} material={material} />
      )}
      {data.colors.bottom && (
        <mesh position={[0, -halfSize, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={stickerGeometry} material={material} />
      )}
    </group>
  );
});

export function RubiksCube({ animationRefs, size = 2.4, mousePosition = { x: 0, y: 0 } }: RubiksCubeProps) {
  const groupRef = useRef<Group>(null);
  const cubeletSize = size / 3;
  const gap = 0.06;

  // Refs for all 27 cubelet groups
  const cubeletGroupRefs = useRef<(Group | null)[]>(new Array(27).fill(null));

  // Interactivity refs
  const hoveredCubeletRef = useRef<number | null>(null);
  const clickedCubeletRef = useRef<number | null>(null);
  const clickAnimationRef = useRef<number>(0);

  // Track last phasesComplete to recompute cubeletStates only when phase changes
  const lastPhasesCompleteRef = useRef(0);
  const cubeletStatesRef = useRef<Map<string, CubeletState>>(computeCubeletStates(0, cubeletSize));

  // Single shared Sketch material (was 7 identical instances)
  const sharedMaterial = useMemo(() => new SketchMaterial(), []);

  const actualCubeletSize = cubeletSize - gap;
  const radius = actualCubeletSize * 0.08;
  const halfSize = actualCubeletSize / 2 + 0.001;

  // Shared RoundedBox geometry (was 27 separate ExtrudeGeometry instances)
  const sharedBoxGeometry = useMemo(() => {
    const geo = new RoundedBoxGeometry(actualCubeletSize, actualCubeletSize, actualCubeletSize, 2, radius);
    geo.computeVertexNormals();
    return geo;
  }, [actualCubeletSize, radius]);

  // Shared plane geometry for all stickers
  const stickerGeometry = useMemo(() => {
    const stickerSize = actualCubeletSize * 0.85;
    return new PlaneGeometry(stickerSize, stickerSize);
  }, [actualCubeletSize]);

  useEffect(() => {
    return () => {
      sharedMaterial.dispose();
      sharedBoxGeometry.dispose();
      stickerGeometry.dispose();
    };
  }, [sharedMaterial, sharedBoxGeometry, stickerGeometry]);

  // Reusable Vector3 objects
  const tempVectors = useRef({
    basePos: new Vector3(),
    anticipationOffset: new Vector3(),
    spiralOffset: new Vector3(),
    explodeOffset: new Vector3(),
  });

  // Generate all 27 cubelets (static data, never changes)
  const cubelets = useMemo(() => {
    const result: CubeletData[] = [];
    let index = 0;

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const colors: CubeletData["colors"] = {};
          if (z === 1) colors.front = RUBIKS_COLORS.front;
          if (z === -1) colors.back = RUBIKS_COLORS.back;
          if (x === -1) colors.left = RUBIKS_COLORS.left;
          if (x === 1) colors.right = RUBIKS_COLORS.right;
          if (y === 1) colors.top = RUBIKS_COLORS.top;
          if (y === -1) colors.bottom = RUBIKS_COLORS.bottom;

          const distanceFromCenter = Math.sqrt(x * x + y * y + z * z);
          const absSum = Math.abs(x) + Math.abs(y) + Math.abs(z);
          const isCorner = absSum === 3;
          const isEdge = absSum === 2;
          const velocityMultiplier = isCorner ? 1.4 : isEdge ? 1.15 : 0.85;

          const seed = index * 3;
          result.push({
            key: `${x}-${y}-${z}`,
            index,
            originalPosition: [x * cubeletSize, y * cubeletSize, z * cubeletSize],
            colors,
            originalLayer: { x, y, z },
            tremor: {
              x: seededRandom(seed) * 2 - 1,
              y: seededRandom(seed + 1) * 2 - 1,
              z: seededRandom(seed + 2) * 2 - 1,
            },
            distanceFromCenter,
            isCorner,
            isEdge,
            velocityMultiplier,
          });
          index++;
        }
      }
    }
    return result;
  }, [cubeletSize]);

  // ==========================================
  // ALL animation logic moved into useFrame
  // Reads progress from ref - ZERO React re-renders from scroll
  // ==========================================
  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const progress = animationRefs.progress.current;
    const t = clock.elapsedTime;
    const vecs = tempVectors.current;

    // Determine current phase info
    let activePhaseIndex = -1;
    let phasesComplete = 0;
    for (let i = 0; i < PHASES.length; i++) {
      const phase = PHASES[i];
      if (progress >= phase.end) {
        phasesComplete = i + 1;
      } else if (progress >= phase.start) {
        activePhaseIndex = i;
        break;
      }
    }

    // Only recompute cubelet states when phasesComplete changes (max 6 times total)
    if (phasesComplete !== lastPhasesCompleteRef.current) {
      lastPhasesCompleteRef.current = phasesComplete;
      cubeletStatesRef.current = computeCubeletStates(phasesComplete, cubeletSize);
    }

    const cubeletStates = cubeletStatesRef.current;

    // Active rotation for current phase
    let activeRotation: { axis: "x" | "y" | "z"; angle: number } | null = null;
    let activePhase: RotationPhase | null = null;

    if (activePhaseIndex >= 0) {
      activePhase = PHASES[activePhaseIndex];
      const phaseProgress = getPhaseProgress(progress, activePhase.start, activePhase.end);
      const easedProgress = easeOutQuart(phaseProgress);
      activeRotation = { axis: activePhase.axis, angle: easedProgress * activePhase.angle };
    }

    // Anticipation phase
    const anticipationProgress = getPhaseProgress(progress, ROTATION_6_END, ANTICIPATION_PAUSE);
    const compressionFactor = 1 - easeInOutQuad(anticipationProgress) * 0.08;
    const gapExpansion = easeOutQuad(anticipationProgress) * 0.12;

    // Explosion phase
    const miniExplodeProgress = easeOutBack(getPhaseProgress(progress, ANTICIPATION_PAUSE, MINI_EXPLODE_END));
    const fullExplodeProgress = easeOutExpo(getPhaseProgress(progress, MINI_EXPLODE_END, 1.0));
    const explodeProgress = miniExplodeProgress * 0.3 + fullExplodeProgress * 2.2;
    const spiralAngle = explodeProgress * Math.PI * 1.5;

    // Rotation damping during anticipation
    const rotationDamping =
      anticipationProgress > 0 && anticipationProgress < 1
        ? 1 - easeOutQuad(anticipationProgress) * 0.9
        : 1;

    // Idle breathing animation
    const idleIntensity = Math.max(0, 1 - progress * 4);
    const breatheX = Math.sin(t * 0.5) * 0.03 * idleIntensity;
    const breatheY = Math.cos(t * 0.3) * 0.04 * idleIntensity;
    const breatheZ = Math.sin(t * 0.4 + 0.5) * 0.02 * idleIntensity;
    const floatY = Math.sin(t * 0.7) * 0.02 * idleIntensity;
    const floatX = Math.cos(t * 0.5) * 0.015 * idleIntensity;

    // Overall cube rotation
    const baseRotationY = Math.PI * 0.2 + progress * Math.PI * 0.4 + floatY;
    const baseRotationX = Math.PI * 0.15 + Math.sin(progress * Math.PI * 2) * 0.15 + floatX;
    groupRef.current.rotation.y = baseRotationY * rotationDamping;
    groupRef.current.rotation.x = baseRotationX * rotationDamping;

    const maxDistance = 1.7320508075688772; // Math.sqrt(3)
    const needsTremor = anticipationProgress > 0 && anticipationProgress < 1;

    // Update all 27 cubelets
    for (let idx = 0; idx < cubelets.length; idx++) {
      const cubelet = cubelets[idx];
      const groupNode = cubeletGroupRefs.current[idx];
      if (!groupNode) continue;

      const state = cubeletStates.get(cubelet.key);
      if (!state) continue;

      const explosionDelay = 1 - cubelet.distanceFromCenter / maxDistance;
      const velocityMultiplier = cubelet.velocityMultiplier;

      vecs.basePos.set(state.worldPosition.x, state.worldPosition.y, state.worldPosition.z);

      const isInActiveLayer = activePhase && state.currentLayer[activePhase.axis] === activePhase.layerValue;

      let activeRotX = 0;
      let activeRotY = 0;
      let activeRotZ = 0;

      if (isInActiveLayer && activeRotation) {
        const cos = Math.cos(activeRotation.angle);
        const sin = Math.sin(activeRotation.angle);

        if (activeRotation.axis === "y") {
          const newX = vecs.basePos.x * cos + vecs.basePos.z * sin;
          const newZ = -vecs.basePos.x * sin + vecs.basePos.z * cos;
          vecs.basePos.x = newX;
          vecs.basePos.z = newZ;
          activeRotY = activeRotation.angle;
        } else if (activeRotation.axis === "x") {
          const newY = vecs.basePos.y * cos - vecs.basePos.z * sin;
          const newZ = vecs.basePos.y * sin + vecs.basePos.z * cos;
          vecs.basePos.y = newY;
          vecs.basePos.z = newZ;
          activeRotX = activeRotation.angle;
        } else if (activeRotation.axis === "z") {
          const newX = vecs.basePos.x * cos - vecs.basePos.y * sin;
          const newY = vecs.basePos.x * sin + vecs.basePos.y * cos;
          vecs.basePos.x = newX;
          vecs.basePos.y = newY;
          activeRotZ = activeRotation.angle;
        }
      }

      const totalRotX = state.cumulativeRotation.x + activeRotX;
      const totalRotY = state.cumulativeRotation.y + activeRotY;
      const totalRotZ = state.cumulativeRotation.z + activeRotZ;

      const delayedExplodeProgress = Math.max(
        0,
        (explodeProgress - explosionDelay * 0.3) / (1 - explosionDelay * 0.3)
      );

      const tumbleSpeed = delayedExplodeProgress * Math.PI * 1.8;
      const spiralTumbleOffset = cubelet.index * 0.15;

      const tumbleRotX = totalRotX + cubelet.originalLayer.z * tumbleSpeed * 0.7 +
        Math.sin(spiralAngle + spiralTumbleOffset) * delayedExplodeProgress * 0.5;
      const tumbleRotY = totalRotY + cubelet.originalLayer.x * tumbleSpeed * 0.5 +
        Math.cos(spiralAngle + spiralTumbleOffset) * delayedExplodeProgress * 0.4;
      const tumbleRotZ = totalRotZ +
        (cubelet.originalLayer.x + cubelet.originalLayer.y) * tumbleSpeed * 0.4 +
        delayedExplodeProgress * cubelet.distanceFromCenter * 0.3;

      vecs.anticipationOffset.set(
        state.currentLayer.x * gapExpansion,
        state.currentLayer.y * gapExpansion,
        state.currentLayer.z * gapExpansion
      );
      vecs.basePos.add(vecs.anticipationOffset);

      // Spiral explosion
      const layerAngle = Math.atan2(cubelet.originalLayer.z, cubelet.originalLayer.x);
      const layerRadius = Math.sqrt(cubelet.originalLayer.x ** 2 + cubelet.originalLayer.z ** 2);
      const spiralPhase = layerRadius * 0.3 + layerAngle * 0.15;
      const spiralDelay = spiralPhase * 0.12;
      const spiralizedProgress = Math.max(0, delayedExplodeProgress - spiralDelay) * 1.3;

      const spiralRadius = spiralizedProgress * 0.8;
      const spiralRotation = spiralAngle + cubelet.index * 0.4;

      vecs.spiralOffset.set(
        Math.cos(spiralRotation) * spiralRadius * Math.sign(cubelet.originalLayer.x || 0.1),
        Math.sin(spiralizedProgress * Math.PI * 0.5) * spiralRadius * 0.3 * cubelet.originalLayer.y,
        Math.sin(spiralRotation) * spiralRadius * Math.sign(cubelet.originalLayer.z || 0.1)
      );

      const explodeDistance = spiralizedProgress * 2.2 * velocityMultiplier;
      const orbitFactor = spiralizedProgress * 0.4;
      const orbitX = Math.sin(spiralAngle * 2 + cubelet.index) * orbitFactor;
      const orbitZ = Math.cos(spiralAngle * 2 + cubelet.index) * orbitFactor;

      vecs.explodeOffset.set(
        state.currentLayer.x * explodeDistance + orbitX,
        state.currentLayer.y * explodeDistance * 0.9 + spiralizedProgress * 0.15,
        state.currentLayer.z * explodeDistance + orbitZ
      );

      vecs.basePos.add(vecs.explodeOffset);
      vecs.basePos.add(vecs.spiralOffset);

      const heartbeatPulse = anticipationProgress > 0 && anticipationProgress < 1
        ? Math.sin(anticipationProgress * Math.PI * 2.5) * 0.04 : 0;
      const finalScale = compressionFactor + Math.abs(heartbeatPulse);

      let finalX = vecs.basePos.x;
      let finalY = vecs.basePos.y;
      let finalZ = vecs.basePos.z;

      if (needsTremor) {
        const intensity = anticipationProgress * 0.015;
        const freq = 15 + anticipationProgress * 25;
        const tFreq = t * freq;
        finalX += Math.sin(tFreq * cubelet.tremor.x) * intensity;
        finalY += Math.sin(tFreq * cubelet.tremor.y) * intensity;
        finalZ += Math.sin(tFreq * cubelet.tremor.z) * intensity;
      }

      // Cursor attraction
      const cursorInfluence = (1 - delayedExplodeProgress * 0.8) * cubelet.distanceFromCenter * 0.12;
      const cubeletPhase = cubelet.index * 0.3;
      const mouseInfluenceX = mousePosition.x * cursorInfluence;
      const mouseInfluenceY = mousePosition.y * cursorInfluence;

      finalX += mouseInfluenceX * (1 + Math.sin(t * 2 + cubeletPhase) * 0.1);
      finalY += mouseInfluenceY * (1 + Math.cos(t * 2 + cubeletPhase) * 0.1);
      finalZ += (mousePosition.x + mousePosition.y) * cursorInfluence * 0.15;

      // Breathing animation
      const cubeletBreathPhase = cubelet.index * 0.2;
      finalX += breatheX * Math.sin(t * 0.8 + cubeletBreathPhase) * state.currentLayer.x;
      finalY += breatheY * Math.cos(t * 0.6 + cubeletBreathPhase) * state.currentLayer.y;
      finalZ += breatheZ * Math.sin(t * 0.7 + cubeletBreathPhase) * state.currentLayer.z;

      // Hover/click effects
      const isHovered = hoveredCubeletRef.current === idx;
      const hoverScale = isHovered ? 1.12 : 1;

      const isClicked = clickedCubeletRef.current === idx;
      let clickRotation = 0;
      let clickBounce = 1;

      if (isClicked && clickAnimationRef.current < 1) {
        clickAnimationRef.current += 0.04;
        const animProgress = clickAnimationRef.current;
        clickRotation = Math.sin(animProgress * Math.PI * 2) * 0.5;
        clickBounce = 1 + Math.sin(animProgress * Math.PI) * 0.15;

        if (clickAnimationRef.current >= 1) {
          clickedCubeletRef.current = null;
          clickAnimationRef.current = 0;
        }
      }

      groupNode.position.set(finalX, finalY, finalZ);
      groupNode.rotation.set(
        tumbleRotX + (isClicked ? clickRotation : 0),
        tumbleRotY + (isClicked ? clickRotation * 0.5 : 0),
        tumbleRotZ
      );
      groupNode.scale.setScalar(finalScale * hoverScale * clickBounce);
    }
  });

  const handleCubeletClick = useCallback((e: { stopPropagation: () => void }, index: number) => {
    e.stopPropagation();
    clickedCubeletRef.current = index;
    clickAnimationRef.current = 0;
  }, []);

  const handlePointerOver = useCallback((e: { stopPropagation: () => void }, index: number) => {
    e.stopPropagation();
    hoveredCubeletRef.current = index;
    document.body.style.cursor = "pointer";
  }, []);

  const handlePointerOut = useCallback(() => {
    hoveredCubeletRef.current = null;
    document.body.style.cursor = "auto";
  }, []);

  // Pre-create event handler arrays to avoid inline closures defeating React.memo
  const pointerOverHandlers = useMemo(
    () => cubelets.map((_, idx) => (e: { stopPropagation: () => void }) => handlePointerOver(e, idx)),
    [cubelets, handlePointerOver]
  );
  const clickHandlers = useMemo(
    () => cubelets.map((_, idx) => (e: { stopPropagation: () => void }) => handleCubeletClick(e, idx)),
    [cubelets, handleCubeletClick]
  );

  return (
    <group ref={groupRef}>
      {cubelets.map((cubelet, idx) => (
        <group
          key={cubelet.key}
          ref={(el) => { cubeletGroupRefs.current[idx] = el; }}
          onPointerOver={pointerOverHandlers[idx]}
          onPointerOut={handlePointerOut}
          onClick={clickHandlers[idx]}
        >
          <OptimizedCubelet
            data={cubelet}
            boxGeometry={sharedBoxGeometry}
            material={sharedMaterial}
            stickerGeometry={stickerGeometry}
            halfSize={halfSize}
          />
        </group>
      ))}
    </group>
  );
}
