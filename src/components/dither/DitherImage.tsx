import { useEffect, useRef } from "react";

type Props = {
  src: string;
  scale?: number;
  contrast?: number;
  background?: "transparent" | string;
  dotColor?: string;
  className?: string;
  onLoaded?: () => void;
};

const BAYER_4 = [
  [0,  8,  2, 10],
  [12, 4, 14,  6],
  [3, 11,  1,  9],
  [15, 7, 13,  5],
].map(row => row.map(v => (v + 0.5) / 16)); // thresholds 0..1

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export default function DitherImage({
                                     src,
                                     scale = 2,
                                     contrast = 1.0,
                                     background = "#15191e",
                                     dotColor = "#FFFFFF",
                                     className,
                                     onLoaded,
                                   }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.src = src;

    img.onload = () => {
      if (cancelled) return;
      const w = img.naturalWidth | 0;
      const h = img.naturalHeight | 0;

      const off = document.createElement("canvas");
      off.width = w; off.height = h;
      const ctx = off.getContext("2d", { willReadFrequently: true })!;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0);

      const base = ctx.getImageData(0, 0, w, h);
      const out = new ImageData(w, h);

      const to01 = (v: number) => Math.pow(v / 255, contrast); // simple gamma-ish curve
      const [dr, dg, db] = hexToRgb(dotColor);
      const bgIsTransparent = background === "transparent";
      const [br, bgc, bb] = bgIsTransparent ? [0, 0, 0] : hexToRgb(background as string);

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          // luminance in 0..1
          const r = to01(base.data[i]);
          const g = to01(base.data[i + 1]);
          const b = to01(base.data[i + 2]);
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;

          const t = BAYER_4[y % 4][x % 4]; // threshold 0..1

          // We place a white dot if luminance is ABOVE threshold (light areas => more dots)
          const isDot = lum > t;

          if (!isDot) {
            out.data[i] = dr; out.data[i + 1] = dg; out.data[i + 2] = db; out.data[i + 3] = 255;
          } else {
            if (bgIsTransparent) {
              out.data[i] = 0; out.data[i + 1] = 0; out.data[i + 2] = 0; out.data[i + 3] = 0; // alpha 0
            } else {
              out.data[i] = br; out.data[i + 1] = bgc; out.data[i + 2] = bb; out.data[i + 3] = 0;
            }
          }
        }
      }

      const c = canvasRef.current!;
      c.width = w; c.height = h;
      const cctx = c.getContext("2d")!;
      cctx.imageSmoothingEnabled = false;
      cctx.putImageData(out, 0, 0);

      // Visual upscale with crisp pixels
      c.style.width = `${w * scale}px`;
      c.style.height = `${h * scale}px`;

      onLoaded?.();
    };

    return () => { cancelled = true; };
  }, [src, scale, contrast, background, dotColor, onLoaded]);

  // If you set background="transparent", put this canvas on a parent with background #15191e
  const bgStyle = background === "transparent" ? {} : { background };
  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ imageRendering: "pixelated", ...bgStyle }}
    />
  );
}
