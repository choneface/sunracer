// Simple utilities for palettes + dithering

export type RGB = [number, number, number];

const clamp = (v: number, lo = 0, hi = 255) => Math.max(lo, Math.min(hi, v));

export const Palettes = {
  mono: [
    [0, 0, 0],
    [255, 255, 255],
  ] as RGB[],
  gb: [
    [15, 56, 15],
    [48, 98, 48],
    [139, 172, 15],
    [155, 188, 15],
  ] as RGB[],
};

export function nearestColor([r, g, b]: RGB, palette: RGB[]): RGB {
  let best: RGB = palette[0];
  let bestD = Infinity;
  for (const p of palette) {
    const dr = r - p[0],
      dg = g - p[1],
      db = b - p[2];
    const d = dr * dr + dg * dg + db * db;
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return best;
}

// 4x4 Bayer matrix normalized to 0..1
const BAYER_4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((row) => row.map((v) => (v + 0.5) / 16)); // 0..1 thresholds

export function orderedBayerDither(
  imgData: ImageData,
  palette: RGB[],
  contrast = 1.0,
): ImageData {
  const { data, width, height } = imgData;
  const out = new ImageData(width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      // optional simple contrast curve in 0..1 space
      const to01 = (v: number) => Math.pow(v / 255, contrast);
      const r = to01(data[i]) * 255;
      const g = to01(data[i + 1]) * 255;
      const b = to01(data[i + 2]) * 255;

      // threshold offset from Bayer matrix
      const t = BAYER_4[y % 4][x % 4]; // 0..1
      // bias the input using threshold (works nicely for mono)
      const biased: RGB = [
        r + t * 255 - 127,
        g + t * 255 - 127,
        b + t * 255 - 127,
      ].map((v) => clamp(v)) as RGB;

      const [nr, ng, nb] = nearestColor(biased, palette);
      out.data[i] = nr;
      out.data[i + 1] = ng;
      out.data[i + 2] = nb;
      out.data[i + 3] = 255;
    }
  }
  return out;
}

export function floydSteinbergDither(
  imgData: ImageData,
  palette: RGB[],
  contrast = 1.0,
): ImageData {
  const { width, height } = imgData;
  const out = new ImageData(new Uint8ClampedArray(imgData.data), width, height);
  const idx = (x: number, y: number) => (y * width + x) * 4;

  const to01 = (v: number) => Math.pow(v / 255, contrast) * 255;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = idx(x, y);
      const old: RGB = [
        to01(out.data[i]),
        to01(out.data[i + 1]),
        to01(out.data[i + 2]),
      ] as RGB;
      const nq = nearestColor(old, palette);

      const err: RGB = [
        out.data[i] - nq[0],
        out.data[i + 1] - nq[1],
        out.data[i + 2] - nq[2],
      ] as RGB;

      out.data[i] = nq[0];
      out.data[i + 1] = nq[1];
      out.data[i + 2] = nq[2];
      out.data[i + 3] = 255;

      // distribute error
      const spread = (dx: number, dy: number, factor: number) => {
        const xx = x + dx,
          yy = y + dy;
        if (xx < 0 || xx >= width || yy < 0 || yy >= height) return;
        const j = idx(xx, yy);
        out.data[j] = clamp(out.data[j] + err[0] * factor);
        out.data[j + 1] = clamp(out.data[j + 1] + err[1] * factor);
        out.data[j + 2] = clamp(out.data[j + 2] + err[2] * factor);
      };

      // Floyd–Steinberg kernel
      spread(1, 0, 7 / 16);
      spread(-1, 1, 3 / 16);
      spread(0, 1, 5 / 16);
      spread(1, 1, 1 / 16);
    }
  }
  return out;
}
