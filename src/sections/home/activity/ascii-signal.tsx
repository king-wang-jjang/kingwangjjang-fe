'use client';

import { useRef, useEffect } from 'react';

import { renderAsciiSignal } from './ascii-signal-renderer';

// eslint-disable-next-line perfectionist/sort-imports
import styles from './ascii-flow.module.css';

const INITIAL_FRAME = renderAsciiSignal(0);
const FRAME_INTERVAL = 1000 / 24;

export function AsciiSignal({ motionEnabled }: { motionEnabled: boolean }) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLPreElement>(null);
  const phaseRef = useRef(0);

  useEffect(() => {
    const surface = surfaceRef.current;
    const frame = frameRef.current;
    if (!surface || !frame || !motionEnabled) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointerSurface = surface.closest('header') ?? surface.parentElement;
    let inView = typeof IntersectionObserver === 'undefined';
    let requestId: number | null = null;
    let previousTime: number | null = null;
    let previousPaint = -Infinity;
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;

    const canAnimate = () => inView && !document.hidden && !reducedMotion.matches;

    const stop = () => {
      if (requestId !== null) cancelAnimationFrame(requestId);
      requestId = null;
      previousTime = null;
    };

    const animate = (now: number) => {
      requestId = null;
      if (!canAnimate()) return;
      if (previousTime !== null) phaseRef.current += Math.min(now - previousTime, 50) / 1000;
      previousTime = now;

      if (now - previousPaint >= FRAME_INTERVAL) {
        pointerX += (targetX - pointerX) * 0.12;
        pointerY += (targetY - pointerY) * 0.12;
        // Update only the decorative text node; the data/UI never rerenders per frame.
        frame.textContent = renderAsciiSignal(phaseRef.current, pointerX, pointerY);
        previousPaint = now;
      }
      requestId = requestAnimationFrame(animate);
    };

    const syncPlayback = () => {
      if (!canAnimate()) stop();
      else if (requestId === null) requestId = requestAnimationFrame(animate);
    };

    const movePointer = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !canAnimate()) return;
      const bounds = surface.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      targetX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
      targetY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
    };

    const resetPointer = () => {
      targetX = 0;
      targetY = 0;
    };

    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting;
            syncPlayback();
          });

    observer?.observe(surface);
    document.addEventListener('visibilitychange', syncPlayback);
    reducedMotion.addEventListener('change', syncPlayback);
    pointerSurface?.addEventListener('pointermove', movePointer, { passive: true });
    pointerSurface?.addEventListener('pointerleave', resetPointer);
    syncPlayback();

    return () => {
      stop();
      observer?.disconnect();
      document.removeEventListener('visibilitychange', syncPlayback);
      reducedMotion.removeEventListener('change', syncPlayback);
      pointerSurface?.removeEventListener('pointermove', movePointer);
      pointerSurface?.removeEventListener('pointerleave', resetPointer);
    };
  }, [motionEnabled]);

  return (
    <div ref={surfaceRef} className={styles.signal} data-ascii-flow="signal" aria-hidden="true">
      <pre ref={frameRef} className={styles.liveFrame} data-ascii-live>
        {INITIAL_FRAME}
      </pre>
    </div>
  );
}
