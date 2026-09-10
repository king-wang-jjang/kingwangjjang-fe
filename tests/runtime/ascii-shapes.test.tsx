import { act, cleanup, render } from '@testing-library/react';
import { vi, test, expect, describe, afterEach, beforeEach } from 'vitest';

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

function getShape(container: HTMLElement) {
  const signal = container.querySelector<HTMLDivElement>('[data-ascii-object]');
  expect(signal).not.toBeNull();
  return signal!;
}

describe('AsciiShapes', () => {
  let animation: ReturnType<typeof mockAnimationEnvironment>;

  beforeEach(() => {
    animation = mockAnimationEnvironment();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test('keeps flat shapes still when motion is disabled', () => {
    const first = render(<AsciiShapes motionEnabled={false} />);
    const initialFrame = getShape(first.container).style.transform;

    expect(initialFrame?.trim().length).toBeGreaterThan(0);
    expect(animation.pendingFrames.size).toBe(0);
    first.unmount();

    const second = render(<AsciiShapes motionEnabled={false} />);
    expect(getShape(second.container).style.transform).toBe(initialFrame);
    expect(animation.pendingFrames.size).toBe(0);
  });

  test('moves flat shapes as animation frames advance', () => {
    const { container } = render(<AsciiShapes motionEnabled />);
    const signal = getShape(container);
    const initialFrame = signal.style.transform;
    animation.setIntersecting(true);

    for (let timestamp = 0; timestamp <= 1000; timestamp += 50) {
      animation.frame(timestamp);
    }

    expect(signal.style.transform).not.toBe(initialFrame);
    expect(animation.pendingFrames.size).toBe(1);
  });

  test('freezes the current frame while paused and cancels pending work on unmount', () => {
    const { container, rerender, unmount } = render(<AsciiShapes motionEnabled />);
    animation.setIntersecting(true);

    animation.frame(0);
    animation.frame(100);
    animation.frame(200);
    const pausedFrame = getShape(container).style.transform;
    const pendingId = Array.from(animation.pendingFrames.keys())[0];

    rerender(<AsciiShapes motionEnabled={false} />);

    expect(animation.cancelFrame).toHaveBeenCalledWith(pendingId);
    expect(animation.pendingFrames.size).toBe(0);
    animation.frame(10000);
    expect(getShape(container).style.transform).toBe(pausedFrame);

    rerender(<AsciiShapes motionEnabled />);
    expect(getShape(container).style.transform).toBe(pausedFrame);
    animation.setIntersecting(true);
    expect(animation.pendingFrames.size).toBe(1);
    animation.frame(10000);
    expect(getShape(container).style.transform).toBe(pausedFrame);
    animation.frame(10100);
    expect(getShape(container).style.transform).not.toBe(pausedFrame);

    unmount();
    expect(animation.pendingFrames.size).toBe(0);
  });

  test('does not schedule animation when reduced motion is already requested', () => {
    animation.mediaQuery.matches = true;
    const { container } = render(<AsciiShapes motionEnabled />);
    const initialFrame = getShape(container).style.transform;
    animation.setIntersecting(true);

    animation.frame(1000);

    expect(window.matchMedia).toHaveBeenCalledWith(REDUCED_MOTION_QUERY);
    expect(animation.requestFrame).not.toHaveBeenCalled();
    expect(getShape(container).style.transform).toBe(initialFrame);
  });

  test('responds to changes in the reduced-motion preference', () => {
    const { container } = render(<AsciiShapes motionEnabled />);
    animation.setIntersecting(true);
    animation.frame(0);
    animation.frame(100);
    const pausedFrame = getShape(container).style.transform;

    animation.setReducedMotion(true);
    expect(animation.pendingFrames.size).toBe(0);
    animation.frame(5000);
    expect(getShape(container).style.transform).toBe(pausedFrame);

    animation.setReducedMotion(false);
    expect(animation.pendingFrames.size).toBe(1);
    animation.frame(5000);
    animation.frame(5100);
    expect(getShape(container).style.transform).not.toBe(pausedFrame);
  });

  test('only runs while the page is visible and the background is on screen', () => {
    render(<AsciiShapes motionEnabled />);
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
    const { unmount } = render(<AsciiShapes motionEnabled />);
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
