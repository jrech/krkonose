// Minimal GeoJSON point-in-polygon for service-area zones. Coordinates are [lng, lat] (RFC 7946).

export type Position = [number, number] | [number, number, number];
export interface PolygonGeometry { type: 'Polygon'; coordinates: Position[][] }
export interface MultiPolygonGeometry { type: 'MultiPolygon'; coordinates: Position[][][] }
export type AreaGeometry = PolygonGeometry | MultiPolygonGeometry;

/** Ray casting. Points exactly on an edge may fall either way; zones should not rely on it. */
function inRing(lng: number, lat: number, ring: Position[]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function inPolygon(lng: number, lat: number, rings: Position[][]) {
  const [outer, ...holes] = rings;
  return !!outer && inRing(lng, lat, outer) && !holes.some(hole => inRing(lng, lat, hole));
}

export function containsPoint(geometry: AreaGeometry, lng: number, lat: number) {
  return geometry.type === 'Polygon'
    ? inPolygon(lng, lat, geometry.coordinates)
    : geometry.coordinates.some(polygon => inPolygon(lng, lat, polygon));
}
