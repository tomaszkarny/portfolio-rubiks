export function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function noise2D(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);

  const a = seededRandom(ix * 127.1 + iy * 311.7);
  const b = seededRandom((ix + 1) * 127.1 + iy * 311.7);
  const c = seededRandom(ix * 127.1 + (iy + 1) * 311.7);
  const d = seededRandom((ix + 1) * 127.1 + (iy + 1) * 311.7);

  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

export function fbm(x: number, y: number, octaves = 3): number {
  let value = 0;
  let amp = 0.5;
  for (let i = 0; i < octaves; i++) {
    value += amp * noise2D(x, y);
    x *= 2.1;
    y *= 2.1;
    amp *= 0.5;
  }
  return value;
}

export function curlNoise(x: number, y: number, octaves = 3): [number, number] {
  const e = 0.01;
  const n = fbm(x, y, octaves);
  const nx = fbm(x + e, y, octaves);
  const ny = fbm(x, y + e, octaves);
  const dx = (nx - n) / e;
  const dy = (ny - n) / e;
  return [dy, -dx];
}
