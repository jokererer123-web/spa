"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll, useTransform, type MotionValue } from "framer-motion";

export const FRAME_COUNT = 41;

const framePath = (index: number) =>
  `/hero/seq/${String(index).padStart(3, "0")}.jpg`;

interface ScrollSequenceProps {
  /** 0 → 1 progress that drives the frame index. */
  progress: MotionValue<number>;
  className?: string;
  onReady?: () => void;
}

/**
 * Scroll-scrubbed massage sequence.
 *
 * Frames are decoded once up front (ImageBitmap where available) and painted
 * to a canvas from a single requestAnimationFrame loop. Scroll events only
 * update a ref, so no React re-render happens while scrubbing — that is what
 * keeps the animation at 60fps instead of dropping frames.
 */
export default function ScrollSequence({
  progress,
  className,
  onReady,
}: ScrollSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const framesRef = useRef<(ImageBitmap | HTMLImageElement)[]>([]);
  const targetRef = useRef(0); // frame index requested by scroll
  const drawnRef = useRef(-1); // frame index currently painted
  const rafRef = useRef<number | null>(null);
  const [loaded, setLoaded] = useState(0);
  const [ready, setReady] = useState(false);

  // Map scroll progress onto a frame index without re-rendering React.
  const frameIndex = useTransform(progress, [0, 1], [0, FRAME_COUNT - 1]);
  useMotionValueEvent(frameIndex, "change", (value) => {
    targetRef.current = value;
  });

  /* ------------------------------------------------------------ preload */
  useEffect(() => {
    let cancelled = false;
    const frames: (ImageBitmap | HTMLImageElement)[] = new Array(FRAME_COUNT);
    let done = 0;

    const load = async (i: number) => {
      const url = framePath(i);
      try {
        if (typeof createImageBitmap === "function") {
          const res = await fetch(url);
          const blob = await res.blob();
          const bitmap = await createImageBitmap(blob);
          if (cancelled) {
            bitmap.close();
            return;
          }
          frames[i] = bitmap;
        } else {
          const img = new Image();
          img.decoding = "async";
          img.src = url;
          await img.decode().catch(() => undefined);
          if (cancelled) return;
          frames[i] = img;
        }
      } catch {
        /* a missing frame just holds the previous one */
      } finally {
        if (!cancelled) {
          done += 1;
          setLoaded(done);
          // Reveal as soon as the opening frames are decodable.
          if (i === 0) setReady(true);
        }
      }
    };

    // Load the first frame immediately, then the rest with limited concurrency
    // so the network is not saturated on slow mobile connections.
    (async () => {
      await load(0);
      framesRef.current = frames;
      onReady?.();

      const queue = Array.from({ length: FRAME_COUNT - 1 }, (_, k) => k + 1);
      const CONCURRENCY = 6;
      await Promise.all(
        Array.from({ length: CONCURRENCY }, async () => {
          while (queue.length && !cancelled) {
            const next = queue.shift();
            if (next === undefined) break;
            await load(next);
          }
        }),
      );
    })();

    framesRef.current = frames;

    return () => {
      cancelled = true;
      for (const frame of frames) {
        if (frame && "close" in frame) frame.close();
      }
    };
  }, [onReady]);

  /* --------------------------------------------------------- paint loop */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { clientWidth, clientHeight } = canvas;
      const w = Math.round(clientWidth * dpr);
      const h = Math.round(clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        drawnRef.current = -1; // force a repaint at the new size
      }
    };

    /** Draws frame `i` with object-fit: cover semantics. */
    const paint = (i: number) => {
      const frames = framesRef.current;
      let frame = frames[i];
      // Fall back to the nearest already-decoded frame while loading.
      if (!frame) {
        for (let d = 1; d < FRAME_COUNT; d++) {
          frame = frames[i - d] ?? frames[i + d];
          if (frame) break;
        }
      }
      if (!frame) return;

      const cw = canvas.width;
      const ch = canvas.height;
      const iw = frame.width;
      const ih = frame.height;
      const scale = Math.max(cw / iw, ch / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      ctx.drawImage(frame, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    };

    const tick = () => {
      resize();
      const target = targetRef.current;
      const index = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(target)));
      if (index !== drawnRef.current) {
        paint(index);
        drawnRef.current = index;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [loaded]);

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        className="h-full w-full object-cover"
        aria-label="Reina Spa terapisti masaj uygularken"
        role="img"
      />
      {!ready && (
        <div className="absolute inset-0 grid place-items-center bg-ink-900">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-wine-700 border-t-crimson-500" />
        </div>
      )}
    </div>
  );
}

/** Convenience hook so the hero owns its own scroll range. */
export function useHeroScroll(ref: React.RefObject<HTMLElement | null>) {
  return useScroll({ target: ref, offset: ["start start", "end end"] });
}
