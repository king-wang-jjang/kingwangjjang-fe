import { act, cleanup, render, fireEvent } from '@testing-library/react';
import { vi, test, expect, describe, afterEach, beforeEach } from 'vitest';

import { AsciiLogo } from 'src/sections/home/activity/ascii-logo';
import { AsciiShapes } from 'src/sections/home/activity/ascii-shapes';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function mockAnimationEnvironment(reducedMotion = false) {
  let requestId = 0;
  let hidden = false;
  const pendingFrames = new Map<number, FrameRequestCallback>();
  const mediaListeners = new Set<(event: MediaQueryListEvent) => void>();
  const disconnectedObservers = new Set<IntersectionObserver>();
  const observers: {
    callback: IntersectionObserverCallback;
    observer: IntersectionObserver;
    targets: Element[];
  }[] = [];

  const requestFrame = vi.fn((callback: FrameRequestCallback) => {
    requestId += 1;
    pendingFrames.set(requestId, callback);
    return requestId;
  });
  const cancelFrame = vi.fn((id: number) => pendingFrames.delete(id));
  const mediaQuery = {
    matches: reducedMotion,
    media: REDUCED_MOTION_QUERY,
    addEventListener: vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) => {
      mediaListeners.add(listener);
    }),
    removeEventListener: vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) => {
      mediaListeners.delete(listener);
    }),
  };

  vi.stubGlobal('requestAnimationFrame', requestFrame);
  vi.stubGlobal('cancelAnimationFrame', cancelFrame);
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => mediaQuery)
  );
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      targets: Element[] = [];

      observe = vi.fn((target: Element) => this.targets.push(target));

      unobserve = vi.fn();

      disconnect = vi.fn(() => disconnectedObservers.add(this as unknown as IntersectionObserver));

      constructor(callback: IntersectionObserverCallback) {
        observers.push({
          callback,
          observer: this as unknown as IntersectionObserver,
          targets: this.targets,
        });
      }
    }
  );
  vi.spyOn(document, 'visibilityState', 'get').mockImplementation(() =>
    hidden ? 'hidden' : 'visible'
  );
  vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden);

  return {
    pendingFrames,
    requestFrame,
    cancelFrame,
    mediaQuery,
    mediaListeners,
    observers,
    frame(timestamp: number) {
      act(() => {
        const callbacks = Array.from(pendingFrames.values());
        pendingFrames.clear();
        callbacks.forEach((callback) => callback(timestamp));
      });
    },
    setReducedMotion(matches: boolean) {
      act(() => {
        mediaQuery.matches = matches;
        const event = { matches, media: REDUCED_MOTION_QUERY } as MediaQueryListEvent;
        mediaListeners.forEach((listener) => listener(event));
      });
    },
    setVisible(visible: boolean) {
      act(() => {
        hidden = !visible;
        document.dispatchEvent(new Event('visibilitychange'));
      });
    },
    setIntersecting(isIntersecting: boolean) {
      act(() => {
        observers.forEach(({ callback, observer, targets }) => {
          if (!disconnectedObservers.has(observer)) {
            callback(
              targets.map((target) => ({ target, isIntersecting }) as IntersectionObserverEntry),
              observer
            );
          }
        });
      });
    },
  };
}

function getFrame(container: HTMLElement) {
  const frame = container.querySelector('[data-logo-frame]');
  if (frame) return frame.textContent!;
  const shape = container.querySelector<HTMLElement>('[data-ascii-object]');
  expect(shape).not.toBeNull();
  return shape!.style.transform;
}

describe.each([
  { name: 'AsciiShapes', Subject: AsciiShapes },
  { name: 'AsciiLogo', Subject: AsciiLogo },
])('$name', ({ Subject }) => {
  let animation: ReturnType<typeof mockAnimationEnvironment>;

  beforeEach(() => {
    animation = mockAnimationEnvironment();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  if (Subject === AsciiLogo) {
    test('tilts the 3D projection with the mouse, ignores touch, and returns after pointer leave', () => {
      const baseline = render(<AsciiLogo motionEnabled />);
      const mouse = render(<AsciiLogo motionEnabled />);
      const touch = render(<AsciiLogo motionEnabled />);
      const mouseLogo = mouse.container.querySelector<HTMLElement>('[data-ascii-logo]')!;
      const touchLogo = touch.container.querySelector<HTMLElement>('[data-ascii-logo]')!;
      for (const logo of [mouseLogo, touchLogo]) {
        vi.spyOn(logo, 'getBoundingClientRect').mockReturnValue({
          x: 0,
          y: 0,
          left: 0,
          top: 0,
          width: 100,
          height: 100,
          right: 100,
          bottom: 100,
          toJSON: () => ({}),
        });
      }
      animation.setIntersecting(true);
      const move = (target: HTMLElement, pointerType: string) =>
        fireEvent(
          target,
          Object.assign(new Event('pointermove', { bubbles: true }), {
            pointerType,
            clientX: 90,
            clientY: 10,
          })
        );
      move(mouseLogo, 'mouse');
      move(touchLogo, 'touch');
      for (let time = 0; time <= 1000; time += 50) animation.frame(time);
      expect(getFrame(mouse.container)).not.toBe(getFrame(baseline.container));
      expect(getFrame(touch.container)).toBe(getFrame(baseline.container));
      fireEvent.pointerLeave(mouseLogo);
      for (let time = 1050; time <= 4000; time += 50) animation.frame(time);
      expect(getFrame(mouse.container)).toBe(getFrame(baseline.container));
      baseline.unmount();
      mouse.unmount();
      touch.unmount();
      expect(animation.pendingFrames.size).toBe(0);
    });
  }

  test('keeps ASCII artwork still when motion is disabled', () => {
    const first = render(<Subject motionEnabled={false} />);
    const initialFrame = getFrame(first.container);

    expect(initialFrame?.trim().length).toBeGreaterThan(0);
    expect(animation.pendingFrames.size).toBe(0);
    first.unmount();

    const second = render(<Subject motionEnabled={false} />);
    expect(getFrame(second.container)).toBe(initialFrame);
    expect(animation.pendingFrames.size).toBe(0);
  });

  test('moves ASCII artwork as animation frames advance', () => {
    const { container } = render(<Subject motionEnabled />);
    const initialFrame = getFrame(container);
    animation.setIntersecting(true);

    for (let timestamp = 0; timestamp <= 1000; timestamp += 50) {
      animation.frame(timestamp);
    }

    expect(getFrame(container)).not.toBe(initialFrame);
    expect(animation.pendingFrames.size).toBe(1);
  });

  test('freezes the current frame while paused and cancels pending work on unmount', () => {
    const { container, rerender, unmount } = render(<Subject motionEnabled />);
    animation.setIntersecting(true);

    animation.frame(0);
    animation.frame(100);
    animation.frame(200);
    const pausedFrame = getFrame(container);
    const pendingId = Array.from(animation.pendingFrames.keys())[0];

    rerender(<Subject motionEnabled={false} />);

    expect(animation.cancelFrame).toHaveBeenCalledWith(pendingId);
    expect(animation.pendingFrames.size).toBe(0);
    animation.frame(10000);
    expect(getFrame(container)).toBe(pausedFrame);

    rerender(<Subject motionEnabled />);
    expect(getFrame(container)).toBe(pausedFrame);
    animation.setIntersecting(true);
    expect(animation.pendingFrames.size).toBe(1);
    animation.frame(10000);
    expect(getFrame(container)).toBe(pausedFrame);
    animation.frame(10100);
    expect(getFrame(container)).not.toBe(pausedFrame);

    unmount();
    expect(animation.pendingFrames.size).toBe(0);
  });

  test('does not schedule animation when reduced motion is already requested', () => {
    animation.mediaQuery.matches = true;
    const { container } = render(<Subject motionEnabled />);
    const initialFrame = getFrame(container);
    animation.setIntersecting(true);

    animation.frame(1000);

    expect(window.matchMedia).toHaveBeenCalledWith(REDUCED_MOTION_QUERY);
    expect(animation.requestFrame).not.toHaveBeenCalled();
    expect(getFrame(container)).toBe(initialFrame);
  });

  test('responds to changes in the reduced-motion preference', () => {
    const { container } = render(<Subject motionEnabled />);
    animation.setIntersecting(true);
    animation.frame(0);
    animation.frame(100);
    const pausedFrame = getFrame(container);

    animation.setReducedMotion(true);
    expect(animation.pendingFrames.size).toBe(0);
    animation.frame(5000);
    expect(getFrame(container)).toBe(pausedFrame);

    animation.setReducedMotion(false);
    expect(animation.pendingFrames.size).toBe(1);
    animation.frame(5000);
    animation.frame(5100);
    expect(getFrame(container)).not.toBe(pausedFrame);
  });

  test('only runs while the page is visible and the artwork is on screen', () => {
    render(<Subject motionEnabled />);
    expect(animation.observers).toHaveLength(1);
    expect(animation.pendingFrames.size).toBe(0);

    animation.setIntersecting(true);
    expect(animation.pendingFrames.size).toBe(1);

    animation.setIntersecting(false);
    expect(animation.pendingFrames.size).toBe(0);

    animation.setVisible(false);
    animation.setIntersecting(true);
    expect(animation.pendingFrames.size).toBe(0);

    animation.setVisible(true);
    expect(animation.pendingFrames.size).toBe(1);

    animation.setVisible(false);
    expect(animation.pendingFrames.size).toBe(0);
  });

  test('releases observers and event listeners when unmounted', () => {
    const removeListener = vi.spyOn(document, 'removeEventListener');
    const { unmount } = render(<Subject motionEnabled />);
    expect(animation.mediaListeners.size).toBe(1);
    animation.setIntersecting(true);

    unmount();

    expect(animation.pendingFrames.size).toBe(0);
    expect(animation.mediaListeners.size).toBe(0);
    expect(animation.observers[0].observer.disconnect).toHaveBeenCalledOnce();
    expect(removeListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    animation.setReducedMotion(true);
    animation.setReducedMotion(false);
    animation.setVisible(false);
    animation.setVisible(true);
    expect(animation.pendingFrames.size).toBe(0);
  });
});
