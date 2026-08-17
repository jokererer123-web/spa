/**
 * Motion-compensated frame interpolation for the hero scroll sequence.
 *
 * Takes the AI-generated keyframes in public/hero and produces a dense,
 * evenly-spaced sequence in public/hero/seq that the scroll scrubber plays
 * back frame-by-frame.
 *
 * A plain crossfade double-exposes the moving arms, so we estimate a dense
 * motion field with a coarse-to-fine pyramid block search, run a
 * forward/backward consistency check to find occluded pixels, and warp both
 * keyframes toward the intermediate time before blending. Where the two
 * directions disagree (disocclusions) we fall back to the more reliable side.
 *
 * Run with: npm run hero:frames
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const HERO = path.resolve("public/hero");
const OUT = path.join(HERO, "seq");

const KEYFRAMES = [
  "frame-01.jpg",
  "mid-12.jpg",
  "frame-02.jpg",
  "frame-03.jpg",
  "frame-04.jpg",
  "frame-05.jpg",
  "frame-06.jpg",
  "frame-07.jpg",
  "frame-08.jpg",
];

// 4 steps puts the samples at t = 0.2/0.4/0.6/0.8 and skips the exact 0.5
// midpoint, where "which keyframe is nearer" is ambiguous for occluded pixels.
const STEPS = 4; // interpolated frames inserted between each keyframe pair
const WIDTH = 1280; // working width of the delivered frames
const LEVELS = 4; // pyramid levels for the motion search
const PATCH = 9; // correlation window radius*2+1 at each level
const REFINE = 2; // +/- search radius at each pyramid level
const COARSE_SEARCH = 10; // +/- search radius at the coarsest level
const FLOW_STEP = 4; // flow sampled every N pixels, then upsampled
const OCC_LO = 1.5; // px disagreement where a pixel starts to look occluded
const OCC_HI = 6.0; // px disagreement where it is treated as fully occluded
const OCC_BLUR = 10; // box-blur radius applied to the occlusion mask
const FAST_LO = 6; // px/pair motion where limbs start to ghost when blended
const FAST_HI = 18; // px/pair motion treated as fully "snap to nearest"
const RESID_LO = 10; // luma residual between the two warps: below this, blend
const RESID_HI = 34; // above this the warps disagree outright -> pick one side

/* ------------------------------------------------------------------ io -- */

function readPPM(file) {
  const buf = execFileSync(
    "convert",
    [file, "-resize", `${WIDTH}x`, "-depth", "8", "ppm:-"],
    { maxBuffer: 1 << 30 },
  );
  let pos = 0;
  const token = () => {
    while ([32, 10, 13, 9].includes(buf[pos])) pos++;
    if (buf[pos] === 35) {
      while (buf[pos] !== 10) pos++;
      return token();
    }
    const start = pos;
    while (pos < buf.length && ![32, 10, 13, 9].includes(buf[pos])) pos++;
    return buf.toString("ascii", start, pos);
  };
  if (token() !== "P6") throw new Error(`not a P6 ppm: ${file}`);
  const w = parseInt(token(), 10);
  const h = parseInt(token(), 10);
  token();
  pos++;
  return { w, h, data: buf.subarray(pos, pos + w * h * 3) };
}

function writeJPG(img, file, quality = 84) {
  const header = Buffer.from(`P6\n${img.w} ${img.h}\n255\n`, "ascii");
  const tmp = path.join(OUT, ".tmp.ppm");
  writeFileSync(tmp, Buffer.concat([header, Buffer.from(img.data)]));
  execFileSync("convert", [tmp, "-quality", String(quality), "-strip", file]);
  rmSync(tmp, { force: true });
}

/* -------------------------------------------------------------- pyramid -- */

function toLuma(img) {
  const out = new Float32Array(img.w * img.h);
  for (let i = 0, p = 0; i < out.length; i++, p += 3) {
    out[i] = 0.299 * img.data[p] + 0.587 * img.data[p + 1] + 0.114 * img.data[p + 2];
  }
  return { w: img.w, h: img.h, data: out };
}

function halve(src) {
  const w = src.w >> 1;
  const h = src.h >> 1;
  const data = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * 2) * src.w + x * 2;
      data[y * w + x] =
        (src.data[i] + src.data[i + 1] + src.data[i + src.w] + src.data[i + src.w + 1]) / 4;
    }
  }
  return { w, h, data };
}

function pyramid(img) {
  const levels = [toLuma(img)];
  for (let i = 1; i < LEVELS; i++) levels.push(halve(levels[i - 1]));
  return levels; // levels[0] is full resolution
}

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

function sampleLuma(img, x, y) {
  const xi = clamp(Math.round(x), 0, img.w - 1);
  const yi = clamp(Math.round(y), 0, img.h - 1);
  return img.data[yi * img.w + xi];
}

/**
 * Sum of absolute differences between a patch in `a` at (ax,ay) and a patch in
 * `b` at (ax+vx, ay+vy).
 */
function patchSAD(a, b, ax, ay, vx, vy, radius, stride) {
  let sad = 0;
  let n = 0;
  for (let dy = -radius; dy <= radius; dy += stride) {
    for (let dx = -radius; dx <= radius; dx += stride) {
      sad += Math.abs(
        sampleLuma(a, ax + dx, ay + dy) - sampleLuma(b, ax + dx + vx, ay + dy + vy),
      );
      n++;
    }
  }
  return sad / n;
}

function smoothField(fx, fy, w, h, passes) {
  for (let p = 0; p < passes; p++) {
    const sx = Float32Array.from(fx);
    const sy = Float32Array.from(fy);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let ax = 0;
        let ay = 0;
        let n = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            ax += sx[ny * w + nx];
            ay += sy[ny * w + nx];
            n++;
          }
        }
        fx[y * w + x] = ax / n;
        fy[y * w + x] = ay / n;
      }
    }
  }
}

/**
 * Coarse-to-fine dense motion estimation from `a` to `b`.
 * Returns a field on a FLOW_STEP grid, in full-resolution pixels.
 */
function estimateFlow(pyrA, pyrB) {
  let gw = 0;
  let gh = 0;
  let fx = null;
  let fy = null;

  for (let lvl = LEVELS - 1; lvl >= 0; lvl--) {
    const a = pyrA[lvl];
    const b = pyrB[lvl];
    const scale = 1 << lvl;
    const step = Math.max(1, Math.round(FLOW_STEP / scale));
    const nw = Math.ceil(a.w / step);
    const nh = Math.ceil(a.h / step);
    const nx = new Float32Array(nw * nh);
    const ny = new Float32Array(nw * nh);
    const radius = (PATCH - 1) / 2;
    const search = lvl === LEVELS - 1 ? COARSE_SEARCH : REFINE;

    for (let gy = 0; gy < nh; gy++) {
      for (let gx = 0; gx < nw; gx++) {
        const px = gx * step;
        const py = gy * step;
        // Prediction from the coarser level (doubled), or zero at the top.
        let pvx = 0;
        let pvy = 0;
        if (fx) {
          const cx = clamp(Math.round((gx * step) / (step * 2)), 0, gw - 1);
          const cy = clamp(Math.round((gy * step) / (step * 2)), 0, gh - 1);
          pvx = fx[cy * gw + cx] * 2;
          pvy = fy[cy * gw + cx] * 2;
        }
        let best = Infinity;
        let bvx = pvx;
        let bvy = pvy;
        for (let dy = -search; dy <= search; dy++) {
          for (let dx = -search; dx <= search; dx++) {
            const vx = pvx + dx;
            const vy = pvy + dy;
            // Small penalty on magnitude keeps flat regions from drifting.
            const cost =
              patchSAD(a, b, px, py, vx, vy, radius, 2) +
              0.15 * (Math.abs(vx - pvx) + Math.abs(vy - pvy));
            if (cost < best) {
              best = cost;
              bvx = vx;
              bvy = vy;
            }
          }
        }
        nx[gy * nw + gx] = bvx;
        ny[gy * nw + gx] = bvy;
      }
    }
    smoothField(nx, ny, nw, nh, 2);
    fx = nx;
    fy = ny;
    gw = nw;
    gh = nh;
  }
  return { gw, gh, step: FLOW_STEP, fx, fy };
}

function sampleFlow(flow, x, y) {
  const gx = clamp(x / flow.step, 0, flow.gw - 1.001);
  const gy = clamp(y / flow.step, 0, flow.gh - 1.001);
  const x0 = Math.floor(gx);
  const y0 = Math.floor(gy);
  const tx = gx - x0;
  const ty = gy - y0;
  const at = (arr, cx, cy) =>
    arr[clamp(cy, 0, flow.gh - 1) * flow.gw + clamp(cx, 0, flow.gw - 1)];
  const mix = (arr) =>
    (at(arr, x0, y0) * (1 - tx) + at(arr, x0 + 1, y0) * tx) * (1 - ty) +
    (at(arr, x0, y0 + 1) * (1 - tx) + at(arr, x0 + 1, y0 + 1) * tx) * ty;
  return [mix(flow.fx), mix(flow.fy)];
}

function bilinearPixel(img, x, y, out) {
  const fx = clamp(x, 0, img.w - 1.001);
  const fy = clamp(y, 0, img.h - 1.001);
  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const tx = fx - x0;
  const ty = fy - y0;
  const x1 = Math.min(x0 + 1, img.w - 1);
  const y1 = Math.min(y0 + 1, img.h - 1);
  for (let c = 0; c < 3; c++) {
    const p00 = img.data[(y0 * img.w + x0) * 3 + c];
    const p10 = img.data[(y0 * img.w + x1) * 3 + c];
    const p01 = img.data[(y1 * img.w + x0) * 3 + c];
    const p11 = img.data[(y1 * img.w + x1) * 3 + c];
    out[c] = (p00 * (1 - tx) + p10 * tx) * (1 - ty) + (p01 * (1 - tx) + p11 * tx) * ty;
  }
}

/* --------------------------------------------------------- interpolate -- */

/** Separable box blur over a scalar mask, used to soften occlusion edges. */
function blurMask(mask, w, h, radius) {
  const tmp = new Float32Array(mask.length);
  const inv = 1 / (radius * 2 + 1);
  for (let y = 0; y < h; y++) {
    let sum = 0;
    for (let x = -radius; x <= radius; x++) sum += mask[y * w + clamp(x, 0, w - 1)];
    for (let x = 0; x < w; x++) {
      tmp[y * w + x] = sum * inv;
      sum += mask[y * w + clamp(x + radius + 1, 0, w - 1)];
      sum -= mask[y * w + clamp(x - radius, 0, w - 1)];
    }
  }
  for (let x = 0; x < w; x++) {
    let sum = 0;
    for (let y = -radius; y <= radius; y++) sum += tmp[clamp(y, 0, h - 1) * w + x];
    for (let y = 0; y < h; y++) {
      mask[y * w + x] = sum * inv;
      sum += tmp[clamp(y + radius + 1, 0, h - 1) * w + x];
      sum -= tmp[clamp(y - radius, 0, h - 1) * w + x];
    }
  }
}

function interpolate(a, b, fwd, bwd, t) {
  const n = a.w * a.h;
  const data = new Uint8Array(n * 3);
  const pa = new Float32Array(3);
  const pb = new Float32Array(3);

  // Pass 1: forward/backward consistency. A reliable match means following the
  // vector into B and back again returns roughly to the start. Large errors
  // mark disocclusions, where only one of the two frames has real content.
  const occ = new Float32Array(n);
  for (let y = 0; y < a.h; y++) {
    for (let x = 0; x < a.w; x++) {
      const [vx, vy] = sampleFlow(fwd, x, y);
      const [ux, uy] = sampleFlow(bwd, x, y);
      const [rx, ry] = sampleFlow(bwd, x + vx, y + vy);
      const err = Math.hypot(vx + rx, vy + ry);
      const conf = clamp((err - OCC_LO) / (OCC_HI - OCC_LO), 0, 1);

      // Even a well-matched fast-moving limb ghosts when two warps are mixed,
      // because sub-block flow error scales with displacement. Treat large
      // motion like a soft occlusion so those pixels favour one keyframe.
      const speed = Math.hypot(vx, vy);
      const fast = clamp((speed - FAST_LO) / (FAST_HI - FAST_LO), 0, 1);

      // Photometric check: warp both frames to time t and compare. If the two
      // warps disagree in luma, blending them would literally superimpose two
      // different bodies, which is exactly the ghosting we want to avoid.
      bilinearPixel(a, x - vx * t, y - vy * t, pa);
      bilinearPixel(b, x - ux * (1 - t), y - uy * (1 - t), pb);
      const la = 0.299 * pa[0] + 0.587 * pa[1] + 0.114 * pa[2];
      const lb = 0.299 * pb[0] + 0.587 * pb[1] + 0.114 * pb[2];
      const resid = clamp(
        (Math.abs(la - lb) - RESID_LO) / (RESID_HI - RESID_LO),
        0,
        1,
      );

      occ[y * a.w + x] = Math.max(conf, fast, resid);
    }
  }
  // Blur the mask so the blend weight varies smoothly instead of producing
  // hard-edged blotches where the confidence flips between neighbouring pixels.
  blurMask(occ, a.w, a.h, OCC_BLUR);

  // Pass 2: warp both sides toward time t and blend.
  for (let y = 0; y < a.h; y++) {
    for (let x = 0; x < a.w; x++) {
      const idx = y * a.w + x;
      const [vx, vy] = sampleFlow(fwd, x, y);
      const [ux, uy] = sampleFlow(bwd, x, y);
      bilinearPixel(a, x - vx * t, y - vy * t, pa);
      bilinearPixel(b, x - ux * (1 - t), y - uy * (1 - t), pb);

      // Consistent pixels blend linearly in time; occluded ones bias toward
      // the temporally nearer keyframe, which suppresses ghost limbs.
      const nearer = t < 0.5 ? 0 : 1;
      const w = t * (1 - occ[idx]) + nearer * occ[idx];

      const i = idx * 3;
      for (let c = 0; c < 3; c++) data[i + c] = Math.round(pa[c] * (1 - w) + pb[c] * w);
    }
  }
  return { w: a.w, h: a.h, data };
}

/* --------------------------------------------------------------- main --- */

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const frames = KEYFRAMES.map((f) => {
  const img = readPPM(path.join(HERO, f));
  return { name: f, img, pyr: pyramid(img) };
});

let index = 0;
const nextName = () => path.join(OUT, `${String(index++).padStart(3, "0")}.jpg`);

for (let k = 0; k < frames.length - 1; k++) {
  const a = frames[k];
  const b = frames[k + 1];
  writeJPG(a.img, nextName());
  const fwd = estimateFlow(a.pyr, b.pyr);
  const bwd = estimateFlow(b.pyr, a.pyr);
  for (let s = 1; s <= STEPS; s++) {
    writeJPG(interpolate(a.img, b.img, fwd, bwd, s / (STEPS + 1)), nextName());
  }
  console.log(`  ${a.name} -> ${b.name}`);
}
writeJPG(frames[frames.length - 1].img, nextName());

console.log(`wrote ${index} frames to ${path.relative(process.cwd(), OUT)}`);
