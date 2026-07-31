import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { useHideHeaderOnScroll } from 'src/hooks/use-hide-header-on-scroll';

function setScrollY(value: number) {
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    value,
  });
}

function dispatchScroll(value: number) {
  act(() => {
    setScrollY(value);
    window.dispatchEvent(new Event('scroll'));
  });
}

describe('useHideHeaderOnScroll', () => {
  beforeEach(() => {
    setScrollY(0);
  });

  test('stays visible at the top, hides below the threshold, and restores while scrolling up', () => {
    const { result } = renderHook(() => useHideHeaderOnScroll(true, 64));

    expect(result.current).toBe(false);

    dispatchScroll(48);
    expect(result.current).toBe(false);

    dispatchScroll(65);
    expect(result.current).toBe(true);

    dispatchScroll(96);
    expect(result.current).toBe(true);

    dispatchScroll(80);
    expect(result.current).toBe(false);

    dispatchScroll(0);
    expect(result.current).toBe(false);
  });

  test('reveals when disabled and when its reset key changes', () => {
    const { result, rerender } = renderHook(
      ({ enabled, resetKey }: { enabled: boolean; resetKey: string }) =>
        useHideHeaderOnScroll(enabled, 64, resetKey),
      {
        initialProps: {
          enabled: true,
          resetKey: '/board',
        },
      }
    );

    dispatchScroll(100);
    expect(result.current).toBe(true);

    rerender({ enabled: false, resetKey: '/board' });
    expect(result.current).toBe(false);

    rerender({ enabled: true, resetKey: '/board' });
    dispatchScroll(140);
    expect(result.current).toBe(true);

    rerender({ enabled: true, resetKey: '/board/post-1' });
    expect(result.current).toBe(false);
  });

  test('removes its scroll listener on unmount', () => {
    const addEventListener = vi.spyOn(window, 'addEventListener');
    const removeEventListener = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useHideHeaderOnScroll(true, 64));
    const scrollRegistration = addEventListener.mock.calls.find(([type]) => type === 'scroll');

    expect(scrollRegistration).toBeDefined();

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith('scroll', scrollRegistration?.[1]);
  });
});
