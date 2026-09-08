const COLUMNS = 72;
const ROWS = 28;
const SHADES = '.:-=+*#%@';

// A decorative rotating sculpture, independent of the community's actual metrics.
export function renderAsciiSignal(time: number, pointerX = 0, pointerY = 0) {
  const pixels = Array<string>(COLUMNS * ROWS).fill(' ');
  const depths = new Float32Array(COLUMNS * ROWS).fill(-Infinity);
  const tilt = 0.6 + time * 0.85 + pointerY * 0.9;
  const spin = time * 0.5 + pointerX * 0.9;
  const cosTilt = Math.cos(tilt);
  const sinTilt = Math.sin(tilt);
  const cosSpin = Math.cos(spin);
  const sinSpin = Math.sin(spin);

  function rotate(x: number, y: number, z: number) {
    const tiltedY = y * cosTilt - z * sinTilt;
    const tiltedZ = y * sinTilt + z * cosTilt;
    return [x * cosSpin + tiltedZ * sinSpin, tiltedY, tiltedZ * cosSpin - x * sinSpin];
  }

  function plot(x: number, y: number, z: number, glyph: string) {
    const perspective = 3.6 / (4.8 - z);
    const column = Math.round(COLUMNS / 2 + x * 18.5 * perspective);
    const row = Math.round(ROWS / 2 + y * 9 * perspective);
    if (column < 0 || column >= COLUMNS || row < 0 || row >= ROWS) return;
    const index = row * COLUMNS + column;
    if (z > depths[index]) {
      depths[index] = z;
      pixels[index] = glyph;
    }
  }

  // Sparse orbit trails pass both in front of and behind the central surface.
  for (let orbit = 0; orbit < 2; orbit += 1) {
    for (let step = 0; step < 72; step += 1) {
      const angle = (step / 72) * Math.PI * 2 + time * (orbit ? -0.7 : 0.9);
      const radius = 2 + orbit * 0.1;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * 0.38;
      const z = Math.sin(angle) * radius * 0.65;
      const [rx, ry, rz] = rotate(x, orbit ? -y : y, z);
      plot(rx, ry, rz, step % 18 === 0 ? '+' : '.');
    }
  }

  for (let ring = 0; ring < 96; ring += 1) {
    const u = (ring / 96) * Math.PI * 2;
    const cosU = Math.cos(u);
    const sinU = Math.sin(u);
    const radius = 1.05 + Math.sin(u * 3 + time * 1.8) * 0.08;

    for (let segment = 0; segment < 32; segment += 1) {
      const v = (segment / 32) * Math.PI * 2;
      const cosV = Math.cos(v);
      const sinV = Math.sin(v);
      const tube = 0.4 + Math.sin(time * 1.4) * 0.06;
      const [x, y, z] = rotate(
        (radius + tube * cosV) * cosU,
        (radius + tube * cosV) * sinU,
        tube * sinV
      );
      const [nx, ny, nz] = rotate(cosV * cosU, cosV * sinU, sinV);
      const light = Math.max(0, Math.min(1, 0.35 + nx * 0.25 - ny * 0.45 + nz * 0.55));
      plot(x, y, z, SHADES[Math.floor(light * (SHADES.length - 1))]);
    }
  }

  return Array.from({ length: ROWS }, (_row, row) =>
    pixels.slice(row * COLUMNS, (row + 1) * COLUMNS).join('')
  ).join('\n');
}
