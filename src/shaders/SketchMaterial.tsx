"use client";

import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";

// Custom Sketch Material with cross-hatching effect
const SketchMaterialImpl = shaderMaterial(
  {
    uLightDirection: new THREE.Vector3(1, 1, 1).normalize(),
    uHatchScale: 8.0,
    uWobbleIntensity: 2.0,
    uPaperColor: new THREE.Color(0.95, 0.93, 0.88), // Cream paper color
    uInkColor: new THREE.Color(0.15, 0.12, 0.1), // Dark sepia ink
  },
  // Vertex Shader
  `
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);

      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;

      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  // Fragment Shader with cross-hatching (OPTIMIZED)
  `
    // Precision fallback for mobile devices
    #ifdef GL_FRAGMENT_PRECISION_HIGH
      precision highp float;
    #else
      precision mediump float;
    #endif

    uniform vec3 uLightDirection;
    uniform float uHatchScale;
    uniform float uWobbleIntensity;
    uniform vec3 uPaperColor;
    uniform vec3 uInkColor;

    varying vec3 vNormal;
    varying vec3 vViewPosition;

    // Optimized pseudo-random noise
    float random(vec2 st) {
      return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
    }

    // Optimized noise with pre-computed smoothstep
    float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      vec2 u = f * f * (3.0 - 2.0 * f);

      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));

      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }

    void main() {
      // Calculate light intensity using Lambertian shading
      vec3 normal = normalize(vNormal);
      float lightIntensity = max(dot(normal, normalize(uLightDirection)), 0.0);
      lightIntensity = lightIntensity * 0.85 + 0.15;

      // Base color is the paper color
      vec3 color = uPaperColor;

      // Apply wobble for hand-drawn look (screen-space) - STATIC
      vec2 wobbledCoord = gl_FragCoord.xy;
      wobbledCoord.x += sin(gl_FragCoord.y * 0.03) * uWobbleIntensity;
      wobbledCoord.y += cos(gl_FragCoord.x * 0.03) * uWobbleIntensity;

      // OPTIMIZED: Paper texture reduced from 3 to 2 layers
      float coarseGrain = noise(gl_FragCoord.xy * 0.3) * 0.05;
      float mediumGrain = noise(gl_FragCoord.xy * 0.9) * 0.06;
      color += vec3(coarseGrain + mediumGrain - 0.055);

      // Pre-calculate common hatching values
      float hatchSpacing = uHatchScale * 1.3;
      float hatchSpacing95 = hatchSpacing * 0.95;
      float hatchSpacing70 = hatchSpacing * 0.7;
      float baseLineWidth = 1.4;

      // OPTIMIZED Layer 1: ~45 degree hatching (for medium shadows)
      // Pre-calculate shared noise values
      float sharedNoise1 = noise(wobbledCoord * 0.008);

      if (lightIntensity < 0.75) {
        float angleVar1 = sharedNoise1 * 0.25;
        float jitter1 = noise(wobbledCoord * 0.15) * 0.08;
        float hatch1 = mod((wobbledCoord.x + wobbledCoord.y) * (1.0 + angleVar1 + jitter1), hatchSpacing);

        float strokePos1 = hatch1 / hatchSpacing;
        float taper1 = smoothstep(0.0, 0.15, strokePos1) * smoothstep(1.0, 0.85, strokePos1);
        float lifting1 = sharedNoise1 * 0.4 + 0.6; // Reuse sharedNoise1 with offset
        float adjustedLineWidth1 = baseLineWidth * taper1 * lifting1;
        float hatchNoise1 = noise(wobbledCoord * 0.1) * 0.4;

        if (hatch1 < adjustedLineWidth1 + hatchNoise1) {
          float intensity = (0.75 - lightIntensity) * 2.5; // Pre-computed 1/0.40
          float pressure1 = 0.55 + taper1 * 0.2;
          color = mix(color, uInkColor, pressure1 * intensity);
        }
      }

      // OPTIMIZED Layer 2: ~-45 degree hatching (for deeper shadows)
      if (lightIntensity < 0.45) {
        float sharedNoise2 = noise(wobbledCoord * 0.008 + 33.0);
        float angleVar2 = sharedNoise2 * 0.25;
        float jitter2 = noise(wobbledCoord * 0.15 + 77.0) * 0.08;
        float hatch2 = mod((wobbledCoord.x - wobbledCoord.y) * (1.0 + angleVar2 + jitter2), hatchSpacing95);

        float strokePos2 = hatch2 / hatchSpacing95;
        float taper2 = smoothstep(0.0, 0.12, strokePos2) * smoothstep(1.0, 0.88, strokePos2);
        float lifting2 = sharedNoise2 * 0.35 + 0.65; // Reuse sharedNoise2
        float adjustedLineWidth2 = baseLineWidth * taper2 * lifting2;
        float hatchNoise2 = noise(wobbledCoord * 0.12 + 50.0) * 0.35;

        if (hatch2 < adjustedLineWidth2 + hatchNoise2) {
          float intensity = (0.45 - lightIntensity) * 3.333; // Pre-computed 1/0.30
          float pressure2 = 0.6 + taper2 * 0.2;
          color = mix(color, uInkColor, pressure2 * intensity);
        }
      }

      // OPTIMIZED Layer 3: near-horizontal hatching (for very deep shadows)
      if (lightIntensity < 0.28) {
        float sharedNoise3 = noise(wobbledCoord * 0.006 + 88.0);
        float angleVar3 = sharedNoise3 * 0.12;
        float hatch3 = mod(wobbledCoord.y + wobbledCoord.x * angleVar3, hatchSpacing70);

        float strokePos3 = hatch3 / hatchSpacing70;
        float taper3 = smoothstep(0.0, 0.1, strokePos3) * smoothstep(1.0, 0.9, strokePos3);
        float lifting3 = sharedNoise3 * 0.3 + 0.7; // Reuse sharedNoise3
        float adjustedLineWidth3 = baseLineWidth * 0.85 * taper3 * lifting3;
        float hatchNoise3 = noise(wobbledCoord * 0.08 + 100.0) * 0.25;

        if (hatch3 < adjustedLineWidth3 + hatchNoise3) {
          float intensity = (0.28 - lightIntensity) * 4.545; // Pre-computed 1/0.22
          float pressure3 = 0.55 + taper3 * 0.2;
          color = mix(color, uInkColor, pressure3 * intensity);
        }
      }

      // Strong pencil outline on edges
      vec3 viewDir = normalize(vViewPosition);
      float edgeFactor = 1.0 - abs(dot(normal, viewDir));

      // Sharp outline threshold
      float outlineThreshold = 0.6;
      float outlineSharpness = smoothstep(outlineThreshold - 0.12, outlineThreshold + 0.12, edgeFactor);

      // Subtle pressure variation (reuse earlier noise)
      float pressureVar = sharedNoise1 * 0.25 + 0.85;

      // Combine soft edge shading with sharp outline
      float softEdge = pow(edgeFactor, 2.2) * 0.25;
      float sharpOutline = outlineSharpness * 0.6 * pressureVar;

      color = mix(color, uInkColor, softEdge + sharpOutline);

      gl_FragColor = vec4(color, 1.0);
    }
  `
);

// Export the material class for direct instantiation
export { SketchMaterialImpl as SketchMaterial };
