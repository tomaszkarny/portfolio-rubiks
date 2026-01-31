"use client";

import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

// Custom Sketch Material with cross-hatching effect
const SketchMaterialImpl = shaderMaterial(
  {
    uTime: 0,
    uBaseColor: new THREE.Color(0xffffff),
    uLightDirection: new THREE.Vector3(1, 1, 1).normalize(),
    uHatchScale: 8.0,
    uWobbleIntensity: 2.0,
    uPaperColor: new THREE.Color(0.95, 0.93, 0.88), // Cream paper color
    uInkColor: new THREE.Color(0.15, 0.12, 0.1), // Dark sepia ink
  },
  // Vertex Shader
  `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    varying vec3 vViewPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      vUv = uv;

      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;

      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  // Fragment Shader with cross-hatching
  `
    uniform float uTime;
    uniform vec3 uBaseColor;
    uniform vec3 uLightDirection;
    uniform float uHatchScale;
    uniform float uWobbleIntensity;
    uniform vec3 uPaperColor;
    uniform vec3 uInkColor;

    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    varying vec3 vViewPosition;

    // Pseudo-random noise for hand-drawn effect
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }

    // Simplex-like noise for smoother variation
    float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);

      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));

      vec2 u = f * f * (3.0 - 2.0 * f);

      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    void main() {
      // Calculate light intensity using Lambertian shading
      vec3 normal = normalize(vNormal);
      float lightIntensity = max(dot(normal, normalize(uLightDirection)), 0.0);

      // Add slight ambient to prevent pure black
      lightIntensity = lightIntensity * 0.85 + 0.15;

      // Base color is the paper color
      vec3 color = uPaperColor;

      // Apply wobble for hand-drawn look (screen-space)
      vec2 wobbledCoord = gl_FragCoord.xy;
      float wobbleTime = uTime * 0.3;
      wobbledCoord.x += sin(gl_FragCoord.y * 0.03 + wobbleTime) * uWobbleIntensity;
      wobbledCoord.y += cos(gl_FragCoord.x * 0.03 + wobbleTime * 0.7) * uWobbleIntensity;

      // Add paper grain noise
      float grain = noise(gl_FragCoord.xy * 0.5) * 0.03;
      color += vec3(grain - 0.015);

      // SUBTLE CROSS-HATCHING - only 2 layers with larger spacing
      float hatchSpacing = uHatchScale * 1.5;
      float lineWidth = 0.9;

      // Layer 1: 45 degree hatching (for medium shadows)
      if (lightIntensity < 0.7) {
        float hatch1 = mod(wobbledCoord.x + wobbledCoord.y, hatchSpacing);
        float hatchNoise1 = noise(wobbledCoord * 0.1) * 0.3;

        if (hatch1 < lineWidth + hatchNoise1) {
          float intensity = (0.7 - lightIntensity) / 0.4; // Gradual fade
          color = mix(color, uInkColor, 0.45 * intensity);
        }
      }

      // Layer 2: -45 degree hatching (for deep shadows)
      if (lightIntensity < 0.4) {
        float hatch2 = mod(wobbledCoord.x - wobbledCoord.y, hatchSpacing);
        float hatchNoise2 = noise(wobbledCoord * 0.12 + 50.0) * 0.25;

        if (hatch2 < lineWidth + hatchNoise2) {
          float intensity = (0.4 - lightIntensity) / 0.4;
          color = mix(color, uInkColor, 0.55 * intensity);
        }
      }

      // Add subtle edge darkening (pencil pressure on edges)
      float edgeFactor = 1.0 - abs(dot(normal, normalize(vViewPosition)));
      edgeFactor = pow(edgeFactor, 2.5);
      color = mix(color, uInkColor, edgeFactor * 0.2);

      // Output final color
      gl_FragColor = vec4(color, 1.0);
    }
  `
);

// Extend Three.js with our custom material
extend({ SketchMaterial: SketchMaterialImpl });

// Export the material class for direct instantiation
export { SketchMaterialImpl as SketchMaterial };

// Helper to create a configured sketch material instance
export function createSketchMaterial(options?: {
  paperColor?: THREE.ColorRepresentation;
  inkColor?: THREE.ColorRepresentation;
  hatchScale?: number;
  wobbleIntensity?: number;
}) {
  const material = new SketchMaterialImpl();

  if (options?.paperColor) {
    material.uniforms.uPaperColor.value = new THREE.Color(options.paperColor);
  }
  if (options?.inkColor) {
    material.uniforms.uInkColor.value = new THREE.Color(options.inkColor);
  }
  if (options?.hatchScale !== undefined) {
    material.uniforms.uHatchScale.value = options.hatchScale;
  }
  if (options?.wobbleIntensity !== undefined) {
    material.uniforms.uWobbleIntensity.value = options.wobbleIntensity;
  }

  return material;
}
