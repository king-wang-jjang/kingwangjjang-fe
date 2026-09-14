'use client';

import { useRef, useEffect } from 'react';

import { renderAsciiLogo } from './ascii-logo-renderer';

// eslint-disable-next-line perfectionist/sort-imports
import styles from './ascii-logo.module.css';

const INITIAL_FRAME = renderAsciiLogo(0);
const FRAME_INTERVAL = 1000 / 24;

export function AsciiLogo({ motionEnabled }: { motionEnabled: boolean }) {
  const logoRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLPreElement>(null);
  const phaseRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const logo = logoRef.current;
    const frame = frameRef.current;
    if (!logo || !frame || !motionEnabled) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointerSurface = logo.closest('header') ?? logo;
    const pointer = pointerRef.current;
    let inView = typeof IntersectionObserver === 'undefined';
    let requestId: number | null = null;
    let previousTime: number | null = null;
    let previousPaint = -Infinity;
    const canAnimate = () => inView && !document.hidden && !reducedMotion.matches;
    const stop = () => {
      if (requestId !== null) cancelAnimationFrame(requestId);
      requestId = null;
      previousTime = null;
      logo.dataset.animating = 'false';
    };
    const animate = (now: number) => {
      requestId = null;
      if (!canAnimate()) {
        stop();
        return;
      }
      const delta = previousTime === null ? 0 : Math.min(now - previousTime, 50) / 1000;
      phaseRef.current += delta;
      previousTime = now;
      const smoothing = 1 - Math.exp(-delta * 8);
      pointer.x += (pointer.targetX - pointer.x) * smoothing;
      pointer.y += (pointer.targetY - pointer.y) * smoothing;
      if (now - previousPaint >= FRAME_INTERVAL) {
        // Only the text node changes; rotating geometry never shifts the document.
        frame.textContent = renderAsciiLogo(phaseRef.current, pointer.x, pointer.y);
        previousPaint = now;
      }
      requestId = requestAnimationFrame(animate);
    };
    const syncPlayback = () => {
      if (!canAnimate()) stop();
      else if (requestId === null) {
        logo.dataset.animating = 'true';
        requestId = requestAnimationFrame(animate);
      }
    };
    const movePointer = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !canAnimate()) return;
      const bounds = pointerSurface.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      pointer.targetX = Math.max(
        -1,
        Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2)
      );
      pointer.targetY = Math.max(
        -1,
        Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2)
      );
    };
    const resetPointer = () => {
      pointer.targetX = 0;
      pointer.targetY = 0;
    };
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting;
            syncPlayback();
          });

    observer?.observe(logo);
    document.addEventListener('visibilitychange', syncPlayback);
    reducedMotion.addEventListener('change', syncPlayback);
    pointerSurface.addEventListener('pointermove', movePointer, { passive: true });
    pointerSurface.addEventListener('pointerleave', resetPointer);
    syncPlayback();

    return () => {
      stop();
      observer?.disconnect();
      document.removeEventListener('visibilitychange', syncPlayback);
      reducedMotion.removeEventListener('change', syncPlayback);
      pointerSurface.removeEventListener('pointermove', movePointer);
      pointerSurface.removeEventListener('pointerleave', resetPointer);
    };
  }, [motionEnabled]);

  return (
    <div
      ref={logoRef}
      className={styles.logo}
      role="img"
      aria-label="마약 프로젝트 ASCII 로고: 입체 사각형, 구, 삼각기둥"
      data-ascii-logo
    >
      <div aria-hidden="true">
        <pre ref={frameRef} className={styles.frame} data-logo-frame>
          {INITIAL_FRAME}
        </pre>
      </div>
    </div>
  );
}
