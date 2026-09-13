'use client';

import { useRef, useEffect } from 'react';

// eslint-disable-next-line perfectionist/sort-imports
import styles from './ascii-logo.module.css';

// Preserve logo-single.png's square / circle / lower-right triangle arrangement.
const FRAME = [
  '.--------------.     .----.     ',
  '|##############|   .########.   ',
  '|##############|  .##########.  ',
  '|##############| (############) ',
  '|##############| (############) ',
  '|##############|  .##########.  ',
  '|##############|   .########.   ',
  "'--------------'     '----'     ",
  '                +--------------+',
  '                  \\############|',
  '                    \\##########|',
  '                      \\########|',
  '                        \\######|',
  '                          \\####|',
  '                            \\##|',
  '                              \\|',
].join('\n');

export function AsciiLogo({ motionEnabled }: { motionEnabled: boolean }) {
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const logo = logoRef.current;
    if (!logo || !motionEnabled) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointerSurface = logo.closest('header') ?? logo;
    let inView = typeof IntersectionObserver === 'undefined';
    const canAnimate = () => inView && !document.hidden && !reducedMotion.matches;
    const syncPlayback = () => {
      logo.dataset.animating = String(canAnimate());
    };
    const movePointer = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !canAnimate()) return;
      const bounds = pointerSurface.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
      const y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
      logo.style.setProperty('--logo-x', `${x * 3}px`);
      logo.style.setProperty('--logo-y', `${y * 3}px`);
      logo.style.setProperty('--logo-turn', `${x * 5}deg`);
    };
    const resetPointer = () => {
      if (!canAnimate()) return;
      logo.style.setProperty('--logo-x', '0px');
      logo.style.setProperty('--logo-y', '0px');
      logo.style.setProperty('--logo-turn', '0deg');
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
      logo.dataset.animating = 'false';
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
      aria-label="마약 프로젝트 ASCII 로고: 사각형, 원, 삼각형"
      data-ascii-logo
    >
      <div className={styles.pointer} data-logo-pointer aria-hidden="true">
        <pre className={styles.frame} data-logo-frame>
          {FRAME}
        </pre>
      </div>
    </div>
  );
}
