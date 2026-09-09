import { test, expect } from 'vitest';

import { renderAsciiSolid } from 'src/sections/home/activity/ascii-solids-renderer';

import type { SolidShape } from 'src/sections/home/activity/ascii-solids-renderer';

test.each<SolidShape>(['cube', 'sphere', 'prism'])(
  '%s stays shaded and unclipped while rotating',
  (shape) => {
    const frames = new Set<string>();
    for (let step = 0; step < 36; step += 1) {
      const frame = renderAsciiSolid(shape, step * 0.7, step % 6);
      const rows = frame.split('\n');
      const glyphs = frame.replace(/\s/g, '');
      expect(frame).toMatch(/^[ .:\-=+*#%@\n]+$/);
      expect(glyphs.length).toBeGreaterThan(80);
      expect(new Set(glyphs).size).toBeGreaterThan(1);
      expect(rows[0].trim()).toBe('');
      expect(rows.at(-1)?.trim()).toBe('');
      expect(rows.every((row) => row.startsWith(' ') && row.endsWith(' '))).toBe(true);
      frames.add(frame);
    }
    expect(frames.size).toBeGreaterThan(30);
    expect(renderAsciiSolid(shape, 0, 2)).toBe(renderAsciiSolid(shape, 0, 2));
  }
);
