"use client";

import { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Group,
  Vector3,
  PlaneGeometry,
  ShaderMaterial,
} from "three";
import { RoundedBox } from "@react-three/drei";
import { SketchMaterial } from "@/shaders/SketchMaterial";

interface RubiksCubeProps {
  progress: number; // 0 = assembled cube, 1 = fully exploded
  size?: number;
}

// Animation phase constants - 6 layer rotations + dramatic explosion
const QUIET_ZONE_END = 0.05;
const ROTATION_1_END = 0.12; // Top layer (Y axis)
const ROTATION_2_END = 0.19; // Right layer (X axis)
const ROTATION_3_END = 0.26; // Front layer (Z axis)
const ROTATION_4_END = 0.33; // Bottom layer (Y axis)
const ROTATION_5_END = 0.40; // Left layer (X axis)
const ROTATION_6_END = 0.47; // Back layer (Z axis)
const ANTICIPATION_PAUSE = 0.55;
const MINI_EXPLODE_END = 0.75;

// Classic Rubik's cube face colors
const RUBIKS_COLORS = {
  front: "#009b48", // Green
  back: "#0046ad", // Blue
  left: "#ff5800", // Orange
  right: "#b71234", // Red
  top: "#ffffff", // White
  bottom: "#ffd500", // Yellow
  inner: "#1a1a1a", // Black (inner cube)
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
  // Pre-calculated static values for performance
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

// Face types for stickers
type FaceType = "front" | "back" | "left" | "right" | "top" | "bottom";
const FACE_TYPES: FaceType[] = ["front", "back", "left", "right", "top", "bottom"];

// ============================================
// OPTIMIZED CUBELET - uses shared materials
// ============================================
interface OptimizedCubeletProps {
  data: CubeletData;
  cubeletSize: number;
  radius: number;
  innerMaterial: ShaderMaterial;
  stickerMaterials: Record<FaceType, ShaderMaterial>;
  stickerGeometry: PlaneGeometry;
}

function OptimizedCubelet({
  data,
  cubeletSize,
  radius,
  innerMaterial,
  stickerMaterials,
  stickerGeometry,
}: OptimizedCubeletProps) {
  const halfSize = cubeletSize / 2 + 0.001;
  const stickerSize = cubeletSize * 0.85;

  return (
    <group>
      {/* Main cube body */}
      <RoundedBox
        args={[cubeletSize, cubeletSize, cubeletSize]}
        radius={radius}
        smoothness={2}
        material={innerMaterial}
      />

      {/* Stickers - rendered as children of cubelet group */}
      {data.colors.front && (
        <mesh
          position={[0, 0, halfSize]}
          geometry={stickerGeometry}
          material={stickerMaterials.front}
        />
      )}
      {data.colors.back && (
        <mesh
          position={[0, 0, -halfSize]}
          rotation={[0, Math.PI, 0]}
          geometry={stickerGeometry}
          material={stickerMaterials.back}
        />
      )}
      {data.colors.left && (
        <mesh
          position={[-halfSize, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          geometry={stickerGeometry}
          material={stickerMaterials.left}
        />
      )}
      {data.colors.right && (
        <mesh
          position={[halfSize, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          geometry={stickerGeometry}
          material={stickerMaterials.right}
        />
      )}
      {data.colors.top && (
        <mesh
          position={[0, halfSize, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          geometry={stickerGeometry}
          material={stickerMaterials.top}
        />
      )}
      {data.colors.bottom && (
        <mesh
          position={[0, -halfSize, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          geometry={stickerGeometry}
          material={stickerMaterials.bottom}
        />
      )}
    </group>
  );
}

export function RubiksCube({ progress, size = 2.4 }: RubiksCubeProps) {
  const groupRef = useRef<Group>(null);
  const cubeletSize = size / 3;
  const gap = 0.06;

  // Refs for all 27 cubelet groups
  const cubeletGroupRefs = useRef<(Group | null)[]>(new Array(27).fill(null));

  // ==========================================
  // OPTIMIZATION 1: Shared Sketch materials (7 total)
  // ==========================================
  const sharedMaterials = useMemo(() => {
    // All materials use the same pencil sketch style (monochromatic)
    const createSketchMaterial = () => {
      const mat = new SketchMaterial();
      // Cream paper, dark sepia ink - already set as defaults
      return mat;
    };

    return {
      inner: createSketchMaterial(),
      front: createSketchMaterial(),
      back: createSketchMaterial(),
      left: createSketchMaterial(),
      right: createSketchMaterial(),
      top: createSketchMaterial(),
      bottom: createSketchMaterial(),
    };
  }, []);

  // Shared plane geometry for all stickers
  const stickerGeometry = useMemo(() => {
    const stickerSize = (cubeletSize - gap) * 0.85;
    return new PlaneGeometry(stickerSize, stickerSize);
  }, [cubeletSize, gap]);

  // ==========================================
  // OPTIMIZATION: Dispose materials/geometry on unmount
  // ==========================================
  useEffect(() => {
    return () => {
      // Dispose all shared sketch materials
      Object.values(sharedMaterials).forEach((mat) => mat.dispose());
      // Dispose shared geometry
      stickerGeometry.dispose();
    };
  }, [sharedMaterials, stickerGeometry]);

  // ==========================================
  // OPTIMIZATION 2: Reusable Vector3 objects
  // ==========================================
  const tempVectors = useRef({
    basePos: new Vector3(),
    anticipationOffset: new Vector3(),
    spiralOffset: new Vector3(),
    explodeOffset: new Vector3(),
  });


  // Track completed phases to update cubelet states
  const [completedPhases, setCompletedPhases] = useState<number>(0);

  // Generate all 27 cubelets with their positions and colors
  // Pre-calculate static values that don't change during animation
  const cubelets = useMemo(() => {
    const result: CubeletData[] = [];
    let index = 0;
    const maxDistance = Math.sqrt(3); // Pre-calculate for normalization

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

          // Pre-calculate static explosion properties
          const distanceFromCenter = Math.sqrt(x * x + y * y + z * z);
          const absSum = Math.abs(x) + Math.abs(y) + Math.abs(z);
          const isCorner = absSum === 3;
          const isEdge = absSum === 2;
          const velocityMultiplier = isCorner ? 1.4 : isEdge ? 1.15 : 0.85;

          result.push({
            key: `${x}-${y}-${z}`,
            index,
            originalPosition: [x * cubeletSize, y * cubeletSize, z * cubeletSize],
            colors,
            originalLayer: { x, y, z },
            tremor: {
              x: Math.random() * 2 - 1,
              y: Math.random() * 2 - 1,
              z: Math.random() * 2 - 1,
            },
            // Store pre-calculated values
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

  // Initialize cubelet states
  const [cubeletStates, setCubeletStates] = useState<Map<string, CubeletState>>(() => {
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
    return states;
  });

  const getPhaseProgress = useCallback(
    (start: number, end: number) => {
      if (progress < start) return 0;
      if (progress > end) return 1;
      return (progress - start) / (end - start);
    },
    [progress]
  );

  // Determine current phase index and how many phases are complete
  const getCurrentPhaseInfo = useCallback(() => {
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

    return { activePhaseIndex, phasesComplete };
  }, [progress]);

  const { activePhaseIndex, phasesComplete } = getCurrentPhaseInfo();

  // Update cubelet states when phases complete
  useEffect(() => {
    if (phasesComplete > completedPhases) {
      setCubeletStates((prevStates) => {
        const newStates = new Map(prevStates);

        for (let phaseIdx = completedPhases; phaseIdx < phasesComplete; phaseIdx++) {
          const phase = PHASES[phaseIdx];

          newStates.forEach((state, key) => {
            const layerCoord = state.currentLayer[phase.axis];

            if (layerCoord === phase.layerValue) {
              const newLayer = updateLayerAfterRotation(state.currentLayer, phase.axis, phase.angle);
              const newWorldPos = updateWorldPositionAfterRotation(state.worldPosition, phase.axis, phase.angle);

              const newRotation = { ...state.cumulativeRotation };
              if (phase.axis === "x") newRotation.x += phase.angle;
              else if (phase.axis === "y") newRotation.y += phase.angle;
              else if (phase.axis === "z") newRotation.z += phase.angle;

              newStates.set(key, {
                currentLayer: newLayer,
                cumulativeRotation: newRotation,
                worldPosition: newWorldPos,
              });
            }
          });
        }

        return newStates;
      });

      setCompletedPhases(phasesComplete);
    } else if (phasesComplete < completedPhases) {
      // User scrolled back - reset states
      setCubeletStates(() => {
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

        // Re-apply completed phases
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

              states.set(key, {
                currentLayer: newLayer,
                cumulativeRotation: newRotation,
                worldPosition: newWorldPos,
              });
            }
          });
        }

        return states;
      });

      setCompletedPhases(phasesComplete);
    }
  }, [phasesComplete, completedPhases, cubeletSize]);

  // Calculate active rotation for current phase
  let activeRotation: { axis: "x" | "y" | "z"; angle: number } | null = null;
  let activePhase: RotationPhase | null = null;

  if (activePhaseIndex >= 0) {
    activePhase = PHASES[activePhaseIndex];
    const phaseProgress = getPhaseProgress(activePhase.start, activePhase.end);
    const easedProgress = easeOutQuart(phaseProgress);
    activeRotation = {
      axis: activePhase.axis,
      angle: easedProgress * activePhase.angle,
    };
  }

  // === ANTICIPATION PHASE ===
  const anticipationProgress = getPhaseProgress(ROTATION_6_END, ANTICIPATION_PAUSE);
  const compressionFactor = 1 - easeInOutQuad(anticipationProgress) * 0.08;
  const emissiveIntensity = anticipationProgress * 0.3;
  const gapExpansion = easeOutQuad(anticipationProgress) * 0.12;

  // === EXPLOSION PHASE ===
  const miniExplodeProgress = easeOutBack(getPhaseProgress(ANTICIPATION_PAUSE, MINI_EXPLODE_END));
  const fullExplodeProgress = easeOutExpo(getPhaseProgress(MINI_EXPLODE_END, 1.0));
  const explodeProgress = miniExplodeProgress * 0.3 + fullExplodeProgress * 2.2;
  const spiralAngle = explodeProgress * Math.PI * 1.5;

  // ==========================================
  // OPTIMIZATION 3: Single central useFrame
  // ==========================================
  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const t = clock.elapsedTime;
    const vecs = tempVectors.current;

    // Note: uTime updates removed - sketch effect is now static for realistic pencil look

    // Rotation slowdown during anticipation
    const rotationDamping =
      anticipationProgress > 0 && anticipationProgress < 1
        ? 1 - easeOutQuad(anticipationProgress) * 0.9
        : 1;

    // Dynamic overall cube rotation
    const baseRotationY = Math.PI * 0.2 + progress * Math.PI * 0.4;
    const baseRotationX = Math.PI * 0.15 + Math.sin(progress * Math.PI * 2) * 0.15;

    groupRef.current.rotation.y = baseRotationY * rotationDamping;
    groupRef.current.rotation.x = baseRotationX * rotationDamping;

    // Pre-calculate max distance once (constant)
    const maxDistance = 1.7320508075688772; // Math.sqrt(3)

    // Check if tremor calculations are needed (early bailout optimization)
    const needsTremor = anticipationProgress > 0 && anticipationProgress < 1;

    // Update all 27 cubelets in one loop
    cubelets.forEach((cubelet, idx) => {
      const groupNode = cubeletGroupRefs.current[idx];
      if (!groupNode) return;

      const state = cubeletStates.get(cubelet.key);
      if (!state) return;

      // Use pre-calculated static values instead of computing per frame
      const explosionDelay = 1 - cubelet.distanceFromCenter / maxDistance;
      const velocityMultiplier = cubelet.velocityMultiplier;

      // Base position from world state (reuse vector)
      vecs.basePos.set(state.worldPosition.x, state.worldPosition.y, state.worldPosition.z);

      // Check if in active layer
      const isInActiveLayer = activePhase && state.currentLayer[activePhase.axis] === activePhase.layerValue;

      // Apply active rotation transform
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

      // Total rotation = cumulative + active
      const totalRotX = state.cumulativeRotation.x + activeRotX;
      const totalRotY = state.cumulativeRotation.y + activeRotY;
      const totalRotZ = state.cumulativeRotation.z + activeRotZ;

      // Apply staggered explosion with delay
      const delayedExplodeProgress = Math.max(
        0,
        (explodeProgress - explosionDelay * 0.3) / (1 - explosionDelay * 0.3)
      );

      // Enhanced tumbling during explosion
      const tumbleSpeed = delayedExplodeProgress * Math.PI * 2;
      const tumbleRotX =
        totalRotX +
        cubelet.originalLayer.z * tumbleSpeed * 0.8 +
        cubelet.originalLayer.y * tumbleSpeed * 0.3;
      const tumbleRotY =
        totalRotY +
        cubelet.originalLayer.x * tumbleSpeed * 0.6 +
        cubelet.originalLayer.z * tumbleSpeed * 0.4;
      const tumbleRotZ =
        totalRotZ + (cubelet.originalLayer.x + cubelet.originalLayer.y) * tumbleSpeed * 0.5;

      // Apply anticipation gap expansion (reuse vector)
      vecs.anticipationOffset.set(
        state.currentLayer.x * gapExpansion,
        state.currentLayer.y * gapExpansion,
        state.currentLayer.z * gapExpansion
      );
      vecs.basePos.add(vecs.anticipationOffset);

      // Spiral explosion path (reuse vector)
      const spiralRadius = delayedExplodeProgress * 0.5;
      vecs.spiralOffset.set(
        Math.cos(spiralAngle + cubelet.originalLayer.x * Math.PI) *
          spiralRadius *
          Math.abs(cubelet.originalLayer.x),
        0,
        Math.sin(spiralAngle + cubelet.originalLayer.z * Math.PI) *
          spiralRadius *
          Math.abs(cubelet.originalLayer.z)
      );

      // Calculate exploded position (reuse vector)
      const explodeDistance = delayedExplodeProgress * 2.5 * velocityMultiplier;
      vecs.explodeOffset.set(
        state.currentLayer.x * explodeDistance +
          state.currentLayer.x * state.currentLayer.z * delayedExplodeProgress * 0.3,
        state.currentLayer.y * explodeDistance + state.currentLayer.y * delayedExplodeProgress * 0.2,
        state.currentLayer.z * explodeDistance +
          state.currentLayer.z * state.currentLayer.x * delayedExplodeProgress * 0.3
      );

      vecs.basePos.add(vecs.explodeOffset);
      vecs.basePos.add(vecs.spiralOffset);

      // Heartbeat pulse effect during anticipation
      const heartbeatPulse =
        anticipationProgress > 0 && anticipationProgress < 1
          ? Math.sin(anticipationProgress * Math.PI * 2.5) * 0.04
          : 0;
      const finalScale = compressionFactor + Math.abs(heartbeatPulse);

      // Tremor/vibration effect during anticipation (conditional calculation)
      let finalX = vecs.basePos.x;
      let finalY = vecs.basePos.y;
      let finalZ = vecs.basePos.z;

      // OPTIMIZATION: Skip tremor math entirely when not in anticipation phase
      if (needsTremor) {
        const intensity = anticipationProgress * 0.015;
        const freq = 15 + anticipationProgress * 25;
        const tFreq = t * freq;

        finalX += Math.sin(tFreq * cubelet.tremor.x) * intensity;
        finalY += Math.sin(tFreq * cubelet.tremor.y) * intensity;
        finalZ += Math.sin(tFreq * cubelet.tremor.z) * intensity;
      }

      // Apply transforms to group
      groupNode.position.set(finalX, finalY, finalZ);
      groupNode.rotation.set(tumbleRotX, tumbleRotY, tumbleRotZ);
      groupNode.scale.setScalar(finalScale);
    });
  });

  const actualCubeletSize = (cubeletSize - gap) * compressionFactor;
  const radius = actualCubeletSize * 0.08;

  return (
    <group ref={groupRef}>
      {cubelets.map((cubelet, idx) => (
        <group
          key={cubelet.key}
          ref={(el) => {
            cubeletGroupRefs.current[idx] = el;
          }}
        >
          <OptimizedCubelet
            data={cubelet}
            cubeletSize={(cubeletSize - gap)}
            radius={radius}
            innerMaterial={sharedMaterials.inner}
            stickerMaterials={sharedMaterials}
            stickerGeometry={stickerGeometry}
          />
        </group>
      ))}
    </group>
  );
}
