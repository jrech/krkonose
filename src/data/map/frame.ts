// Map frame shared by the SVG component and tools/coverage-map/build.mjs.
// Local equirectangular projection scaled by cos(refLat): distances keep their proportions
// across the ~60 km frame (error well under 1 %). Change it only together with a geometry rebuild.
const width = 736;
const height = 536;
const west = 15.2394;
const north = 50.911;
const refLat = 50.697;
const pxPerDegLon = 791.6;
const pxPerDegLat = pxPerDegLon / Math.cos((refLat * Math.PI) / 180);

export const mapFrame = {
  width,
  height,
  west,
  north,
  east: west + width / pxPerDegLon,
  south: north - height / pxPerDegLat,
  refLat,
  pxPerDegLon,
  pxPerDegLat,
};

/** Projects WGS 84 longitude/latitude to SVG user units inside mapFrame. */
export function projectToMap(lon: number, lat: number) {
  return { x: (lon - west) * pxPerDegLon, y: (north - lat) * pxPerDegLat };
}
