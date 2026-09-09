export type SolidShape = 'cube' | 'sphere' | 'prism';

type Point = [number, number, number];
type Face = [number, number, number];
type Mesh = { vertices: Point[]; faces: Face[]; edges?: [number, number][] };

const COLUMNS = 48;
const ROWS = 28;
const SHADES = '.:-=+*#%@';

const cube: Mesh = {
  edges: [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ],
  vertices: [
    [-0.8, -0.8, 0.8],
    [0.8, -0.8, 0.8],
    [0.8, 0.8, 0.8],
    [-0.8, 0.8, 0.8],
    [-0.8, -0.8, -0.8],
    [0.8, -0.8, -0.8],
    [0.8, 0.8, -0.8],
    [-0.8, 0.8, -0.8],
  ],
  faces: [
    [0, 1, 2],
    [0, 2, 3],
    [4, 7, 6],
    [4, 6, 5],
    [1, 5, 6],
    [1, 6, 2],
    [4, 0, 3],
    [4, 3, 7],
    [4, 5, 1],
    [4, 1, 0],
    [3, 2, 6],
    [3, 6, 7],
  ],
};

// Extrusion of a right triangle: a vertical edge meets its base at 90 degrees.
const prism: Mesh = {
  edges: [
    [0, 1],
    [1, 2],
    [2, 0],
    [3, 4],
    [4, 5],
    [5, 3],
    [0, 3],
    [1, 4],
    [2, 5],
  ],
  vertices: [
    [-0.6, -1.2, 0.55],
    [1.2, 0.6, 0.55],
    [-0.6, 0.6, 0.55],
    [-0.6, -1.2, -0.55],
    [1.2, 0.6, -0.55],
    [-0.6, 0.6, -0.55],
  ],
  faces: [
    [0, 1, 2],
    [3, 5, 4],
    [0, 3, 4],
    [0, 4, 1],
    [1, 4, 5],
    [1, 5, 2],
    [2, 5, 3],
    [2, 3, 0],
  ],
};

function createSphere(): Mesh {
  const vertices: Point[] = [];
  const faces: Face[] = [];
  const rings = 10;
  const segments = 16;

  for (let ring = 0; ring <= rings; ring += 1) {
    const latitude = (ring / rings) * Math.PI;
    for (let segment = 0; segment < segments; segment += 1) {
      const longitude = (segment / segments) * Math.PI * 2;
      vertices.push([
        Math.sin(latitude) * Math.cos(longitude),
        Math.cos(latitude),
        Math.sin(latitude) * Math.sin(longitude),
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

const MESHES: Record<SolidShape, Mesh> = { cube, sphere: createSphere(), prism };

function normal(a: Point, b: Point, c: Point): Point {
  const u = b.map((value, axis) => value - a[axis]);
  const v = c.map((value, axis) => value - a[axis]);
  const n: Point = [
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0],
  ];
  const length = Math.hypot(...n) || 1;
  // All three meshes are convex and centered around an interior origin.
  const direction = n.reduce((sum, value, axis) => sum + value * a[axis], 0) < 0 ? -1 : 1;
  return n.map((value) => (value * direction) / length) as Point;
}

const NORMALS = Object.fromEntries(
  Object.entries(MESHES).map(([shape, mesh]) => [
    shape,
    mesh.faces.map(([a, b, c]) => normal(mesh.vertices[a], mesh.vertices[b], mesh.vertices[c])),
  ])
) as Record<SolidShape, Point[]>;

// Rasterize real 3D surfaces into text: perspective, face lighting and a depth
// buffer keep the solids intact while they tumble around all three axes.
export function renderAsciiSolid(shape: SolidShape, time: number, seed = 0): string {
  const mesh = MESHES[shape];
  const pixels = Array<string>(COLUMNS * ROWS).fill(' ');
  const depths = new Float32Array(COLUMNS * ROWS).fill(-Infinity);
  const direction = seed % 2 ? -1 : 1;
  const ax = 0.45 + seed * 1.73 + time * 0.31 * direction;
  const ay = 0.6 + seed * 2.39 + time * 0.43;
  const az = seed * 0.83 + time * 0.17 * direction;
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
    const depth = rz * cy - x * sy;
    return [rx * cz - ry * sz, rx * sz + ry * cz, depth];
  }

  const projected = mesh.vertices.map((vertex) => {
    const [x, y, z] = rotate(vertex);
    const depth = 1 / (4.8 - z);
    return [COLUMNS / 2 + x * 66 * depth, ROWS / 2 + y * 39.6 * depth, depth] as Point;
  });

  mesh.faces.forEach(([ia, ib, ic], faceIndex) => {
    const [nx, ny, nz] = rotate(NORMALS[shape][faceIndex]);
    if (nz < -0.25) return;
    const a = projected[ia];
    const b = projected[ib];
    const c = projected[ic];
    const area = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
    if (Math.abs(area) < 0.001) return;
    const light =
      0.12 + Math.max(0, nx * -0.6 - ny * 0.7 + nz * 0.4) * 0.65 + Math.max(0, nz) * 0.22;
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
            const shade = Math.max(0, Math.min(1, light + (depth - 0.2) * 0.65));
            pixels[index] = SHADES[Math.round(shade * (SHADES.length - 1))];
          }
        }
      }
    }
  });

  // Visible structural edges make the cube and triangular prism readable even
  // when neighboring faces happen to receive similar illumination.
  mesh.edges?.forEach(([ia, ib]) => {
    const a = projected[ia];
    const b = projected[ib];
    const steps = Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])) * 2);
    for (let step = 0; step <= steps; step += 1) {
      const t = steps ? step / steps : 0;
      const column = Math.floor(a[0] + (b[0] - a[0]) * t);
      const row = Math.floor(a[1] + (b[1] - a[1]) * t);
      const depth = a[2] + (b[2] - a[2]) * t;
      if (column >= 0 && column < COLUMNS && row >= 0 && row < ROWS) {
        const index = row * COLUMNS + column;
        if (depth >= depths[index] - 0.002) pixels[index] = '@';
      }
    }
  });

  return Array.from({ length: ROWS }, (_, row) =>
    pixels.slice(row * COLUMNS, (row + 1) * COLUMNS).join('')
  ).join('\n');
}
