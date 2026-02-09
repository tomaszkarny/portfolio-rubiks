// ── Sketch Blob SVG Data ────────────────────────────────────────────────────
// Open flowing stroke paths inspired by superskills.design.
// Each variant has primary + secondary open paths (no Z closing)
// with thick organic strokes that draw on hover.

export interface BlobVariantData {
  primary: string; // open flowing path (no Z)
  secondary: string; // companion path (different route)
  primaryStrokeWidth: number; // ~50-80
  secondaryStrokeWidth: number; // ~20-35
  filterSeed: number;
}

export type BlobVariant = "amoeba" | "cloud" | "wave" | "angular";

export const blobVariants: Record<BlobVariant, BlobVariantData> = {
  // ── Amoeba ──────────────────────────────────────────────────────────────────
  // Diagonal S-shape meandering: starts bottom-left, sweeps up through center,
  // ends top-right. Dramatic swooping arcs crossing the card.
  amoeba: {
    primary:
      "M -20 220 C 30 260, 80 180, 120 140 C 160 100, 140 40, 190 60 C 240 80, 220 160, 280 130 C 340 100, 360 40, 400 20",
    secondary:
      "M 10 250 C 60 200, 100 240, 160 190 C 220 140, 180 80, 240 100 C 300 120, 320 60, 390 50",
    primaryStrokeWidth: 65,
    secondaryStrokeWidth: 28,
    filterSeed: 42,
  },

  // ── Cloud ───────────────────────────────────────────────────────────────────
  // Arc-heavy: starts left-center, arcs up dramatically through top,
  // loops down, ends right-center. Cumulus-like roundness.
  cloud: {
    primary:
      "M -10 150 C 40 160, 60 60, 120 40 C 180 20, 200 100, 250 80 C 300 60, 320 -10, 370 60 C 420 130, 350 180, 400 160",
    secondary:
      "M 20 190 C 70 200, 80 120, 140 90 C 200 60, 230 140, 290 120 C 350 100, 380 160, 400 140",
    primaryStrokeWidth: 70,
    secondaryStrokeWidth: 30,
    filterSeed: 17,
  },

  // ── Wave ────────────────────────────────────────────────────────────────────
  // Horizontal flow: enters from left, 3 sinusoidal undulations across
  // the full width, exits right. Flowing, rhythmic.
  wave: {
    primary:
      "M -30 130 C 20 60, 60 200, 120 130 C 180 60, 220 200, 280 130 C 340 60, 370 160, 410 120",
    secondary:
      "M -10 160 C 40 100, 90 220, 150 160 C 210 100, 250 210, 310 150 C 370 90, 390 170, 420 140",
    primaryStrokeWidth: 60,
    secondaryStrokeWidth: 25,
    filterSeed: 73,
  },

  // ── Angular ─────────────────────────────────────────────────────────────────
  // Zigzag: sharp direction changes, enters top-left, cuts across with
  // angular bends, exits bottom-right. Each "elbow" is a tight Bezier.
  angular: {
    primary:
      "M -10 40 C 20 30, 60 30, 80 80 C 100 130, 140 60, 180 100 C 220 140, 200 200, 260 180 C 320 160, 340 220, 400 240",
    secondary:
      "M 20 20 C 50 10, 90 70, 120 50 C 150 30, 180 120, 220 90 C 260 60, 280 160, 330 200 C 380 240, 390 200, 410 220",
    primaryStrokeWidth: 55,
    secondaryStrokeWidth: 24,
    filterSeed: 91,
  },
};
