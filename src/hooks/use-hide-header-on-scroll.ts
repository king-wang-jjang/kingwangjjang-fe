'use client';

import { useState, useEffect } from 'react';

export function useHideHeaderOnScroll(enabled: boolean, threshold = 64) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(false);

    if (!enabled) {
      return undefined;
    }

    let previousScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - previousScrollY;

      if (currentScrollY <= threshold) {
        setHidden(false);
      } else if (delta > 0) {
        setHidden(true);
      } else if (delta < 0) {
        setHidden(false);
      }

      previousScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [enabled, threshold]);

  return enabled && hidden;
}
