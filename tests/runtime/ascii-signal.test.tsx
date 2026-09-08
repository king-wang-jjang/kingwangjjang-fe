import { act, cleanup, render } from '@testing-library/react';
import { vi, test, expect, describe, afterEach, beforeEach } from 'vitest';

import { AsciiSignal } from 'src/sections/home/activity/ascii-signal';

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
  vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery));
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe = vi.fn();

      unobserve = vi.fn();

      disconnect = vi.fn(() => disconnectedObservers.add(this as unknown as IntersectionObserver));

      constructor(callback: IntersectionObserverCallback) {
        observers.push({ callback, observer: this as unknown as IntersectionObserver });
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
        observers.forEach(({ callback, observer }) => {
          if (!disconnectedObservers.has(observer)) {
            callback([{ isIntersecting } as IntersectionObserverEntry], observer);
          }
        });
      });
    },
  };
}

function getSignal(container: HTMLElement) {
  const signal = container.querySelector<HTMLPreElement>('pre[data-ascii-live]');
  expect(signal).not.toBeNull();
  return signal!;
}

describe('AsciiSignal', () => {
  let animation: ReturnType<typeof mockAnimationEnvironment>;

  beforeEach(() => {
    animation = mockAnimationEnvironment();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test('renders the same readable static frame when motion is disabled', () => {
    const first = render(<AsciiSignal motionEnabled={false} />);
    const initialFrame = getSignal(first.container).textContent;

    expect(initialFrame?.trim().length).toBeGreaterThan(0);
    expect(animation.pendingFrames.size).toBe(0);
    first.unmount();

    const second = render(<AsciiSignal motionEnabled={false} />);
    expect(getSignal(second.container).textContent).toBe(initialFrame);
    expect(animation.pendingFrames.size).toBe(0);
  });

  test('changes the actual ASCII characters as animation frames advance', () => {
    const { container } = render(<AsciiSignal motionEnabled />);
    const signal = getSignal(container);
    const initialFrame = signal.textContent;
    animation.setIntersecting(true);

    for (let timestamp = 0; timestamp <= 1000; timestamp += 50) {
      animation.frame(timestamp);
    }

    expect(signal.textContent).not.toBe(initialFrame);
    expect(animation.pendingFrames.size).toBe(1);
  });

  test('freezes the current frame while paused and cancels pending work on unmount', () => {
    const { container, rerender, unmount } = render(<AsciiSignal motionEnabled />);
    animation.setIntersecting(true);

    animation.frame(0);
    animation.frame(100);
    animation.frame(200);
    const pausedFrame = getSignal(container).textContent;
    const pendingId = Array.from(animation.pendingFrames.keys())[0];

    rerender(<AsciiSignal motionEnabled={false} />);

    expect(animation.cancelFrame).toHaveBeenCalledWith(pendingId);
    expect(animation.pendingFrames.size).toBe(0);
    animation.frame(10000);
    expect(getSignal(container).textContent).toBe(pausedFrame);

    rerender(<AsciiSignal motionEnabled />);
    expect(getSignal(container).textContent).toBe(pausedFrame);
    animation.setIntersecting(true);
    expect(animation.pendingFrames.size).toBe(1);
    animation.frame(10000);
    expect(getSignal(container).textContent).toBe(pausedFrame);
    animation.frame(10100);
    expect(getSignal(container).textContent).not.toBe(pausedFrame);

    unmount();
    expect(animation.pendingFrames.size).toBe(0);
  });

  test('does not schedule animation when reduced motion is already requested', () => {
    animation.mediaQuery.matches = true;
    const { container } = render(<AsciiSignal motionEnabled />);
    const initialFrame = getSignal(container).textContent;
    animation.setIntersecting(true);

    animation.frame(1000);

    expect(window.matchMedia).toHaveBeenCalledWith(REDUCED_MOTION_QUERY);
    expect(animation.requestFrame).not.toHaveBeenCalled();
    expect(getSignal(container).textContent).toBe(initialFrame);
  });

  test('responds to changes in the reduced-motion preference', () => {
    const { container } = render(<AsciiSignal motionEnabled />);
    animation.setIntersecting(true);
    animation.frame(0);
    animation.frame(100);
    const pausedFrame = getSignal(container).textContent;

    animation.setReducedMotion(true);
    expect(animation.pendingFrames.size).toBe(0);
    animation.frame(5000);
    expect(getSignal(container).textContent).toBe(pausedFrame);

    animation.setReducedMotion(false);
    expect(animation.pendingFrames.size).toBe(1);
    animation.frame(5000);
    animation.frame(5100);
    expect(getSignal(container).textContent).not.toBe(pausedFrame);
  });

  test('only runs while the page is visible and the signal is on screen', () => {
    render(<AsciiSignal motionEnabled />);
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
    const { unmount } = render(<AsciiSignal motionEnabled />);
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
