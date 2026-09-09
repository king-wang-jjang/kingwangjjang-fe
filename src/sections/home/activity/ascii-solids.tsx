'use client';

import { useRef, useEffect } from 'react';

import { renderAsciiSolid } from './ascii-solids-renderer';

import type { SolidShape } from './ascii-solids-renderer';

// eslint-disable-next-line perfectionist/sort-imports
import styles from './ascii-solids.module.css';

const SHAPES: SolidShape[] = ['cube', 'sphere', 'prism'];
const MOBILE_OBJECT_COUNT = 162;
const OBJECTS = Array.from({ length: 324 }, (_, index) => {
  const shape = SHAPES[index % SHAPES.length];
  return {
    shape,
    x: (0.08 + index * 0.618034) % 1,
    y: (0.06 + index * 0.381966 + Math.floor(index / 6) * 0.13) % 1,
    speedX: Math.cos(index * 2.4 + 0.3) * (10 + (index % 5) * 3),
    speedY: Math.sin(index * 1.7 + 0.6) * (8 + (index % 4) * 3),
    frame: renderAsciiSolid(shape, 0, index),
  };
});
const FRAME_INTERVAL = 1000 / 20;

function wrap(value: number, extent: number) {
  const margin = 48;
  return (
    ((((value + margin) % (extent + margin * 2)) + extent + margin * 2) % (extent + margin * 2)) -
    margin
  );
}

export function AsciiSolids({ motionEnabled }: { motionEnabled: boolean }) {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const elapsedRef = useRef(0);

  useEffect(() => {
    const background = backgroundRef.current;
    if (!background || !motionEnabled) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = window.matchMedia('(max-width: 599.95px)');
    const objects = Array.from(background.querySelectorAll<HTMLElement>('[data-ascii-object]'));
    const frames = objects.map((object) => object.querySelector('pre')!);
    const visible = new Set<Element>();
    let width = background.clientWidth;
    let height = background.clientHeight;
    let inView = typeof IntersectionObserver === 'undefined';
    let requestId: number | null = null;
    let previousTime: number | null = null;
    let previousPaint = -Infinity;

    const canAnimate = () => inView && !document.hidden && !reducedMotion.matches;
    const stop = () => {
      if (requestId !== null) cancelAnimationFrame(requestId);
      requestId = null;
      previousTime = null;
      background.dataset.animating = 'false';
    };

    const positionObjects = () => {
      const time = elapsedRef.current;
      objects.forEach((object, index) => {
        if (mobile.matches && index >= MOBILE_OBJECT_COUNT) return;
        const model = OBJECTS[index];
        const x = wrap(
          model.x * width +
            model.speedX * time +
            Math.sin(time * 0.21 + index) * 34 -
            Math.sin(index) * 34,
          width
        );
        const y = wrap(
          model.y * height +
            model.speedY * time +
            Math.cos(time * 0.17 + index) * 42 -
            Math.cos(index) * 42,
          height
        );
        const depth = Math.sin(time * 0.22 + index * 1.9);
        object.style.transform = `translate3d(${x - model.x * width}px, ${y - model.y * height}px, 0)`;
        object.style.opacity = String(0.58 + (depth + 1) * 0.21);
      });
    };

    const animate = (now: number) => {
      requestId = null;
      if (!canAnimate()) {
        stop();
        return;
      }
      if (previousTime !== null) elapsedRef.current += Math.min(now - previousTime, 50) / 1000;
      previousTime = now;
      positionObjects();

      if (now - previousPaint >= FRAME_INTERVAL) {
        objects.forEach((object, index) => {
          if (!visible.has(object) || (mobile.matches && index >= MOBILE_OBJECT_COUNT)) return;
          frames[index].textContent = renderAsciiSolid(
            OBJECTS[index].shape,
            elapsedRef.current,
            index
          );
        });
        previousPaint = now;
      }
      requestId = requestAnimationFrame(animate);
    };

    const syncPlayback = () => {
      if (!canAnimate()) stop();
      else if (requestId === null) {
        background.dataset.animating = 'true';
        requestId = requestAnimationFrame(animate);
      }
    };

    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.target === background) inView = entry.isIntersecting;
              else {
                if (entry.isIntersecting) visible.add(entry.target);
                else visible.delete(entry.target);
                (entry.target as HTMLElement).dataset.inView = String(entry.isIntersecting);
              }
            });
            syncPlayback();
          });
    observer?.observe(background);
    objects.forEach((object) => {
      if (observer) observer.observe(object);
      else visible.add(object);
    });
    const resizeObjects = () => {
      width = background.clientWidth;
      height = background.clientHeight;
      positionObjects();
    };
    const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resizeObjects);
    resize?.observe(background);
    window.addEventListener('resize', resizeObjects);
    document.addEventListener('visibilitychange', syncPlayback);
    reducedMotion.addEventListener('change', syncPlayback);
    syncPlayback();

    return () => {
      stop();
      observer?.disconnect();
      resize?.disconnect();
      window.removeEventListener('resize', resizeObjects);
      document.removeEventListener('visibilitychange', syncPlayback);
      reducedMotion.removeEventListener('change', syncPlayback);
    };
  }, [motionEnabled]);

  return (
    <div
      ref={backgroundRef}
      className={styles.background}
      data-ascii-flow="ambient"
      aria-hidden="true"
    >
      {OBJECTS.map((model, index) => (
        <div
          key={index}
          className={styles.object}
          data-ascii-object={model.shape}
          data-ascii-track
          style={{
            left: `${model.x * 100}%`,
            top: `${model.y * 100}%`,
          }}
        >
          <pre>{model.frame}</pre>
        </div>
      ))}
    </div>
  );
}
