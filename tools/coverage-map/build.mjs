// Regenerates src/data/map/krkonose-geometry.ts from open geographic data.
// Run from this folder: `npm install && npm run build`. Downloads are cached in .cache/.
// Sources and licences are listed in docs/svozova-oblast.md.
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { contours } from 'd3-contour';
import { PNG } from 'pngjs';
import { mapFrame } from '../../src/data/map/frame.ts';

const here = dirname(fileURLToPath(import.meta.url));
const cacheDir = join(here, '.cache');
const outFile = join(here, '../../src/data/map/krkonose-geometry.ts');

const SOURCES = {
  // ČÚZK INSPIRE Administrative Units (CC BY 4.0), converted to GeoJSON by github.com/siwekm/czech-geojson.
  regions: 'https://raw.githubusercontent.com/siwekm/czech-geojson/master/kraje.json',
  // Terrain Tiles on AWS Open Data (Terrarium encoding). In Europe built from Copernicus EU-DEM and SRTM.
  terrain: (z, x, y) => `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`,
};
const TERRAIN_ZOOM = 11;
const CONTOUR_STEP = 100;
const CONTOUR_MIN = 700;
const SIMPLIFY = { border: 0.3, region: 0.4, contour: 0.7 };

const { width, height } = mapFrame;
const kx = mapFrame.pxPerDegLon;
const ky = mapFrame.pxPerDegLat;
const project = ([lon, lat]) => [(lon - mapFrame.west) * kx, (mapFrame.north - lat) * ky];
const pad = 4;
const inside = ([x, y], m = pad) => x >= -m && x <= width + m && y >= -m && y <= height + m;

async function cached(name, url, binary = false) {
  const file = join(cacheDir, name);
  try { await access(file); } catch {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
    await mkdir(cacheDir, { recursive: true });
    await writeFile(file, Buffer.from(await response.arrayBuffer()));
  }
  return binary ? readFile(file) : readFile(file, 'utf8');
}

// Douglas–Peucker in projected units.
function simplify(points, tolerance) {
  if (points.length < 3) return points;
  const [fx, fy] = points[0]; const [lx, ly] = points[points.length - 1];
  if (fx === lx && fy === ly) {
    // Closed ring: split at the farthest vertex so both halves have a real baseline.
    let far = 1;
    points.forEach((p, i) => { if (Math.hypot(p[0] - fx, p[1] - fy) > Math.hypot(points[far][0] - fx, points[far][1] - fy)) far = i; });
    return [...simplifyOpen(points.slice(0, far + 1), tolerance).slice(0, -1), ...simplifyOpen(points.slice(far), tolerance)];
  }
  return simplifyOpen(points, tolerance);
}

function simplifyOpen(points, tolerance) {
  if (points.length < 3) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = points[a]; const [bx, by] = points[b];
    const dx = bx - ax; const dy = by - ay; const len = Math.hypot(dx, dy) || 1;
    let max = 0; let index = -1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs(dy * points[i][0] - dx * points[i][1] + bx * ay - by * ax) / len;
      if (d > max) { max = d; index = i; }
    }
    if (max > tolerance) { keep[index] = 1; stack.push([a, index], [index, b]); }
  }
  return points.filter((_, i) => keep[i]);
}

// Splits a polyline into the runs that fall inside the padded frame.
function clipLine(points) {
  const runs = []; let run = [];
  points.forEach((p, i) => {
    const prev = points[i - 1]; const next = points[i + 1];
    if (inside(p) || (prev && inside(prev)) || (next && inside(next))) run.push(p);
    else if (run.length) { runs.push(run); run = []; }
  });
  if (run.length) runs.push(run);
  return runs.filter(r => r.length > 1);
}

// Sutherland–Hodgman against the padded frame; good enough for filled land.
function clipPolygon(ring) {
  const edges = [
    p => p[0] >= -pad, p => p[0] <= width + pad, p => p[1] >= -pad, p => p[1] <= height + pad,
  ];
  const cut = [
    (a, b) => { const t = (-pad - a[0]) / (b[0] - a[0]); return [-pad, a[1] + t * (b[1] - a[1])]; },
    (a, b) => { const t = (width + pad - a[0]) / (b[0] - a[0]); return [width + pad, a[1] + t * (b[1] - a[1])]; },
    (a, b) => { const t = (-pad - a[1]) / (b[1] - a[1]); return [a[0] + t * (b[0] - a[0]), -pad]; },
    (a, b) => { const t = (height + pad - a[1]) / (b[1] - a[1]); return [a[0] + t * (b[0] - a[0]), height + pad]; },
  ];
  let output = ring;
  edges.forEach((isIn, k) => {
    const input = output; output = [];
    input.forEach((current, i) => {
      const previous = input[(i + input.length - 1) % input.length];
      if (isIn(current)) {
        if (!isIn(previous)) output.push(cut[k](previous, current));
        output.push(current);
      } else if (isIn(previous)) output.push(cut[k](previous, current));
    });
  });
  return output;
}

const fmt = n => (Math.round(n * 10) / 10).toString().replace(/^(-?)0\./, '$1.');
function pathData(lines, closed = false) {
  return lines.map(points => {
    let d = `M${fmt(points[0][0])} ${fmt(points[0][1])}`;
    let [px, py] = points[0].map(v => Math.round(v * 10) / 10);
    for (const [x, y] of points.slice(1)) {
      const rx = Math.round(x * 10) / 10; const ry = Math.round(y * 10) / 10;
      const dx = rx - px; const dy = ry - py;
      if (!dx && !dy) continue;
      d += `l${fmt(dx)}${dy < 0 ? '' : ' '}${fmt(dy)}`;
      px = rx; py = ry;
    }
    return closed ? `${d}z` : d;
  }).join('');
}

// Joins unordered edges into polylines.
function chain(edges) {
  const key = p => `${p[0]},${p[1]}`;
  const adjacency = new Map();
  edges.forEach((edge, i) => edge.forEach(p => {
    if (!adjacency.has(key(p))) adjacency.set(key(p), []);
    adjacency.get(key(p)).push(i);
  }));
  const used = new Uint8Array(edges.length);
  const lines = [];
  const extend = (line, from) => {
    for (;;) {
      const next = (adjacency.get(key(from)) || []).find(i => !used[i]);
      if (next === undefined) return;
      used[next] = 1;
      const [a, b] = edges[next];
      from = key(a) === key(from) ? b : a;
      line.push(from);
    }
  };
  // Start at line ends first so open borders become single paths.
  const order = [...edges.keys()].sort((a, b) => {
    const degree = i => Math.min(...edges[i].map(p => adjacency.get(key(p)).length));
    return degree(a) - degree(b);
  });
  for (const i of order) {
    if (used[i]) continue;
    used[i] = 1;
    const line = [edges[i][0], edges[i][1]];
    extend(line, edges[i][1]);
    line.reverse();
    extend(line, line[line.length - 1]);
    lines.push(line);
  }
  return lines;
}

async function buildAdministrative() {
  const regions = JSON.parse(await cached('kraje.json', SOURCES.regions));
  const edgeUse = new Map();
  const land = [];
  const regionNames = new Map();
  for (const feature of regions.features) {
    const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
    for (const rings of polygons) for (const ring of rings) {
      const projected = ring.map(project);
      if (!projected.some(p => inside(p, 60))) continue;
      const clipped = clipPolygon(projected);
      if (clipped.length > 2) land.push(simplify(clipped, SIMPLIFY.border));
      ring.forEach((a, i) => {
        const b = ring[i + 1];
        if (!b) return;
        const k = [a.join(), b.join()].sort().join('|');
        const entry = edgeUse.get(k) || { edge: [a, b], regions: [] };
        entry.regions.push(feature.name);
        edgeUse.set(k, entry);
      });
      regionNames.set(feature.name, true);
    }
  }
  const stateEdges = []; const regionEdges = [];
  for (const { edge, regions: owners } of edgeUse.values()) {
    if (!edge.some(p => inside(project(p), 40))) continue;
    (owners.length === 1 ? stateEdges : regionEdges).push(edge);
  }
  const toLines = (edges, tolerance) => chain(edges)
    .flatMap(line => clipLine(line.map(project)))
    .map(line => simplify(line, tolerance));
  return {
    land: pathData(land, true),
    stateBorder: pathData(toLines(stateEdges, SIMPLIFY.border)),
    regionBoundary: pathData(toLines(regionEdges, SIMPLIFY.region)),
    regions: [...regionNames.keys()],
  };
}

const lon2tile = (lon, z) => ((lon + 180) / 360) * 2 ** z;
const lat2tile = (lat, z) => ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * 2 ** z;
const tile2lon = (x, z) => (x / 2 ** z) * 360 - 180;
const tile2lat = (y, z) => (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / 2 ** z))) * 180) / Math.PI;

async function buildContours() {
  const z = TERRAIN_ZOOM;
  const margin = 0.03;
  const x0 = Math.floor(lon2tile(mapFrame.west - margin, z)); const x1 = Math.floor(lon2tile(mapFrame.east + margin, z));
  const y0 = Math.floor(lat2tile(mapFrame.north + margin, z)); const y1 = Math.floor(lat2tile(mapFrame.south - margin, z));
  const cols = (x1 - x0 + 1) * 256; const rows = (y1 - y0 + 1) * 256;
  const grid = new Float64Array(cols * rows);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    const png = PNG.sync.read(await cached(`terrain-${z}-${tx}-${ty}.png`, SOURCES.terrain(z, tx, ty), true));
    for (let py = 0; py < 256; py++) for (let px = 0; px < 256; px++) {
      const o = (py * 256 + px) * 4;
      const elevation = png.data[o] * 256 + png.data[o + 1] + png.data[o + 2] / 256 - 32768;
      grid[((ty - y0) * 256 + py) * cols + (tx - x0) * 256 + px] = elevation;
    }
  }
  const smooth = blur(grid, cols, rows, 3);
  const generator = contours().size([cols, rows]).thresholds(Array.from({ length: 10 }, (_, i) => CONTOUR_MIN + i * CONTOUR_STEP));
  const toLonLat = ([gx, gy]) => [tile2lon(x0 + gx / 256, z), tile2lat(y0 + gy / 256, z)];
  let peak = -Infinity;
  smooth.forEach(v => { if (v > peak) peak = v; });
  return generator(smooth).filter(level => level.coordinates.length).map(level => {
    const lines = level.coordinates.flat()
      .flatMap(ring => clipLine(ring.map(p => project(toLonLat(p)))))
      .map(line => simplify(line, SIMPLIFY.contour))
      .filter(line => line.length > 2 && length(line) > 40);
    return { elevation: level.value, d: pathData(lines) };
  }).filter(level => level.d);
}

const length = line => line.reduce((sum, p, i) => sum + (i ? Math.hypot(p[0] - line[i - 1][0], p[1] - line[i - 1][1]) : 0), 0);

function blur(source, cols, rows, sigma) {
  const radius = Math.ceil(sigma * 3);
  const kernel = Array.from({ length: radius * 2 + 1 }, (_, i) => Math.exp(-((i - radius) ** 2) / (2 * sigma * sigma)));
  const sum = kernel.reduce((a, b) => a + b, 0);
  const pass = (input, horizontal) => {
    const output = new Float64Array(input.length);
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      let value = 0;
      for (let k = -radius; k <= radius; k++) {
        const sx = horizontal ? Math.min(cols - 1, Math.max(0, x + k)) : x;
        const sy = horizontal ? y : Math.min(rows - 1, Math.max(0, y + k));
        value += input[sy * cols + sx] * kernel[k + radius];
      }
      output[y * cols + x] = value / sum;
    }
    return output;
  };
  return pass(pass(source, true), false);
}

const administrative = await buildAdministrative();
const relief = await buildContours();
const file = `// GENERATED by tools/coverage-map/build.mjs — do not edit by hand.
// Geometry is in the coordinate space of mapFrame (src/data/map/frame.ts).
// Sources: ČÚZK INSPIRE Administrative Units (CC BY 4.0) via siwekm/czech-geojson;
// Terrain Tiles on AWS Open Data (Copernicus EU-DEM, USGS SRTM), contours every ${CONTOUR_STEP} m from ${CONTOUR_MIN} m.
// Geography only. This is NOT a service area; see src/data/service-area.ts.

export const landPath = ${JSON.stringify(administrative.land)};
export const stateBorderPath = ${JSON.stringify(administrative.stateBorder)};
export const regionBoundaryPath = ${JSON.stringify(administrative.regionBoundary)};
export const contours: { elevation: number; d: string }[] = ${JSON.stringify(relief, null, 0)};
`;
await writeFile(outFile, file);
console.log(`Wrote ${outFile} (${(file.length / 1024).toFixed(1)} KB), regions: ${administrative.regions.join(', ')}`);
