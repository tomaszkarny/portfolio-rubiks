"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { AnimationRefs } from "./CubeBackground";
import type { SmoothedMouseRefs } from "@/hooks";

interface SketchBackgroundProps {
  animationRefs: AnimationRefs;
  mouseRefs: SmoothedMouseRefs;
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.999, 1.0);
  }
`;

const fragmentShader = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
  #else
    precision mediump float;
  #endif

  uniform float uTime;
  uniform float uProgress;
  uniform vec2 uResolution;
  uniform float uScrollVelocity;
  uniform vec2 uMouse;
  uniform vec2 uCubePos;

  varying vec2 vUv;

  // Dramatically darker paper for strong contrast with bright cube
  const vec3 PAPER_COLOR = vec3(0.62, 0.59, 0.53);
  const vec3 INK_COLOR = vec3(0.15, 0.12, 0.10);
  const vec3 MID_TONE = vec3(0.38, 0.32, 0.26);

  // --- Noise functions ---

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    vec2 u = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  // Fractal brownian motion - 2 octaves (3rd octave amplitude 0.125 is invisible on background)
  float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 2; i++) {
      value += amplitude * noise(st);
      st *= 2.1;
      amplitude *= 0.5;
    }
    return value;
  }

  // Simplex-like gradient noise for curl
  vec2 grad(vec2 p) {
    float e = 0.01;
    float n = fbm(p);
    float nx = fbm(p + vec2(e, 0.0));
    float ny = fbm(p + vec2(0.0, e));
    return vec2(nx - n, ny - n) / e;
  }

  // Curl noise - rotated gradient for divergence-free flow
  vec2 curl(vec2 p) {
    vec2 g = grad(p);
    return vec2(g.y, -g.x);
  }

  // --- Hatching functions ---

  // Single hatch line with organic wobble and taper
  float hatchLine(vec2 coord, float angle, float spacing, float lineWidth, float seed) {
    // Apply wobble for hand-drawn feel
    float wobble = sin(coord.y * 0.04 + seed * 10.0) * 1.8 +
                   cos(coord.x * 0.03 + seed * 7.0) * 1.5;

    // Rotate coordinate
    float s = sin(angle);
    float c = cos(angle);
    float projected = coord.x * c + coord.y * s + wobble;

    // Modular repetition
    float hatch = mod(projected, spacing);
    float strokePos = hatch / spacing;

    // Taper at stroke ends for pencil pressure variation
    float taper = smoothstep(0.0, 0.15, strokePos) * smoothstep(1.0, 0.85, strokePos);

    // Pencil lifting noise
    float lifting = noise(coord * 0.005 + seed * 33.0) * 0.4 + 0.6;

    float adjustedWidth = lineWidth * taper * lifting;
    float edge = noise(coord * 0.1 + seed * 50.0) * 0.3;

    return smoothstep(adjustedWidth + edge + 0.3, adjustedWidth + edge, hatch);
  }

  void main() {
    vec2 uv = vUv;
    vec2 pixelCoord = uv * uResolution;

    // Aspect-corrected UVs
    vec2 centeredUv = uv - 0.5;
    float aspect = uResolution.x / uResolution.y;
    centeredUv.x *= aspect;

    // Parallax offset - background shifts opposite to mouse for depth
    vec2 parallaxOffset = uMouse * 0.03;
    centeredUv += parallaxOffset;

    // Distance from center for vignette masking
    float distFromCenter = length(centeredUv) * 1.4;
    // Hatching appears everywhere but is lighter near center, denser at edges
    float vignetteMask = smoothstep(0.0, 0.8, distFromCenter);
    // Ensure minimum hatching even at dead center
    float baseMask = 0.25 + vignetteMask * 0.75;

    // Radial depth gradient: center slightly lighter, edges darker (stronger)
    float radialGradient = smoothstep(0.0, 1.0, distFromCenter) * 0.08;

    // --- Paper base ---
    vec3 color = PAPER_COLOR - vec3(radialGradient);

    // Paper grain (2 layers)
    float coarseGrain = noise(pixelCoord * 0.25) * 0.05;
    float fineGrain = noise(pixelCoord * 0.8) * 0.04;
    color += vec3(coarseGrain + fineGrain - 0.045);

    // --- One-point perspective grid ---
    vec2 fromVP = centeredUv;
    float distFromVP = length(fromVP);

    // Perspective-compressed coordinates (reciprocal mapping creates convergence)
    float perspDepth = 1.0 / (distFromVP + 0.05);
    vec2 perspCoord = fromVP * perspDepth;

    // Grid lines on perspective-compressed space
    float gridFreq = 3.0;
    float gridX = 1.0 - smoothstep(0.0, 0.08, abs(sin(perspCoord.x * gridFreq)));
    float gridY = 1.0 - smoothstep(0.0, 0.08, abs(sin(perspCoord.y * gridFreq)));
    float grid = max(gridX, gridY);

    // Add wobble for hand-drawn feel
    float gridWobble = noise(pixelCoord * 0.01) * 0.15;
    grid *= (1.0 - gridWobble);

    // Fade grid: strong at edges, fading near center (avoid overwhelming vanishing point)
    float gridFade = smoothstep(0.05, 0.3, distFromVP);
    grid *= gridFade * 0.5;

    // Mix grid lines as ink
    color = mix(color, INK_COLOR, grid * 0.6);

    // Bright center glow at vanishing point
    float centerGlow = exp(-distFromVP * distFromVP * 8.0) * 0.15;
    color += vec3(centerGlow);

    // --- Cast shadow beneath cube ---
    vec2 shadowCenter = uCubePos * 0.5 + vec2(0.0, -0.08);
    vec2 shadowDelta = (centeredUv - shadowCenter) * vec2(1.0, 2.0);
    float shadowDist = length(shadowDelta);
    float shadow = smoothstep(0.35, 0.0, shadowDist) * 0.25;
    color -= vec3(shadow);

    // --- Curl noise warp field ---
    float flowTime = uTime * 0.03 + uProgress * 0.5;
    vec2 warpedUv = centeredUv + curl(centeredUv * 1.5 + flowTime) * 0.12;

    // Noise-driven density zones - organic regions where hatching appears
    float densityNoise = fbm(warpedUv * 2.5 + vec2(0.0, uProgress * 0.3));
    float densityZone = smoothstep(0.2, 0.55, densityNoise);

    // Scroll velocity adds energy to density
    float velocityInfluence = abs(uScrollVelocity) * 0.5;
    densityZone = min(1.0, densityZone + velocityInfluence * 0.3);

    // Combine vignette + density for final hatching mask
    float hatchMask = baseMask * (0.3 + densityZone * 0.7);

    // Increase hatching density in shadow area
    hatchMask += shadow * 1.5;

    // Mouse proximity lightening - subtle spotlight (much weaker than before)
    vec2 mouseUv = uMouse * 0.5;
    float mouseDist = length(centeredUv - mouseUv);
    float mouseLight = smoothstep(0.0, 0.2, mouseDist);
    hatchMask *= (0.6 + mouseLight * 0.4);

    // Apply curl noise warp to pixel coordinates for organic hatching
    vec2 curlOffset = curl(centeredUv * 2.0 + flowTime * 0.7) * 30.0;
    vec2 warpedCoord = pixelCoord + curlOffset;

    // Mouse proximity distortion - hatching warps away from cursor
    vec2 mouseRepelDir = centeredUv - mouseUv;
    float mouseRepelDist = length(mouseRepelDir);
    vec2 mouseRepel = normalize(mouseRepelDir + vec2(0.001)) *
                      smoothstep(0.3, 0.0, mouseRepelDist) * 20.0;
    warpedCoord += mouseRepel;

    // --- Cross-hatching layers ---

    // Layer 1: ~45 degree hatching (primary, covers most of the surface)
    float hatchSpacing1 = 9.0 + (1.0 - densityNoise) * 3.0;
    float layer1 = hatchLine(warpedCoord, 0.78, hatchSpacing1, 1.4, 1.0);
    float layer1Strength = hatchMask * 0.60;

    // Layer 2: ~-30 degree hatching (cross layer, creates depth)
    float hatchSpacing2 = 11.0 + (1.0 - densityNoise) * 4.0;
    float layer2 = hatchLine(warpedCoord, -0.52, hatchSpacing2, 1.2, 2.0);
    float density2 = fbm(warpedUv * 2.2 + vec2(5.0, uProgress * 0.25));
    float layer2Mask = baseMask * smoothstep(0.25, 0.6, density2);
    float layer2Strength = layer2Mask * 0.50;

    // Combine hatching layers (2 layers — 3rd near-horizontal layer removed for GPU savings)
    float totalHatch = layer1 * layer1Strength +
                       layer2 * layer2Strength;

    // Pressure variation
    float pressure = 0.7 + noise(pixelCoord * 0.003) * 0.3;
    totalHatch *= pressure;

    // Mix ink color into paper (stronger mix for denser coverage)
    color = mix(color, INK_COLOR, totalHatch * 0.95);

    // Mid-tone wash for tonal depth
    float washMask = baseMask * fbm(centeredUv * 3.0 + uProgress * 0.2) * 0.14;
    color = mix(color, MID_TONE, washMask);

    // Vignette darkening - stronger for more dramatic framing
    float edgeDarken = smoothstep(0.4, 1.2, distFromCenter) * 0.20;
    color -= vec3(edgeDarken);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export function SketchBackground({ animationRefs, mouseRefs }: SketchBackgroundProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size, viewport } = useThree();
  const dpr = viewport.dpr;

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uScrollVelocity: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uCubePos: { value: new THREE.Vector2(0, 0) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame(({ clock }) => {
    if (!materialRef.current) return;

    materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    materialRef.current.uniforms.uProgress.value =
      animationRefs.progress.current;
    materialRef.current.uniforms.uScrollVelocity.value =
      animationRefs.scrollVelocity.current;
    materialRef.current.uniforms.uResolution.value.set(
      size.width * dpr,
      size.height * dpr
    );

    // Feed smoothed mouse position into shader
    const mouse = mouseRefs.currentRef.current;
    materialRef.current.uniforms.uMouse.value.set(mouse.x, mouse.y);

    // Feed cube position into shader for cast shadow
    const cubePos = animationRefs.cubePosition.current;
    materialRef.current.uniforms.uCubePos.value.set(
      cubePos.x / 6.0,
      cubePos.y / 4.0
    );
  });

  return (
    <mesh renderOrder={-1} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
