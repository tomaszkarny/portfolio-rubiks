// ── Scribble Fill SVG Data ──────────────────────────────────────────────────
// Thick scribble paths that progressively fill the card area on hover.
// Inspired by superskills.design's Lottie-based scribble reveal.
// viewBox: 0 0 500 550. Stroke widths ~180-220px cover ~40% of width per sweep.
// Each path makes 3-4 horizontal sweeps with vertical offsets using cubic beziers.

export interface ScribbleFillVariantData {
  fillPath: string;
  borderPath: string;
  fillStrokeWidth: number;
  borderStrokeWidth: number;
  filterSeed: number;
}

export type ScribbleFillVariant =
  | "scribbleA"
  | "scribbleB"
  | "scribbleC"
  | "scribbleD";

export const scribbleFillVariants: Record<
  ScribbleFillVariant,
  ScribbleFillVariantData
> = {
  // ── Scribble A ────────────────────────────────────────────────────────────
  // Classic S-sweep: 4 horizontal passes with alternating direction.
  // Top-to-bottom coverage with organic wobble.
  scribbleA: {
    fillPath:
      "M3,544 C3,544 483,535 473,468 C463,401 186,459 213,428 C240,397 677,343 436,264 C194,186 92,484 57,323 C22,162 522,192 483,74 C444,-44 83,38 0,100",
    borderPath:
      "M-10,550 C-10,550 500,542 490,480 C480,418 170,470 200,435 C230,400 690,350 450,275 C210,200 80,490 45,335 C10,180 530,205 495,90 C460,-25 70,30 -15,95",
    fillStrokeWidth: 200,
    borderStrokeWidth: 220,
    filterSeed: 42,
  },

  // ── Scribble B ────────────────────────────────────────────────────────────
  // Zigzag sweep: tighter horizontal passes creating denser coverage.
  scribbleB: {
    fillPath:
      "M-20,520 C-20,520 520,500 500,440 C480,380 30,420 50,360 C70,300 510,320 480,250 C450,180 20,240 40,170 C60,100 500,140 470,60 C440,-20 50,20 -20,80",
    borderPath:
      "M-30,540 C-30,540 530,515 510,455 C490,395 20,435 40,375 C60,315 520,335 490,265 C460,195 10,255 30,185 C50,115 510,155 480,75 C450,-5 40,10 -30,70",
    fillStrokeWidth: 190,
    borderStrokeWidth: 210,
    filterSeed: 17,
  },

  // ── Scribble C ────────────────────────────────────────────────────────────
  // Loose wave: wider sweeps with more organic vertical variation.
  scribbleC: {
    fillPath:
      "M10,530 C10,530 490,545 470,475 C450,405 140,450 180,400 C220,350 680,310 420,240 C160,170 100,460 70,310 C40,160 510,180 480,80 C450,-20 90,50 10,110",
    borderPath:
      "M0,545 C0,545 505,555 485,490 C465,425 125,465 165,415 C205,365 695,325 435,255 C175,185 85,475 55,325 C25,175 525,195 495,95 C465,-5 75,40 0,100",
    fillStrokeWidth: 210,
    borderStrokeWidth: 230,
    filterSeed: 73,
  },

  // ── Scribble D ────────────────────────────────────────────────────────────
  // Compact fill: tighter curves for denser coverage with less open gaps.
  scribbleD: {
    fillPath:
      "M-10,535 C-10,535 510,525 490,460 C470,395 100,440 130,390 C160,340 540,330 460,260 C380,190 60,380 40,290 C20,200 500,200 470,100 C440,0 70,40 -10,90",
    borderPath:
      "M-25,548 C-25,548 525,538 505,475 C485,412 85,455 115,405 C145,355 555,345 475,275 C395,205 45,395 25,305 C5,215 515,215 485,115 C455,15 55,30 -25,80",
    fillStrokeWidth: 195,
    borderStrokeWidth: 215,
    filterSeed: 91,
  },
};
