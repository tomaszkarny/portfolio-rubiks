"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Vector3, Mesh } from "three";
import { RoundedBox } from "@react-three/drei";

interface RubiksCubeProps {
  progress: number; // 0 = assembled cube, 1 = fully exploded
  size?: number;
}

// Animation phase constants - 6 layer rotations + dramatic explosion
const QUIET_ZONE_END = 0.05;
const ROTATION_1_END = 0.12;    // Top layer (Y axis)
const ROTATION_2_END = 0.19;    // Right layer (X axis)
const ROTATION_3_END = 0.26;    // Front layer (Z axis)
const ROTATION_4_END = 0.33;    // Bottom layer (Y axis)
const ROTATION_5_END = 0.40;    // Left layer (X axis)
const ROTATION_6_END = 0.47;    // Back layer (Z axis)
const ANTICIPATION_PAUSE = 0.55;
const MINI_EXPLODE_END = 0.75;

// Classic Rubik's cube face colors
const RUBIKS_COLORS = {
  front: "#009b48",  // Green
  back: "#0046ad",   // Blue
  left: "#ff5800",   // Orange
  right: "#b71234",  // Red
  top: "#ffffff",    // White
  bottom: "#ffd500", // Yellow
  inner: "#1a1a1a",  // Black (inner cube)
};

// Phase definitions for 6 rotations
interface RotationPhase {
  start: number;
  end: number;
  axis: 'x' | 'y' | 'z';
  layerValue: number;
  angle: number;
}

const PHASES: RotationPhase[] = [
  { start: QUIET_ZONE_END, end: ROTATION_1_END, axis: 'y', layerValue: 1, angle: Math.PI / 2 },     // Top Y CW
  { start: ROTATION_1_END, end: ROTATION_2_END, axis: 'x', layerValue: 1, angle: Math.PI / 2 },    // Right X CW
  { start: ROTATION_2_END, end: ROTATION_3_END, axis: 'z', layerValue: 1, angle: Math.PI / 2 },    // Front Z CW
  { start: ROTATION_3_END, end: ROTATION_4_END, axis: 'y', layerValue: -1, angle: -Math.PI / 2 },  // Bottom Y CCW
  { start: ROTATION_4_END, end: ROTATION_5_END, axis: 'x', layerValue: -1, angle: -Math.PI / 2 },  // Left X CCW
  { start: ROTATION_5_END, end: ROTATION_6_END, axis: 'z', layerValue: -1, angle: -Math.PI / 2 },  // Back Z CCW
];

interface CubeletData {
  key: string;
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
}

interface CubeletState {
  currentLayer: { x: number; y: number; z: number };
  cumulativeRotation: { x: number; y: number; z: number };
  worldPosition: { x: number; y: number; z: number };
}

interface CubeletProps {
  data: CubeletData;
  state: CubeletState;
  size: number;
  gap: number;
  activeRotation: { axis: 'x' | 'y' | 'z'; angle: number } | null;
  isInActiveLayer: boolean;
  explodeProgress: number;
  anticipationProgress: number;
  compressionScale: number;
  emissiveIntensity: number;
  gapExpansion: number;
  explosionDelay: number;
  velocityMultiplier: number;
  spiralAngle: number;
}

// Helper: Update layer coordinates after a rotation
function updateLayerAfterRotation(
  currentLayer: { x: number; y: number; z: number },
  axis: 'x' | 'y' | 'z',
  angle: number
): { x: number; y: number; z: number } {
  const cos = Math.round(Math.cos(angle));
  const sin = Math.round(Math.sin(angle));

  if (axis === 'y') {
    // Rotation around Y: x,z swap
    return {
      x: currentLayer.x * cos + currentLayer.z * sin,
      y: currentLayer.y,
      z: -currentLayer.x * sin + currentLayer.z * cos,
    };
  }
  if (axis === 'x') {
    // Rotation around X: y,z swap
    return {
      x: currentLayer.x,
      y: currentLayer.y * cos - currentLayer.z * sin,
      z: currentLayer.y * sin + currentLayer.z * cos,
    };
  }
  // axis === 'z'
  // Rotation around Z: x,y swap
  return {
    x: currentLayer.x * cos - currentLayer.y * sin,
    y: currentLayer.x * sin + currentLayer.y * cos,
    z: currentLayer.z,
  };
}

// Helper: Update world position after a rotation
function updateWorldPositionAfterRotation(
  worldPos: { x: number; y: number; z: number },
  axis: 'x' | 'y' | 'z',
  angle: number
): { x: number; y: number; z: number } {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  if (axis === 'y') {
    return {
      x: worldPos.x * cos + worldPos.z * sin,
      y: worldPos.y,
      z: -worldPos.x * sin + worldPos.z * cos,
    };
  }
  if (axis === 'x') {
    return {
      x: worldPos.x,
      y: worldPos.y * cos - worldPos.z * sin,
      z: worldPos.y * sin + worldPos.z * cos,
    };
  }
  // axis === 'z'
  return {
    x: worldPos.x * cos - worldPos.y * sin,
    y: worldPos.x * sin + worldPos.y * cos,
    z: worldPos.z,
  };
}

function Cubelet({
  data,
  state,
  size,
  gap,
  activeRotation,
  isInActiveLayer,
  explodeProgress,
  anticipationProgress,
  compressionScale,
  emissiveIntensity,
  gapExpansion,
  explosionDelay,
  velocityMultiplier,
  spiralAngle,
}: CubeletProps) {
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<Group>(null);

  // Unique tremor direction per cubelet (memoized)
  const tremor = useMemo(() => ({
    x: Math.random() * 2 - 1,
    y: Math.random() * 2 - 1,
    z: Math.random() * 2 - 1,
  }), []);

  const cubeletSize = (size - gap) * compressionScale;
  const radius = cubeletSize * 0.08;

  // Base position from world state
  const basePos = new Vector3(
    state.worldPosition.x,
    state.worldPosition.y,
    state.worldPosition.z
  );

  // Apply active rotation transform if this cubelet is in the rotating layer
  let activeRotX = 0;
  let activeRotY = 0;
  let activeRotZ = 0;

  if (isInActiveLayer && activeRotation) {
    // Apply rotation to position
    const cos = Math.cos(activeRotation.angle);
    const sin = Math.sin(activeRotation.angle);

    if (activeRotation.axis === 'y') {
      const newX = basePos.x * cos + basePos.z * sin;
      const newZ = -basePos.x * sin + basePos.z * cos;
      basePos.x = newX;
      basePos.z = newZ;
      activeRotY = activeRotation.angle;
    } else if (activeRotation.axis === 'x') {
      const newY = basePos.y * cos - basePos.z * sin;
      const newZ = basePos.y * sin + basePos.z * cos;
      basePos.y = newY;
      basePos.z = newZ;
      activeRotX = activeRotation.angle;
    } else if (activeRotation.axis === 'z') {
      const newX = basePos.x * cos - basePos.y * sin;
      const newY = basePos.x * sin + basePos.y * cos;
      basePos.x = newX;
      basePos.y = newY;
      activeRotZ = activeRotation.angle;
    }
  }

  // Total rotation = cumulative + active
  const totalRotX = state.cumulativeRotation.x + activeRotX;
  const totalRotY = state.cumulativeRotation.y + activeRotY;
  const totalRotZ = state.cumulativeRotation.z + activeRotZ;

  // Apply staggered explosion with delay based on distance from center
  const delayedExplodeProgress = Math.max(0,
    (explodeProgress - explosionDelay * 0.3) / (1 - explosionDelay * 0.3)
  );

  // Enhanced tumbling during explosion
  const tumbleSpeed = delayedExplodeProgress * Math.PI * 2;
  const tumbleRotX = totalRotX + data.originalLayer.z * tumbleSpeed * 0.8 + data.originalLayer.y * tumbleSpeed * 0.3;
  const tumbleRotY = totalRotY + data.originalLayer.x * tumbleSpeed * 0.6 + data.originalLayer.z * tumbleSpeed * 0.4;
  const tumbleRotZ = totalRotZ + (data.originalLayer.x + data.originalLayer.y) * tumbleSpeed * 0.5;

  // Apply anticipation gap expansion
  const anticipationOffset = new Vector3(
    state.currentLayer.x * gapExpansion,
    state.currentLayer.y * gapExpansion,
    state.currentLayer.z * gapExpansion
  );
  basePos.add(anticipationOffset);

  // Spiral explosion path
  const spiralRadius = delayedExplodeProgress * 0.5;
  const spiralOffset = new Vector3(
    Math.cos(spiralAngle + data.originalLayer.x * Math.PI) * spiralRadius * Math.abs(data.originalLayer.x),
    0,
    Math.sin(spiralAngle + data.originalLayer.z * Math.PI) * spiralRadius * Math.abs(data.originalLayer.z)
  );

  // Calculate exploded position with varying velocities
  const explodeDistance = delayedExplodeProgress * 2.5 * velocityMultiplier;
  const explodeOffset = new Vector3(
    state.currentLayer.x * explodeDistance + (state.currentLayer.x * state.currentLayer.z * delayedExplodeProgress * 0.3),
    state.currentLayer.y * explodeDistance + (state.currentLayer.y * delayedExplodeProgress * 0.2),
    state.currentLayer.z * explodeDistance + (state.currentLayer.z * state.currentLayer.x * delayedExplodeProgress * 0.3)
  );

  basePos.add(explodeOffset);
  basePos.add(spiralOffset);

  // Heartbeat pulse effect during anticipation
  const heartbeatPulse = anticipationProgress > 0 && anticipationProgress < 1
    ? Math.sin(anticipationProgress * Math.PI * 2.5) * 0.04
    : 0;
  const finalScale = compressionScale + Math.abs(heartbeatPulse);

  // Tremor/vibration effect during anticipation
  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    if (anticipationProgress > 0 && anticipationProgress < 1) {
      const intensity = anticipationProgress * 0.015;
      const freq = 15 + anticipationProgress * 25;
      const t = clock.elapsedTime * freq;

      groupRef.current.position.x = basePos.x + Math.sin(t * tremor.x) * intensity;
      groupRef.current.position.y = basePos.y + Math.sin(t * tremor.y) * intensity;
      groupRef.current.position.z = basePos.z + Math.sin(t * tremor.z) * intensity;
    } else {
      groupRef.current.position.set(basePos.x, basePos.y, basePos.z);
    }
  });

  // Material properties with energy glow during anticipation
  const metalness = 0.3 + anticipationProgress * 0.2;
  const roughness = 0.7 - anticipationProgress * 0.2;

  return (
    <group
      ref={groupRef}
      position={[basePos.x, basePos.y, basePos.z]}
      rotation={[tumbleRotX, tumbleRotY, tumbleRotZ]}
      scale={[finalScale, finalScale, finalScale]}
    >
      <RoundedBox
        ref={meshRef}
        args={[cubeletSize, cubeletSize, cubeletSize]}
        radius={radius}
        smoothness={4}
      >
        <meshStandardMaterial
          color={RUBIKS_COLORS.inner}
          metalness={metalness}
          roughness={roughness}
          emissive="#ffffff"
          emissiveIntensity={emissiveIntensity}
        />
      </RoundedBox>

      {/* Color stickers on each face */}
      {data.colors.front && (
        <mesh position={[0, 0, cubeletSize / 2 + 0.001]}>
          <planeGeometry args={[cubeletSize * 0.85, cubeletSize * 0.85]} />
          <meshStandardMaterial
            color={data.colors.front}
            metalness={0.1 + anticipationProgress * 0.1}
            roughness={0.4 - anticipationProgress * 0.1}
            emissive={data.colors.front}
            emissiveIntensity={emissiveIntensity * 0.5}
          />
        </mesh>
      )}
      {data.colors.back && (
        <mesh position={[0, 0, -cubeletSize / 2 - 0.001]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[cubeletSize * 0.85, cubeletSize * 0.85]} />
          <meshStandardMaterial
            color={data.colors.back}
            metalness={0.1 + anticipationProgress * 0.1}
            roughness={0.4 - anticipationProgress * 0.1}
            emissive={data.colors.back}
            emissiveIntensity={emissiveIntensity * 0.5}
          />
        </mesh>
      )}
      {data.colors.left && (
        <mesh position={[-cubeletSize / 2 - 0.001, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[cubeletSize * 0.85, cubeletSize * 0.85]} />
          <meshStandardMaterial
            color={data.colors.left}
            metalness={0.1 + anticipationProgress * 0.1}
            roughness={0.4 - anticipationProgress * 0.1}
            emissive={data.colors.left}
            emissiveIntensity={emissiveIntensity * 0.5}
          />
        </mesh>
      )}
      {data.colors.right && (
        <mesh position={[cubeletSize / 2 + 0.001, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[cubeletSize * 0.85, cubeletSize * 0.85]} />
          <meshStandardMaterial
            color={data.colors.right}
            metalness={0.1 + anticipationProgress * 0.1}
            roughness={0.4 - anticipationProgress * 0.1}
            emissive={data.colors.right}
            emissiveIntensity={emissiveIntensity * 0.5}
          />
        </mesh>
      )}
      {data.colors.top && (
        <mesh position={[0, cubeletSize / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[cubeletSize * 0.85, cubeletSize * 0.85]} />
          <meshStandardMaterial
            color={data.colors.top}
            metalness={0.1 + anticipationProgress * 0.1}
            roughness={0.4 - anticipationProgress * 0.1}
            emissive={data.colors.top}
            emissiveIntensity={emissiveIntensity * 0.5}
          />
        </mesh>
      )}
      {data.colors.bottom && (
        <mesh position={[0, -cubeletSize / 2 - 0.001, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[cubeletSize * 0.85, cubeletSize * 0.85]} />
          <meshStandardMaterial
            color={data.colors.bottom}
            metalness={0.1 + anticipationProgress * 0.1}
            roughness={0.4 - anticipationProgress * 0.1}
            emissive={data.colors.bottom}
            emissiveIntensity={emissiveIntensity * 0.5}
          />
        </mesh>
      )}
    </group>
  );
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

export function RubiksCube({ progress, size = 2.4 }: RubiksCubeProps) {
  const groupRef = useRef<Group>(null);
  const cubeletSize = size / 3;
  const gap = 0.06;

  // Track completed phases to update cubelet states
  const [completedPhases, setCompletedPhases] = useState<number>(0);

  // Generate all 27 cubelets with their positions and colors
  const cubelets = useMemo(() => {
    const result: CubeletData[] = [];

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

          result.push({
            key: `${x}-${y}-${z}`,
            originalPosition: [x * cubeletSize, y * cubeletSize, z * cubeletSize],
            colors,
            originalLayer: { x, y, z },
          });
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

  const getPhaseProgress = (start: number, end: number) => {
    if (progress < start) return 0;
    if (progress > end) return 1;
    return (progress - start) / (end - start);
  };

  // Determine current phase index and how many phases are complete
  const getCurrentPhaseInfo = () => {
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
  };

  const { activePhaseIndex, phasesComplete } = getCurrentPhaseInfo();

  // Update cubelet states when phases complete
  useEffect(() => {
    if (phasesComplete > completedPhases) {
      // Apply all newly completed phases
      setCubeletStates(prevStates => {
        const newStates = new Map(prevStates);

        for (let phaseIdx = completedPhases; phaseIdx < phasesComplete; phaseIdx++) {
          const phase = PHASES[phaseIdx];

          // Update all cubelets that were in the rotating layer
          newStates.forEach((state, key) => {
            const layerCoord = state.currentLayer[phase.axis];

            if (layerCoord === phase.layerValue) {
              // Update layer coordinates
              const newLayer = updateLayerAfterRotation(
                state.currentLayer,
                phase.axis,
                phase.angle
              );

              // Update world position
              const newWorldPos = updateWorldPositionAfterRotation(
                state.worldPosition,
                phase.axis,
                phase.angle
              );

              // Update cumulative rotation
              const newRotation = { ...state.cumulativeRotation };
              if (phase.axis === 'x') newRotation.x += phase.angle;
              else if (phase.axis === 'y') newRotation.y += phase.angle;
              else if (phase.axis === 'z') newRotation.z += phase.angle;

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
              const newLayer = updateLayerAfterRotation(
                state.currentLayer,
                phase.axis,
                phase.angle
              );

              const newWorldPos = updateWorldPositionAfterRotation(
                state.worldPosition,
                phase.axis,
                phase.angle
              );

              const newRotation = { ...state.cumulativeRotation };
              if (phase.axis === 'x') newRotation.x += phase.angle;
              else if (phase.axis === 'y') newRotation.y += phase.angle;
              else if (phase.axis === 'z') newRotation.z += phase.angle;

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
  let activeRotation: { axis: 'x' | 'y' | 'z'; angle: number } | null = null;
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

  // Check if a cubelet is in the active layer
  const isInActiveLayer = (state: CubeletState): boolean => {
    if (!activePhase) return false;
    return state.currentLayer[activePhase.axis] === activePhase.layerValue;
  };

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

  // Calculate per-cubelet explosion properties
  const getCubeletExplosionProps = (layer: { x: number; y: number; z: number }) => {
    const distanceFromCenter = Math.sqrt(layer.x ** 2 + layer.y ** 2 + layer.z ** 2);
    const maxDistance = Math.sqrt(3);
    const explosionDelay = 1 - (distanceFromCenter / maxDistance);

    const isCorner = Math.abs(layer.x) + Math.abs(layer.y) + Math.abs(layer.z) === 3;
    const isEdge = Math.abs(layer.x) + Math.abs(layer.y) + Math.abs(layer.z) === 2;
    const velocityMultiplier = isCorner ? 1.4 : isEdge ? 1.15 : 0.85;

    return { explosionDelay, velocityMultiplier };
  };

  useFrame(() => {
    if (!groupRef.current) return;

    // Rotation slowdown during anticipation
    const rotationDamping = anticipationProgress > 0 && anticipationProgress < 1
      ? 1 - easeOutQuad(anticipationProgress) * 0.9
      : 1;

    // Dynamic overall cube rotation
    const baseRotationY = Math.PI * 0.2 + progress * Math.PI * 0.4;
    const baseRotationX = Math.PI * 0.15 + Math.sin(progress * Math.PI * 2) * 0.15;

    groupRef.current.rotation.y = baseRotationY * rotationDamping;
    groupRef.current.rotation.x = baseRotationX * rotationDamping;
  });

  return (
    <group ref={groupRef}>
      {cubelets.map((cubelet) => {
        const state = cubeletStates.get(cubelet.key)!;
        const { explosionDelay, velocityMultiplier } = getCubeletExplosionProps(state.currentLayer);
        const inActiveLayer = isInActiveLayer(state);

        return (
          <Cubelet
            key={cubelet.key}
            data={cubelet}
            state={state}
            size={cubeletSize}
            gap={gap}
            activeRotation={activeRotation}
            isInActiveLayer={inActiveLayer}
            explodeProgress={explodeProgress}
            anticipationProgress={anticipationProgress}
            compressionScale={compressionFactor}
            emissiveIntensity={emissiveIntensity}
            gapExpansion={gapExpansion}
            explosionDelay={explosionDelay}
            velocityMultiplier={velocityMultiplier}
            spiralAngle={spiralAngle}
          />
        );
      })}
    </group>
  );
}
