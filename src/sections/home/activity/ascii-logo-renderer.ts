type Point = [number, number, number];
type Face = [number, number, number];
type Mesh = { vertices: Point[]; faces: Face[] };

const COLUMNS = 72;
const ROWS = 36;
const SHADES = '.,:-=+*#%@';

// Beveled solids give the flat parts of the mark visible side faces and highlights.
function extrude(outline: [number, number][], centerX: number, centerY: number): Mesh {
  const vertices: Point[] = [];
  const faces: Face[] = [];
  const count = outline.length;
  const cx = outline.reduce((sum, point) => sum + point[0], 0) / count;
  const cy = outline.reduce((sum, point) => sum + point[1], 0) / count;
  [
    [0.91, 0.34],
    [1, 0.23],
    [1, -0.23],
    [0.91, -0.34],
  ].forEach(([scale, depth]) => {
    outline.forEach(([x, y]) => {
      vertices.push([centerX + cx + (x - cx) * scale, centerY + cy + (y - cy) * scale, depth]);
    });
  });
  vertices.push([centerX + cx, centerY + cy, 0.34], [centerX + cx, centerY + cy, -0.34]);
  for (let edge = 0; edge < count; edge += 1) {
    const next = (edge + 1) % count;
    faces.push([count * 4, edge, next], [count * 4 + 1, count * 3 + next, count * 3 + edge]);
    for (let layer = 0; layer < 3; layer += 1) {
      const a = layer * count + edge;
      const b = layer * count + next;
      faces.push([a, a + count, b + count], [a, b + count, b]);
    }
  }
  return { vertices, faces };
}

function sphere(): Mesh {
  const vertices: Point[] = [];
  const faces: Face[] = [];
  const rings = 16;
  const segments = 32;
  for (let ring = 0; ring <= rings; ring += 1) {
    const latitude = (ring / rings) * Math.PI;
    for (let segment = 0; segment < segments; segment += 1) {
      const longitude = (segment / segments) * Math.PI * 2;
      vertices.push([
        0.83 + Math.sin(latitude) * Math.cos(longitude) * 0.74,
        -0.83 + Math.cos(latitude) * 0.74,
        Math.sin(latitude) * Math.sin(longitude) * 0.74,
      ]);
    }
  }
  for (let ring = 0; ring < rings; ring += 1) {
    for (let segment = 0; segment < segments; segment += 1) {
      const a = ring * segments + segment;
      const b = ring * segments + ((segment + 1) % segments);
      faces.push([a, b, b + segments], [a, b + segments, a + segments]);
    }
  }
  return { vertices, faces };
}

const MESHES = [
  extrude(
    [
      [-0.74, -0.74],
      [0.74, -0.74],
      [0.74, 0.74],
      [-0.74, 0.74],
    ],
    -0.83,
    -0.83
  ),
  sphere(),
  extrude(
    [
      [-0.74, -0.74],
      [0.74, -0.74],
      [0.74, 0.74],
    ],
    0.83,
    0.83
  ),
].map((mesh) => {
  const center = mesh.vertices.reduce(
    (sum, vertex) => sum.map((value, axis) => value + vertex[axis] / mesh.vertices.length) as Point,
    [0, 0, 0] as Point
  );
  const normals = mesh.faces.map(([ia, ib, ic]) => {
    const a = mesh.vertices[ia];
    const u = mesh.vertices[ib].map((value, axis) => value - a[axis]);
    const v = mesh.vertices[ic].map((value, axis) => value - a[axis]);
    const n: Point = [
      u[1] * v[2] - u[2] * v[1],
      u[2] * v[0] - u[0] * v[2],
      u[0] * v[1] - u[1] * v[0],
    ];
    const length = Math.hypot(...n) || 1;
    const sign =
      n.reduce((sum, value, axis) => sum + value * (a[axis] - center[axis]), 0) < 0 ? -1 : 1;
    return n.map((value) => (value * sign) / length) as Point;
  });
  return { ...mesh, normals };
});

// Like the former ASCII donut: rotate 3D geometry, project it, then resolve
// overlapping faces with a depth buffer and map their lighting to characters.
export function renderAsciiLogo(time: number, pointerX = 0, pointerY = 0): string {
  const pixels = Array<string>(COLUMNS * ROWS).fill(' ');
  const depths = new Float32Array(COLUMNS * ROWS).fill(-Infinity);
  const ax = -0.22 + Math.sin(time * 0.55) * 0.3 + pointerY * 0.65;
  const ay = -0.3 + time * 0.48 + pointerX * 0.65;
  const az = Math.sin(time * 0.35) * 0.1;
  const cx = Math.cos(ax);
  const sx = Math.sin(ax);
  const cy = Math.cos(ay);
  const sy = Math.sin(ay);
  const cz = Math.cos(az);
  const sz = Math.sin(az);

  function rotate([x, y, z]: Point): Point {
    const ry = y * cx - z * sx;
    const rz = y * sx + z * cx;
    const rx = x * cy + rz * sy;
    return [rx * cz - ry * sz, rx * sz + ry * cz, rz * cy - x * sy];
  }

  MESHES.forEach((mesh) => {
    const projected = mesh.vertices.map((vertex) => {
      const [x, y, z] = rotate(vertex);
      const depth = 1 / (7.5 - z);
      return [COLUMNS / 2 + x * 108 * depth, ROWS / 2 + y * 54 * depth, depth] as Point;
    });
    mesh.faces.forEach(([ia, ib, ic], faceIndex) => {
      const [nx, ny, nz] = rotate(mesh.normals[faceIndex]);
      const a = projected[ia];
      const b = projected[ib];
      const c = projected[ic];
      const area = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
      if (Math.abs(area) < 0.0001) return;
      const light = 0.12 + Math.max(0, nx * -0.45 - ny * 0.6 + nz * 0.65) * 0.7;
      const highlight = Math.max(0, nx * -0.24 - ny * 0.32 + nz * 0.916) ** 18 * 0.25;
      const minX = Math.max(0, Math.floor(Math.min(a[0], b[0], c[0])));
      const maxX = Math.min(COLUMNS - 1, Math.ceil(Math.max(a[0], b[0], c[0])));
      const minY = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1])));
      const maxY = Math.min(ROWS - 1, Math.ceil(Math.max(a[1], b[1], c[1])));
      for (let row = minY; row <= maxY; row += 1) {
        for (let column = minX; column <= maxX; column += 1) {
          const x = column + 0.5;
          const y = row + 0.5;
          const wa = ((b[1] - c[1]) * (x - c[0]) + (c[0] - b[0]) * (y - c[1])) / area;
          const wb = ((c[1] - a[1]) * (x - c[0]) + (a[0] - c[0]) * (y - c[1])) / area;
          const wc = 1 - wa - wb;
          if (wa >= 0 && wb >= 0 && wc >= 0) {
            const depth = wa * a[2] + wb * b[2] + wc * c[2];
            const index = row * COLUMNS + column;
            if (depth > depths[index]) {
              depths[index] = depth;
              const shade = Math.max(0, Math.min(1, light + highlight + (depth - 0.13) * 1.2));
              pixels[index] = SHADES[Math.round(shade * (SHADES.length - 1))];
            }
          }
        }
      }
    });
  });
  return Array.from({ length: ROWS }, (_, row) =>
    pixels.slice(row * COLUMNS, (row + 1) * COLUMNS).join('')
  ).join('\n');
}
