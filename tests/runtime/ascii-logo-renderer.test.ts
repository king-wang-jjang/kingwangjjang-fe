import { test, expect } from 'vitest';

import { renderAsciiLogo } from 'src/sections/home/activity/ascii-logo-renderer';

test('renders a deterministic ASCII logo with multiple lighting levels', () => {
  const frame = renderAsciiLogo(0);
  expect(frame).toBe(renderAsciiLogo(0));
  expect(frame).toMatch(/^[ .,:\-=+*#%@\n]+$/);
  expect(new Set(frame.replace(/\s/g, '')).size).toBeGreaterThanOrEqual(5);
  const rows = frame.split('\n');
  const filled = (left: number, top: number, right: number, bottom: number) =>
    rows
      .slice(top, bottom)
      .map((row) => row.slice(left, right))
      .join('')
      .replace(/ /g, '').length;
  expect(filled(0, 0, 36, 18)).toBeGreaterThan(100);
  expect(filled(36, 0, 72, 18)).toBeGreaterThan(100);
  expect(filled(36, 18, 72, 36)).toBeGreaterThan(60);
  expect(filled(0, 18, 36, 36)).toBeLessThan(30);
});

test('changes the actual text projection with rotation and pointer tilt', () => {
  const frame = renderAsciiLogo(0);
  expect(renderAsciiLogo(1)).not.toBe(frame);
  expect(renderAsciiLogo(0, 1, 0)).not.toBe(frame);
  expect(renderAsciiLogo(0, 0, 1)).not.toBe(frame);
  expect(renderAsciiLogo(0, -1, -1)).not.toBe(renderAsciiLogo(0, 1, 1));
});

test('keeps rotating geometry inside a fixed character grid at extreme pointer positions', () => {
  for (let time = 0; time < 14; time += 1) {
    for (const [x, y] of [
      [0, 0],
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ]) {
      const rows = renderAsciiLogo(time, x, y).split('\n');
      expect(rows).toHaveLength(36);
      expect(rows.every((row) => row.length === 72)).toBe(true);
      expect(rows[0].trim()).toBe('');
      expect(rows.at(-1)?.trim()).toBe('');
      expect(rows.every((row) => row.startsWith(' ') && row.endsWith(' '))).toBe(true);
      expect(rows.join('').trim().length).toBeGreaterThan(100);
    }
  }
});
